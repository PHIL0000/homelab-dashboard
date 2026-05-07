import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import { useState, useEffect, useCallback, useRef } from "react";
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
} from "../../../widgets/types";
import { API_BASE } from '../../../lib/api';

const ResponsiveGrid = WidthProvider(Responsive);

const API = `${API_BASE}/dashboard`;

export default function Dashboard() {
  const { token } = useAuth();
  const [layout, setLayout] = useState<Layout[]>([]);
  const [widgets, setWidgets] = useState<WidgetInstance[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [availableTypes, setAvailableTypes] = useState<CardTypeData[]>([]);
  const [loading, setLoading] = useState(true);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isEditingRef = useRef(false);

  useEffect(() => {
    isEditingRef.current = isEditing;
  }, [isEditing]);

  const headers = useCallback(
    () => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }),
    [token]
  );

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
      setLayout(data.layout as Layout[]);
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

  const saveLayout = useCallback(
    (newLayout: Layout[]) => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(async () => {
        await fetch(`${API}/page/dashboard/layout`, {
          method: "PUT",
          headers: headers(),
          body: JSON.stringify({ layout: newLayout }),
        });
      }, 800);
    },
    [headers]
  );

  const handleLayoutChange = useCallback(
    (newLayout: Layout[]) => {
      setLayout(newLayout);
      if (isEditingRef.current) saveLayout(newLayout);
    },
    [saveLayout]
  );

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
        { id: data.id, cardTypeKey, customTitle: data.customTitle, config: data.config },
      ]);
      setLayout((prev) => [...prev, data.layoutItem as Layout]);
    },
    [headers]
  );

  const removeWidget = useCallback(
    async (widgetId: string) => {
      await fetch(`${API}/widgets/${widgetId}`, {
        method: "DELETE",
        headers: headers(),
      });
      setWidgets((prev) => prev.filter((w) => w.id !== widgetId));
      setLayout((prev) => prev.filter((l) => l.i !== widgetId));
    },
    [headers]
  );

  if (loading) {
    return (
      <div className="page-shell flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm text-default-400">Loading dashboard…</span>
        </div>
      </div>
    );
  }

  const layoutItems = widgets.map((w) => {
    const def = widgetRegistry.get(w.cardTypeKey);
    const item = layout.find((l) => l.i === w.id) ?? {
      i: w.id,
      x: 0,
      y: 0,
      w: def?.defaultW ?? 3,
      h: def?.defaultH ?? 3,
    };
    return { ...item, minW: def?.minW, minH: def?.minH };
  });

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

      <div className="flex-1 overflow-auto px-4 pb-4">
        {widgets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4 text-default-400">
            <LayoutGrid size={48} className="opacity-30" />
            <p className="text-sm">No widgets yet.</p>
            <Button
              size="sm"
              variant="outline"
              onPress={() => { setIsEditing(true); setShowPicker(true); }}
            >
              <Plus size={16} />
              Add your first widget
            </Button>
          </div>
        ) : (
          <div className={isEditing ? "dashboard-editing" : ""}>
            <ResponsiveGrid
              className="layout"
              layouts={{ lg: layoutItems }}
              breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480 }}
              cols={{ lg: 12, md: 10, sm: 6, xs: 4 }}
              rowHeight={80}
              isDraggable={isEditing}
              isResizable={isEditing}
              onLayoutChange={(currentLayout: Layout[]) => handleLayoutChange(currentLayout)}
              margin={[12, 12]}
            >
              {widgets.map((widget) => {
                const def = widgetRegistry.get(widget.cardTypeKey);
                const Component = def?.component;
                return (
                  <div key={widget.id} className="relative" style={{ overflow: "visible" }}>
                    {Component ? (
                      <Component
                        widgetId={widget.id}
                        config={widget.config}
                        isEditing={isEditing}
                      />
                    ) : (
                      <Card className="h-full flex items-center justify-center p-4">
                        <span className="text-default-400 text-sm">
                          Unknown widget: {widget.cardTypeKey}
                        </span>
                      </Card>
                    )}
                    {isEditing && (
                      <button
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={() => removeWidget(widget.id)}
                        className="absolute -top-2 -right-2 z-20 w-5 h-5 rounded-full bg-danger flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
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
