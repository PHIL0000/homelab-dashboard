import type { PageSettingKey, PageSettingsNode } from "./types";

export const GROUP_CHILDREN: Partial<Record<PageSettingKey, PageSettingKey[]>> =
  {
    "/ai": ["/ai/chat", "/ai/image-gen"],
    "/storage": ["/storage/nas", "/storage/nextcloud", "/storage/gitlab"],
    "/documentation": [
      "/documentation/overview",
      "/documentation/map",
      "/documentation/hardware",
      "/documentation/services",
      "/documentation/storage",
      "/documentation/docs",
    ],
  };

export const ALL_PAGE_KEYS: PageSettingKey[] = [
  "/dashboard",
  "/calendar",
  "/home-assistant",
  "/ai",
  "/ai/chat",
  "/ai/image-gen",
  "/storage",
  "/storage/nas",
  "/storage/nextcloud",
  "/storage/gitlab",
  "/documentation",
  "/documentation/overview",
  "/documentation/map",
  "/documentation/hardware",
  "/documentation/services",
  "/documentation/storage",
  "/documentation/docs",
  "/performance",
];

export const PAGE_SETTINGS_TREE: PageSettingsNode[] = [
  { key: "/dashboard", labelKey: "nav.dashboard" },
  { key: "/calendar", labelKey: "nav.calendar" },
  { key: "/home-assistant", labelKey: "nav.homeAssistant" },
  {
    key: "/ai",
    labelKey: "nav.ai",
    children: [
      { key: "/ai/chat", labelKey: "nav.ai.chat" },
      { key: "/ai/image-gen", labelKey: "nav.ai.imageGen" },
    ],
  },
  {
    key: "/storage",
    labelKey: "nav.storage",
    children: [
      { key: "/storage/nas", labelKey: "nav.storage.nas" },
      { key: "/storage/nextcloud", labelKey: "nav.storage.nextcloud" },
      { key: "/storage/gitlab", labelKey: "nav.storage.gitlab" },
    ],
  },
  {
    key: "/documentation",
    labelKey: "nav.documentation",
    children: [
      { key: "/documentation/overview", labelKey: "nav.docs.overview" },
      { key: "/documentation/map", labelKey: "nav.docs.map" },
      { key: "/documentation/hardware", labelKey: "nav.docs.hardware" },
      { key: "/documentation/services", labelKey: "nav.docs.services" },
      { key: "/documentation/storage", labelKey: "nav.docs.storage" },
      { key: "/documentation/docs", labelKey: "nav.docs.documents" },
    ],
  },
  { key: "/performance", labelKey: "nav.performance" },
];
