export type PageSettingKey =
  | "/dashboard"
  | "/calendar"
  | "/home-assistant"
  | "/ai"
  | "/ai/chat"
  | "/ai/image-gen"
  | "/storage"
  | "/storage/nas"
  | "/storage/nextcloud"
  | "/storage/gitlab"
  | "/documentation"
  | "/documentation/overview"
  | "/documentation/map"
  | "/documentation/hardware"
  | "/documentation/services"
  | "/documentation/storage"
  | "/documentation/docs"
  | "/performance";

export interface PageSettingsViewProps {
  visible: boolean;
  disabled: boolean;
  onToggle: () => void;
}

export type PageSettingsNode = {
  key: PageSettingKey;
  labelKey: string;
  children?: PageSettingsNode[];
};
