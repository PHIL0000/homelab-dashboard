import type { WidgetDefinition } from "./types";

// Auto-discover all widget_*.tsx files in the widgets directory tree
const modules = import.meta.glob<{ widgetDef: WidgetDefinition }>(
  "./**/widget_*.tsx",
  { eager: true }
);

export const widgetRegistry = new Map<string, WidgetDefinition>();

for (const module of Object.values(modules)) {
  if (module.widgetDef) {
    widgetRegistry.set(module.widgetDef.key, module.widgetDef);
  }
}

export const getWidgetDefinitions = (): WidgetDefinition[] =>
  Array.from(widgetRegistry.values());
