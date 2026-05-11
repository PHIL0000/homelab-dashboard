import type { Layout } from "react-grid-layout";

// ─── Breakpoint-Definitionen ────────────────────────────────────────────────
// Wir messen gegen die ECHTE Container-Breite (via react-grid-layout's
// WidthProvider), nicht gegen window.innerWidth. Dadurch wirkt sich die
// Sidebar (eingeklappt vs. ausgeklappt) korrekt auf den Breakpoint aus.

export type Breakpoint = "lg" | "md" | "sm" | "xs";

export const BREAKPOINTS: Record<Breakpoint, number> = {
  lg: 1200,
  md: 996,
  sm: 768,
  xs: 480,
};

export const COLS: Record<Breakpoint, number> = {
  lg: 12,
  md: 10,
  sm: 6,
  xs: 4,
};

export const BASE_BREAKPOINT: Breakpoint = "lg";
export const BASE_COLS = COLS[BASE_BREAKPOINT];

// Edit / Drag / Resize sind grundsätzlich in JEDEM Breakpoint erlaubt.
// Änderungen unterhalb des base-Breakpoints werden über reprojectChangeToBase
// zurück ins Basislayout projiziert. Falls einmal ein extrem kleiner
// Sonderfall nötig ist, kann hier ein Breakpoint ausgeschlossen werden —
// per Default ist die Liste vollständig.
export const EDITABLE_BREAKPOINTS: Breakpoint[] = ["lg", "md", "sm", "xs"];

// ─── Hilfsfunktionen ────────────────────────────────────────────────────────

export function getContainerBreakpoint(containerWidth: number): Breakpoint {
  if (containerWidth >= BREAKPOINTS.lg) return "lg";
  if (containerWidth >= BREAKPOINTS.md) return "md";
  if (containerWidth >= BREAKPOINTS.sm) return "sm";
  return "xs";
}

export function getEffectiveColumnCount(containerWidth: number): number {
  return COLS[getContainerBreakpoint(containerWidth)];
}

export interface WidgetConstraints {
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
}

// Klemmt Breite/Höhe an die Constraints + die verfügbaren Spalten.
export function normalizeWidgetDimensions(
  item: Layout,
  constraints: WidgetConstraints,
  targetCols: number
): Layout {
  const minW = Math.max(1, constraints.minW ?? 1);
  const minH = Math.max(1, constraints.minH ?? 1);
  const maxW = Math.min(constraints.maxW ?? targetCols, targetCols);
  const maxH = constraints.maxH ?? Infinity;

  const w = Math.min(maxW, Math.max(minW, item.w));
  const h = Math.min(maxH, Math.max(minH, item.h));
  const x = Math.max(0, Math.min(item.x, Math.max(0, targetCols - w)));

  return { ...item, w, h, x, y: Math.max(0, item.y) };
}

// ─── Collision-Resolution via Top-Left-Packing ─────────────────────────────
// Wir sortieren die Items nach (y, x) und platzieren sie deterministisch
// in die nächste freie Stelle. Das gibt ein stabiles, vorhersehbares
// Ergebnis ohne Überlappungen.

function findFreeSpot(
  occupied: Set<string>,
  cols: number,
  startY: number,
  w: number,
  h: number,
  preferredX: number
): { x: number; y: number } {
  const maxX = cols - w;
  for (let y = startY; y < startY + 1000; y++) {
    const xs: number[] = [];
    // Bevorzuge den ursprünglichen x, sonst von links nach rechts
    xs.push(Math.max(0, Math.min(preferredX, maxX)));
    for (let x = 0; x <= maxX; x++) if (x !== xs[0]) xs.push(x);

    for (const x of xs) {
      let fits = true;
      for (let dy = 0; dy < h && fits; dy++) {
        for (let dx = 0; dx < w && fits; dx++) {
          if (occupied.has(`${x + dx}:${y + dy}`)) fits = false;
        }
      }
      if (fits) return { x, y };
    }
  }
  return { x: 0, y: startY };
}

function markOccupied(
  occupied: Set<string>,
  x: number,
  y: number,
  w: number,
  h: number
) {
  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      occupied.add(`${x + dx}:${y + dy}`);
    }
  }
}

export function resolveCollisions(layout: Layout[], cols: number): Layout[] {
  const sorted = [...layout].sort((a, b) => (a.y - b.y) || (a.x - b.x));
  const occupied = new Set<string>();
  const result: Layout[] = [];

  for (const item of sorted) {
    const spot = findFreeSpot(occupied, cols, item.y, item.w, item.h, item.x);
    markOccupied(occupied, spot.x, spot.y, item.w, item.h);
    result.push({ ...item, x: spot.x, y: spot.y });
  }
  return result;
}

// ─── Layout-Ableitung ───────────────────────────────────────────────────────
// Strategie: "place first, shrink only if necessary".
//
//  1. Wir starten IMMER vom unveränderten Basislayout (lg).
//  2. Wir behalten Original-Breite (w) und Original-Höhe (h) bei.
//  3. Wir versuchen, jedes Widget möglichst nahe an seiner Original-x-Position
//     im aktuellen Breakpoint zu platzieren.
//  4. Wenn in einer Zeile kein Platz mehr ist: nächste Zeile — Widget bleibt
//     in Originalbreite. Wir schrumpfen NICHT.
//  5. Schrumpfen passiert NUR, wenn die Original-Breite größer ist als die
//     im Ziel-Breakpoint verfügbaren Spalten (oder als maxW erlaubt).
//
// Kein proportionales Skalieren, kein kumulativer Fehler — beim Zurück-
// wechseln auf lg sind alle Items 1:1 wie im persistierten Basislayout.

function constraintsFor(
  item: Layout,
  registryGet: (key: string) => WidgetConstraints | undefined,
  widgetIdToKey: Map<string, string>
): WidgetConstraints {
  const key = widgetIdToKey.get(item.i);
  const def = key ? registryGet(key) : undefined;
  return {
    minW: item.minW ?? def?.minW,
    minH: item.minH ?? def?.minH,
    maxW: item.maxW ?? def?.maxW,
    maxH: item.maxH ?? def?.maxH,
  };
}

// Berechnet die effektive Breite eines Widgets in einem Ziel-Breakpoint.
// Originalbreite wird gehalten — nur reduziert, wenn sie schlicht nicht in
// die Container-Spalten oder maxW passt.
function effectiveWidthFor(
  item: Layout,
  c: WidgetConstraints,
  targetCols: number
): number {
  const minW = Math.max(1, c.minW ?? 1);
  const maxW = Math.min(c.maxW ?? targetCols, targetCols);
  // Original w respektieren, an min/max klemmen.
  return Math.min(maxW, Math.max(minW, item.w));
}

export function deriveResponsiveLayout(
  baseLayout: Layout[],
  targetCols: number,
  constraintsOf: (item: Layout) => WidgetConstraints
): Layout[] {
  // Reading order: oben-links nach unten-rechts — das ist die logische
  // Sortierung des User-Layouts und bestimmt, in welcher Reihenfolge wir
  // Widgets ins responsive Layout einsetzen.
  const sorted = [...baseLayout].sort((a, b) => a.y - b.y || a.x - b.x);

  const occupied = new Set<string>();
  const result: Layout[] = [];

  for (const item of sorted) {
    const c = constraintsOf(item);
    const w = effectiveWidthFor(item, c, targetCols);
    const minH = Math.max(1, c.minH ?? 1);
    const h = Math.max(minH, item.h);

    // Bevorzugt die Original-x-Position des Users — clamped an den
    // Container, damit das Widget hineinpasst.
    const preferredX = Math.max(0, Math.min(item.x, targetCols - w));

    // Sucht den ersten passenden freien Platz, beginnend bei y=0.
    // Reihenfolge: zuerst preferredX in y=0, dann andere x in y=0,
    // dann y=1 usw. → Widget bleibt so weit oben wie möglich, ohne
    // andere Widgets zu überdecken. Wenn keine x-Position in der
    // aktuellen Zeile passt, bricht es automatisch in die nächste Zeile.
    const spot = findFreeSpot(occupied, targetCols, 0, w, h, preferredX);

    markOccupied(occupied, spot.x, spot.y, w, h);
    result.push({
      ...item,
      x: spot.x,
      y: spot.y,
      w,
      h,
    });
  }

  return result;
}

// ─── Insertion: neues Widget unten rechts anhängen ─────────────────────────
//
// Strategie:
//  1. Bestimme die unterste belegte Zeile (= maximales item.y im Layout).
//  2. Versuche, das Widget RECHTS in dieser Zeile zu platzieren — von
//     ganz rechts (x = cols - w) nach links durchgehen, ersten freien
//     Slot nehmen.
//  3. Wenn dort gar kein Platz mehr ist: neue Zeile darunter eröffnen
//     (y = unterste belegte Zeile + max(item.h) der dort liegenden Items),
//     Widget rechtsbündig einfügen.

export function findBottomRightInsertionPosition(
  layout: Layout[],
  size: { w: number; h: number },
  cols: number
): { x: number; y: number } {
  const w = Math.max(1, Math.min(size.w, cols));
  const h = Math.max(1, size.h);

  if (layout.length === 0) {
    return { x: Math.max(0, cols - w), y: 0 };
  }

  // Belegungsraster + tiefste Zeile + bottom edge bestimmen.
  const occupied = new Set<string>();
  let bottomRowY = 0; // tiefstes item.y (Top-Kante der untersten Zeile)
  let maxBottom = 0; // tiefste belegte Zelle (Bottom-Kante)
  for (const it of layout) {
    bottomRowY = Math.max(bottomRowY, it.y);
    maxBottom = Math.max(maxBottom, it.y + it.h);
    for (let dy = 0; dy < it.h; dy++) {
      for (let dx = 0; dx < it.w; dx++) {
        occupied.add(`${it.x + dx}:${it.y + dy}`);
      }
    }
  }

  // 1) Versuch: in der untersten existierenden Zeile, so weit rechts
  //    wie möglich. Wir prüfen den ganzen h-Block ab bottomRowY.
  for (let x = cols - w; x >= 0; x--) {
    let fits = true;
    for (let dy = 0; dy < h && fits; dy++) {
      for (let dx = 0; dx < w && fits; dx++) {
        if (occupied.has(`${x + dx}:${bottomRowY + dy}`)) fits = false;
      }
    }
    if (fits) return { x, y: bottomRowY };
  }

  // 2) Fallback: neue Zeile DARUNTER, rechtsbündig.
  //    "Darunter" = unterhalb aller belegten Zellen, nicht nur unterhalb
  //    der Top-Kante der untersten Zeile.
  return { x: Math.max(0, cols - w), y: maxBottom };
}

// Hängt ein neues Item ans Ende des Layouts (unten rechts) an. Falls die
// Caller-Routine bereits x/y gesetzt hat, werden diese durch die berechnete
// Position überschrieben — das Backend kann ruhig y: Infinity senden.
export function appendWidgetToEnd(
  layout: Layout[],
  newItem: Layout,
  cols: number = BASE_COLS
): Layout[] {
  const pos = findBottomRightInsertionPosition(
    layout,
    { w: newItem.w, h: newItem.h },
    cols
  );
  return [...layout, { ...newItem, x: pos.x, y: pos.y }];
}

// ─── Rückprojektion: Edit in non-base-Breakpoint → base ────────────────────
// Wenn der User in einem schmaleren Breakpoint editiert, müssen wir die
// Änderung ins persistierte lg-Layout zurückübersetzen. Wir machen das
// pro-Item (nur das Item, das der User explizit bewegt/resized hat).
//
// x und w werden mit dem Spalten-Verhältnis skaliert; y und h werden 1:1
// übernommen (Zeilenhöhe ist breakpoint-unabhängig).
export function reprojectChangeToBase(
  changedItem: Layout,
  fromCols: number,
  toCols: number,
  constraints: WidgetConstraints
): { x: number; y: number; w: number; h: number } {
  if (fromCols === toCols) {
    return {
      x: changedItem.x,
      y: changedItem.y,
      w: changedItem.w,
      h: changedItem.h,
    };
  }

  const ratio = toCols / fromCols;
  const minW = Math.max(1, constraints.minW ?? 1);
  const maxW = Math.min(constraints.maxW ?? toCols, toCols);
  const minH = Math.max(1, constraints.minH ?? 1);

  const w = Math.min(maxW, Math.max(minW, Math.round(changedItem.w * ratio)));
  const x = Math.max(0, Math.min(toCols - w, Math.round(changedItem.x * ratio)));
  const h = Math.max(minH, changedItem.h);

  return { x, y: Math.max(0, changedItem.y), w, h };
}

// Convenience: erzeugt das vollständige Layouts-Objekt für RGL aus dem
// einen Basislayout. Damit hat RGL nie Grund, selbst zu generieren.
export function deriveAllResponsiveLayouts(
  baseLayout: Layout[],
  widgetIdToKey: Map<string, string>,
  registryGet: (key: string) => WidgetConstraints | undefined
): Record<Breakpoint, Layout[]> {
  const constraintsOf = (item: Layout) =>
    constraintsFor(item, registryGet, widgetIdToKey);

  return {
    lg: deriveResponsiveLayout(baseLayout, COLS.lg, constraintsOf),
    md: deriveResponsiveLayout(baseLayout, COLS.md, constraintsOf),
    sm: deriveResponsiveLayout(baseLayout, COLS.sm, constraintsOf),
    xs: deriveResponsiveLayout(baseLayout, COLS.xs, constraintsOf),
  };
}

// Falls jemand das Basislayout zwischenzeitlich korrumpiert hat (z. B.
// Items mit ungültigen Koordinaten aus der DB), bauen wir es sauber neu auf.
export function restoreDesktopLayout(baseLayout: Layout[]): Layout[] {
  return resolveCollisions(
    baseLayout.map((item) =>
      normalizeWidgetDimensions(item, {}, BASE_COLS)
    ),
    BASE_COLS
  );
}
