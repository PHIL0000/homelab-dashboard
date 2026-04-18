import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";

import type { PageSettingKey } from "./PageSettings/types";
import { ALL_PAGE_KEYS, GROUP_CHILDREN, PAGE_SETTINGS_TREE } from "./PageSettings/config";
import DashboardPageSettings from "./PageSettings/Dashboard/DashboardPageSettings";
import CalendarPageSettings from "./PageSettings/Calendar/CalendarPageSettings";
import HomeAssistantPageSettings from "./PageSettings/HomeAssistant/HomeAssistantPageSettings";
import AiPageSettings from "./PageSettings/AI/AiPageSettings";
import AiChatPageSettings from "./PageSettings/AI/AiChatPageSettings";
import AiImageGenPageSettings from "./PageSettings/AI/AiImageGenPageSettings";
import StoragePageSettings from "./PageSettings/Storage/StoragePageSettings";
import NasPageSettings from "./PageSettings/Storage/NasPageSettings";
import NextcloudPageSettings from "./PageSettings/Storage/NextcloudPageSettings";
import GitlabPageSettings from "./PageSettings/Storage/GitlabPageSettings";
import DocumentationPageSettings from "./PageSettings/Documentation/DocumentationPageSettings";
import DocumentationOverviewPageSettings from "./PageSettings/Documentation/DocumentationOverviewPageSettings";
import DocumentationMapPageSettings from "./PageSettings/Documentation/DocumentationMapPageSettings";
import DocumentationHardwarePageSettings from "./PageSettings/Documentation/DocumentationHardwarePageSettings";
import DocumentationServicesPageSettings from "./PageSettings/Documentation/DocumentationServicesPageSettings";
import DocumentationStoragePageSettings from "./PageSettings/Documentation/DocumentationStoragePageSettings";
import DocumentationDocumentsPageSettings from "./PageSettings/Documentation/DocumentationDocumentsPageSettings";
import PerformancePageSettings from "./PageSettings/Performance/PerformancePageSettings";

type PagesTabProps = {
  selectedPageKey: PageSettingKey;
};

const PAGE_COMPONENTS: Record<PageSettingKey, React.ComponentType<{ visible: boolean; disabled: boolean; onToggle: () => void }>> = {
  "/dashboard": DashboardPageSettings,
  "/calendar": CalendarPageSettings,
  "/home-assistant": HomeAssistantPageSettings,
  "/ai": AiPageSettings,
  "/ai/chat": AiChatPageSettings,
  "/ai/image-gen": AiImageGenPageSettings,
  "/storage": StoragePageSettings,
  "/storage/nas": NasPageSettings,
  "/storage/nextcloud": NextcloudPageSettings,
  "/storage/gitlab": GitlabPageSettings,
  "/documentation": DocumentationPageSettings,
  "/documentation/overview": DocumentationOverviewPageSettings,
  "/documentation/map": DocumentationMapPageSettings,
  "/documentation/hardware": DocumentationHardwarePageSettings,
  "/documentation/services": DocumentationServicesPageSettings,
  "/documentation/storage": DocumentationStoragePageSettings,
  "/documentation/docs": DocumentationDocumentsPageSettings,
  "/performance": PerformancePageSettings,
};

const findParentGroup = (key: PageSettingKey): PageSettingKey | undefined => {
  for (const [groupKey, children] of Object.entries(GROUP_CHILDREN)) {
    if (children?.includes(key)) {
      return groupKey as PageSettingKey;
    }
  }
  return undefined;
};

const findLabelKey = (key: PageSettingKey): string => {
  const stack = [...PAGE_SETTINGS_TREE];
  while (stack.length > 0) {
    const node = stack.pop();
    if (!node) continue;
    if (node.key === key) return node.labelKey;
    if (node.children?.length) {
      stack.push(...node.children);
    }
  }
  return "settings.pages";
};

const isPageVisibilityMap = (value: unknown): value is Record<string, boolean> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  return Object.values(value as Record<string, unknown>).every((entry) => typeof entry === "boolean");
};

const buildVisibilityMap = (rawMap: unknown): Record<PageSettingKey, boolean> => {
  const map: Record<PageSettingKey, boolean> = {} as Record<PageSettingKey, boolean>;

  for (const page of ALL_PAGE_KEYS) {
    map[page] = true;
  }

  if (!isPageVisibilityMap(rawMap)) {
    return map;
  }

  for (const page of ALL_PAGE_KEYS) {
    const value = rawMap[page];
    if (typeof value === "boolean") {
      map[page] = value;
    }
  }

  return map;
};

export default function PagesTab({ selectedPageKey }: PagesTabProps) {
  const { t } = useLanguage();
  const { user, token, updateUser } = useAuth();

  const [pageVisibility, setPageVisibility] = useState<Record<PageSettingKey, boolean>>(() => buildVisibilityMap(user?.pageVisibility));
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    setPageVisibility(buildVisibilityMap(user?.pageVisibility));
  }, [user?.pageVisibility]);

  const selectedPageVisible = useMemo(() => {
    return pageVisibility[selectedPageKey] !== false;
  }, [pageVisibility, selectedPageKey]);

  const selectedPageTitle = useMemo(() => t(findLabelKey(selectedPageKey) as any), [selectedPageKey, t]);

  const SelectedPageComponent = PAGE_COMPONENTS[selectedPageKey];

  const saveVisibility = async (nextMap: Record<PageSettingKey, boolean>) => {
    if (!user || !token) return;

    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch(`http://localhost:3001/api/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ pageVisibility: nextMap }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || t("settings.saveError"));
      }

      updateUser(data);
      setMessage({ type: "success", text: t("settings.saveSuccess") });
      setTimeout(() => setMessage(null), 2500);
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || t("settings.saveError") });
    } finally {
      setIsSaving(false);
    }
  };

  const handleVisibilityToggle = async () => {
    const nextMap = { ...pageVisibility };
    const nextValue = !selectedPageVisible;

    const groupChildren = GROUP_CHILDREN[selectedPageKey];
    if (groupChildren && groupChildren.length > 0) {
      groupChildren.forEach((path) => {
        nextMap[path] = nextValue;
      });
      nextMap[selectedPageKey] = nextValue;
    } else {
      nextMap[selectedPageKey] = nextValue;

      // If a subpage gets enabled, auto-enable its parent group.
      if (nextValue) {
        const parentGroup = findParentGroup(selectedPageKey);
        if (parentGroup) {
          nextMap[parentGroup] = true;
        }
      }
    }

    setPageVisibility(nextMap);
    await saveVisibility(nextMap);
  };

  return (
    <div className="doc-theme-form grid grid-cols-1 gap-6 max-w-3xl">
      <h1 className="text-2xl font-bold mb-2 text-slate-100">{selectedPageTitle}</h1>

      {message && (
        <div
          className={`p-3 rounded-lg mb-4 ${
            message.type === "success"
              ? "bg-green-500/20 text-green-400 border border-green-500/30"
              : "bg-red-500/20 text-red-400 border border-red-500/30"
          }`}
        >
          {message.text}
        </div>
      )}

      <SelectedPageComponent visible={selectedPageVisible} disabled={isSaving} onToggle={handleVisibilityToggle} />
    </div>
  );
}
