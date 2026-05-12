import type { ComponentType } from "react";
import type { TranslationKey } from "../i18n/translations";

export interface WidgetComponentProps {
  widgetId: string;
  config: Record<string, unknown>;
  isEditing: boolean;
}

export interface WidgetDefinition {
  key: string;
  name: string;
  description: string;
  nameKey?: TranslationKey;
  descriptionKey?: TranslationKey;
  icon?: string;
  defaultW: number;
  defaultH: number;
  minW?: number;
  minH?: number;
  defaultConfig: Record<string, unknown>;
  component: ComponentType<WidgetComponentProps>;
}

export interface WidgetSyncPayload {
  key: string;
  name: string;
  description: string;
  icon?: string;
  defaultW: number;
  defaultH: number;
  minW?: number;
  minH?: number;
  defaultConfig: Record<string, unknown>;
}

export interface WidgetInstance {
  id: string;
  cardTypeKey: string;
  customTitle?: string;
  config: Record<string, unknown>;
}

export interface DashboardData {
  id: string;
  page: string;
  layout: GridLayoutItem[];
  widgets: WidgetInstance[];
}

export interface GridLayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
}

export interface CardTypeData {
  id: string;
  key: string;
  name: string;
  description?: string;
  icon?: string;
  configSchema?: Record<string, unknown>;
}
