import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Layout } from "react-grid-layout";
import {
  BASE_BREAKPOINT,
  BASE_COLS,
  BREAKPOINTS,
  COLS,
  EDITABLE_BREAKPOINTS,
  type Breakpoint,
  type WidgetConstraints,
  deriveAllResponsiveLayouts,
  getContainerBreakpoint,
} from "./layoutDerivation";

interface Options {
  baseLayout: Layout[];
  widgetIdToKey: Map<string, string>;
  registryGet: (key: string) => WidgetConstraints | undefined;
}

interface DashboardLayoutState {
  layouts: Record<Breakpoint, Layout[]>;
  breakpoints: typeof BREAKPOINTS;
  cols: typeof COLS;
  currentBreakpoint: Breakpoint;
  currentCols: number;
  isEditableBreakpoint: boolean;
  containerRef: (node: HTMLElement | null) => void;
  onBreakpointChange: (bp: string) => void;
}

// ─── Hook: useResponsiveDashboardLayout ─────────────────────────────────────
//
// Verantwortlichkeiten:
//  - leitet aus dem persistierten Basislayout (lg) deterministisch die
//    Layouts für md/sm/xs ab — gecacht via useMemo.
//  - misst die ECHTE Container-Breite via ResizeObserver, statt sich auf
//    window.innerWidth zu verlassen (Sidebar wird so korrekt eingerechnet).
//  - meldet den aktuellen Breakpoint und ob editierbar ist.
//
// Wichtig: dieser Hook ändert NIE das Basislayout. Persistenz passiert
// ausschließlich im Drag-/Resize-Stop-Handler der Dashboard-Komponente.

export function useResponsiveDashboardLayout({
  baseLayout,
  widgetIdToKey,
  registryGet,
}: Options): DashboardLayoutState {
  // ─── Container-Messung ────────────────────────────────────────────────────
  const containerElRef = useRef<HTMLElement | null>(null);
  const observerRef = useRef<ResizeObserver | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(() =>
    typeof window === "undefined" ? BREAKPOINTS.lg : window.innerWidth
  );

  // rAF-throttling: vermeidet Layout-Thrashing bei kontinuierlichem Resize.
  const rafIdRef = useRef<number | null>(null);

  const containerRef = useCallback((node: HTMLElement | null) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
    containerElRef.current = node;
    if (!node) return;

    setContainerWidth(node.getBoundingClientRect().width);

    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const w = entry.contentRect.width;
      if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = requestAnimationFrame(() => {
        setContainerWidth((prev) => (Math.abs(prev - w) > 1 ? w : prev));
      });
    });
    ro.observe(node);
    observerRef.current = ro;
  }, []);

  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, []);

  // ─── Breakpoint-Tracking ──────────────────────────────────────────────────
  // RGL feuert onBreakpointChange beim internen Wechsel — wir spiegeln das,
  // damit wir 'isEditableBreakpoint' korrekt setzen können.
  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint>(
    () => getContainerBreakpoint(containerWidth)
  );

  useEffect(() => {
    const bp = getContainerBreakpoint(containerWidth);
    setCurrentBreakpoint((prev) => (prev === bp ? prev : bp));
  }, [containerWidth]);

  const onBreakpointChange = useCallback((bp: string) => {
    if (bp === "lg" || bp === "md" || bp === "sm" || bp === "xs") {
      setCurrentBreakpoint(bp);
    }
  }, []);

  // ─── Layout-Ableitung ─────────────────────────────────────────────────────
  // Wir leiten alle Breakpoint-Layouts aus dem einen Basislayout ab.
  // Memoization-Key: baseLayout-Identität + Anzahl der Widgets.
  // Solange baseLayout dieselbe Referenz hat, ist diese Ableitung gratis.
  const layouts = useMemo(
    () => deriveAllResponsiveLayouts(baseLayout, widgetIdToKey, registryGet),
    [baseLayout, widgetIdToKey, registryGet]
  );

  // Edit ist jetzt in jedem Breakpoint erlaubt — siehe EDITABLE_BREAKPOINTS
  // in layoutDerivation.ts. Wir reichen das Flag trotzdem durch, damit
  // ein konkretes UI-Detail (z. B. extrem kleines Sonder-Setup) später
  // gezielt einen Breakpoint ausschließen kann, ohne die ganze Pipeline
  // umzuhängen.
  const isEditableBreakpoint = EDITABLE_BREAKPOINTS.includes(currentBreakpoint);

  return {
    layouts,
    breakpoints: BREAKPOINTS,
    cols: COLS,
    currentBreakpoint,
    currentCols: COLS[currentBreakpoint] ?? BASE_COLS,
    isEditableBreakpoint,
    containerRef,
    onBreakpointChange,
  };
}

export { BASE_BREAKPOINT, BASE_COLS };
