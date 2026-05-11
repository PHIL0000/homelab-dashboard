import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import type { Layout } from "react-grid-layout";
import { Button, Card } from "@heroui/react";
import { LayoutGrid, Lock, Unlock, Plus, X } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { widgetRegistry, getWidgetDefinitions } from "../../../widgets/registry";
import type {
  DashboardData,
  WidgetInstance,
  CardTypeData,
  WidgetDefinition,
} from "../../../widgets/types";
import { API_BASE } from "../../../lib/api";
import {
  useResponsiveDashboardLayout,
  BASE_BREAKPOINT,
  BASE_COLS,
} from "./useResponsiveDashboardLayout";
import {
  appendWidgetToEnd,
  reprojectChangeToBase,
  validateAndLoadLayout,
} from "./layoutDerivation";

const ResponsiveGrid = WidthProvider(Responsive);
const API = `${API_BASE}/dashboard`;

const ROW_HEIGHT = 80;
const GRID_MARGIN: [number, number] = [12, 12];

// Widget-Actions (Edit/Drag/Resize/Remove) sind grundsätzlich immer
// verfügbar, sobald der Edit-Mode aktiv ist — UNABHÄNGIG vom Breakpoint.
// Falls einmal ein extrem kleiner Sonderfall ausgeschlossen werden muss,
// kann das hier zentral entschieden werden (z. B. containerWidth < 320).
function shouldEnableWidgetActions(isEditing: boolean): boolean {
  return isEditing;
}

export default function Dashboard() {
  const { token } = useAuth();

  // ─── Persisted state (single source of truth) ──────────────────────────
  // baseLayout ist das User-Layout für 'lg' (12 cols). Alle responsiven
  // Layouts werden daraus deterministisch abgeleitet. baseLayout wird
  // ausschließlich durch User-Aktionen im Edit-Mode mutiert — niemals
  // durch Resize-Events.
  const [baseLayout, setBaseLayout] = useState<Layout[]>([]);
  const [widgets, setWidgets] = useState<WidgetInstance[]>([]);

  const [isEditing, setIsEditing] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [availableTypes, setAvailableTypes] = useState<CardTypeData[]>([]);
  const [loading, setLoading] = useState(true);

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const headers = useCallback(
    () => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }),
    [token]
  );

  // ─── Widget-Mapping (für Constraint-Lookups) ───────────────────────────
  const widgetIdToKey = useMemo(() => {
    const map = new Map<string, string>();
    for (const w of widgets) map.set(w.id, w.cardTypeKey);
    return map;
  }, [widgets]);

  const registryGet = useCallback(
    (key: string): WidgetDefinition | undefined => widgetRegistry.get(key),
    []
  );

  // ─── Derived responsive layouts ────────────────────────────────────────
  const {
    layouts,
    cols,
    breakpoints,
    currentBreakpoint,
    currentCols,
    containerRef,
    onBreakpointChange,
  } = useResponsiveDashboardLayout({
    baseLayout,
    widgetIdToKey,
    registryGet,
  });

  // Edit / Drag / Resize sind in JEDEM Breakpoint erlaubt. Änderungen in
  // einem kleineren Breakpoint werden auf das base-Layout (lg) zurück-
  // projiziert, damit es die einzige Quelle der Wahrheit bleibt.
  // (siehe shouldEnableWidgetActions weiter unten)
  const canEdit = shouldEnableWidgetActions(isEditing);

  // ─── API: Synchronisation ──────────────────────────────────────────────
  const syncWidgets = useCallback(async () => {
    const defs = getWidgetDefinitions().map((d) => ({
      key: d.key,
      name: d.name,
      description: d.description,
      icon: d.icon,
      defaultW: d.defaultW,
      defaultH: d.defaultH,
      minW: d.minW,
      minH: d.minH,
      defaultConfig: d.defaultConfig,
    }));
    await fetch(`${API}/sync-widgets`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ widgets: defs }),
    });
  }, [headers]);

  const loadDashboard = useCallback(async () => {
    const res = await fetch(`${API}/page/dashboard`, { headers: headers() });
    if (!res.ok) return;
    const data: DashboardData | null = await res.json();
    if (data) {
      // Das persistierte Layout ist die einzige Quelle der Wahrheit. Wir
      // setzen es UNVERÄNDERT — validateAndLoadLayout greift nur ein, wenn
      // einzelne Felder korrupt sind (NaN, null, undefined, falscher Typ).
      // Keine Kollisionsauflösung, kein Compacten, kein Schrumpfen.
      setBaseLayout(validateAndLoadLayout(data.layout));
      setWidgets(data.widgets);
    }
  }, [headers]);

  const loadWidgetTypes = useCallback(async () => {
    const res = await fetch(`${API}/widget-types`, { headers: headers() });
    if (res.ok) setAvailableTypes(await res.json());
  }, [headers]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await syncWidgets();
      await Promise.all([loadDashboard(), loadWidgetTypes()]);
      setLoading(false);
    })();
  }, [syncWidgets, loadDashboard, loadWidgetTypes]);

  // ─── Persistenz ────────────────────────────────────────────────────────
  // Wir persistieren ausschließlich das Basislayout (lg). Debounce, damit
  // Drag/Resize-Bursts nicht jeden Frame ans Backend gehen.
  const persistBaseLayout = useCallback(
    (next: Layout[]) => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(async () => {
        await fetch(`${API}/page/dashboard/layout`, {
          method: "PUT",
          headers: headers(),
          body: JSON.stringify({ layout: next }),
        });
      }, 800);
    },
    [headers]
  );

  // ─── User-Aktion: Drag/Resize abgeschlossen ────────────────────────────
  // Diese Handler sind die einzige Stelle, an der das Basislayout mutiert
  // wird. Sie feuern ausschließlich nach einer expliziten User-Aktion —
  // niemals durch Resize/Breakpoint-Wechsel.
  //
  // Verhalten je Breakpoint:
  //  - base (lg): vollständige 1:1-Übernahme des kompletten Layouts.
  //  - md/sm/xs: NUR das geänderte Item wird via reprojectChangeToBase
  //    auf 12 Spalten zurück übersetzt. Die übrigen Items im base bleiben
  //    unangetastet, damit kein "Drift" durchs derive→reproject→derive
  //    entsteht.
  const commitUserLayoutChange = useCallback(
    (newCurrentLayout: Layout[], _oldItem: Layout, newItem: Layout) => {
      if (!canEdit || !newItem) return;

      if (currentBreakpoint === BASE_BREAKPOINT) {
        const cleaned = newCurrentLayout.map<Layout>((it) => ({
          i: it.i,
          x: it.x,
          y: it.y,
          w: it.w,
          h: it.h,
        }));
        setBaseLayout(cleaned);
        persistBaseLayout(cleaned);
        return;
      }

      // Non-base: Rückprojektion für genau dieses Item.
      const key = widgetIdToKey.get(newItem.i);
      const def = key ? widgetRegistry.get(key) : undefined;
      const projected = reprojectChangeToBase(
        newItem,
        currentCols,
        BASE_COLS,
        { minW: def?.minW, minH: def?.minH }
      );

      setBaseLayout((prev) => {
        const next = prev.map((it) =>
          it.i === newItem.i
            ? { ...it, x: projected.x, y: projected.y, w: projected.w, h: projected.h }
            : it
        );
        persistBaseLayout(next);
        return next;
      });
    },
    [canEdit, currentBreakpoint, currentCols, widgetIdToKey, persistBaseLayout]
  );

  // ─── Widget hinzufügen / entfernen ─────────────────────────────────────
  // Neue Widgets werden IMMER unten rechts ans Layout angehängt — nicht
  // dahin, wo das Backend sie evtl. mit y:Infinity vorschlägt. Die finale
  // Position berechnet findBottomRightInsertionPosition aus dem aktuellen
  // base-Layout: erst nach freiem Platz in der untersten Zeile rechts
  // suchen, sonst neue Zeile darunter.
  const addWidget = useCallback(
    async (cardTypeKey: string) => {
      setShowPicker(false);
      const res = await fetch(`${API}/page/dashboard/widgets`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ cardTypeKey }),
      });
      if (!res.ok) return;
      const data = await res.json();

      setWidgets((prev) => [
        ...prev,
        {
          id: data.id,
          cardTypeKey,
          customTitle: data.customTitle,
          config: data.config,
        },
      ]);

      // Append-Logik: backend-Position ignorieren, deterministisch
      // unten rechts einfügen.
      setBaseLayout((prev) => {
        const incoming = data.layoutItem as Layout;
        const next = appendWidgetToEnd(prev, incoming, BASE_COLS);
        persistBaseLayout(next);
        return next;
      });
    },
    [headers, persistBaseLayout]
  );

  const removeWidget = useCallback(
    async (widgetId: string) => {
      await fetch(`${API}/widgets/${widgetId}`, {
        method: "DELETE",
        headers: headers(),
      });
      setWidgets((prev) => prev.filter((w) => w.id !== widgetId));
      setBaseLayout((prev) => prev.filter((l) => l.i !== widgetId));
    },
    [headers]
  );

  // ─── Render ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="page-shell flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg
            className="animate-spin h-8 w-8 text-primary"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <span className="text-sm text-default-400">Loading dashboard…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="page-header">
        <div className="flex items-center gap-2">
          <LayoutGrid size={20} className="text-primary" />
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">Your personal widget board</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEditing && (
            <Button
              size="sm"
              variant="outline"
              onPress={() => setShowPicker(true)}
            >
              <Plus size={16} />
              Add Widget
            </Button>
          )}
          <Button
            size="sm"
            variant={isEditing ? "primary" : "ghost"}
            onPress={() => setIsEditing((v) => !v)}
          >
            {isEditing ? <Unlock size={16} /> : <Lock size={16} />}
            {isEditing ? "Done" : "Edit"}
          </Button>
        </div>
      </div>

      <div className="dashboard-scroll-area flex-1 overflow-auto px-4 pb-4">
        {widgets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4 text-default-400">
            <LayoutGrid size={48} className="opacity-30" />
            <p className="text-sm">No widgets yet.</p>
            <Button
              size="sm"
              variant="outline"
              onPress={() => {
                setIsEditing(true);
                setShowPicker(true);
              }}
            >
              <Plus size={16} />
              Add your first widget
            </Button>
          </div>
        ) : (
          <div
            ref={containerRef as (el: HTMLDivElement | null) => void}
            className={`dashboard-grid-container ${canEdit ? "dashboard-editing" : ""}`}
            data-breakpoint={currentBreakpoint}
          >
            <ResponsiveGrid
              className="layout"
              layouts={layouts}
              breakpoints={breakpoints}
              cols={cols}
              rowHeight={ROW_HEIGHT}
              margin={GRID_MARGIN}
              isDraggable={canEdit}
              isResizable={canEdit}
              compactType="vertical"
              preventCollision={false}
              // Wichtig: KEIN onLayoutChange für Persistenz. RGL feuert das
              // auch bei Resize/Breakpoint-Wechsel — würden wir hier setzen,
              // überschreiben wir das User-Layout mit einer Ableitung.
              onBreakpointChange={onBreakpointChange}
              onDragStop={(layout, oldItem, newItem) =>
                commitUserLayoutChange(layout, oldItem, newItem)
              }
              onResizeStop={(layout, oldItem, newItem) =>
                commitUserLayoutChange(layout, oldItem, newItem)
              }
              // useCSSTransforms ist default true — gut für Performance.
              draggableCancel=".widget-no-drag"
            >
              {widgets.map((widget) => {
                const def = widgetRegistry.get(widget.cardTypeKey);
                const Component = def?.component;
                return (
                  <div key={widget.id} className="dashboard-widget-shell">
                    <div className="dashboard-widget-content">
                      {Component ? (
                        <Component
                          widgetId={widget.id}
                          config={widget.config}
                          isEditing={canEdit}
                        />
                      ) : (
                        <Card className="h-full flex items-center justify-center p-4">
                          <span className="text-default-400 text-sm">
                            Unknown widget: {widget.cardTypeKey}
                          </span>
                        </Card>
                      )}
                    </div>
                    {canEdit && (
                      <button
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={() => removeWidget(widget.id)}
                        className="widget-remove-btn widget-no-drag"
                        title="Widget entfernen"
                      >
                        <X size={10} className="text-white" />
                      </button>
                    )}
                  </div>
                );
              })}
            </ResponsiveGrid>
          </div>
        )}
      </div>

      {/* Widget picker */}
      {showPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-background rounded-3xl w-full max-w-lg max-h-[80vh] overflow-y-auto relative shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-[color-mix(in_srgb,var(--color-primary)_20%,transparent)]">
            <div className="flex items-center justify-between p-6 pb-4">
              <h2 className="text-lg font-semibold">Add Widget</h2>
              <Button
                onPress={() => setShowPicker(false)}
                isIconOnly
                variant="ghost"
                size="sm"
              >
                <X size={18} />
              </Button>
            </div>
            <div className="px-6 pb-6">
              {availableTypes.length === 0 ? (
                <p className="text-default-400 text-sm text-center py-8">
                  No widgets registered yet.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {availableTypes.map((type) => {
                    const localDef = widgetRegistry.get(type.key);
                    return (
                      <button
                        key={type.id}
                        onClick={() => addWidget(type.key)}
                        className="text-left p-4 rounded-xl border border-default-200 hover:border-primary hover:bg-primary/5 transition-colors"
                      >
                        <p className="font-medium text-sm">{type.name}</p>
                        {type.description && (
                          <p className="text-xs text-default-400 mt-1 line-clamp-2">
                            {type.description}
                          </p>
                        )}
                        {localDef && (
                          <p className="text-xs text-default-300 mt-2">
                            {localDef.defaultW}×{localDef.defaultH} default size
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
