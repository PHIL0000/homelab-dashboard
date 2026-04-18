import React, { useState } from "react";
import { Button } from "@heroui/react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { ChevronDown } from "lucide-react";

import GeneralTab from "./tabs/GeneralTab";
import PagesTab from "./tabs/PagesTab";
import AppearanceTab from "./tabs/AppearanceTab";
import NotificationsTab from "./tabs/NotificationsTab";
import AdvancedTab from "./tabs/AdvancedTab";
import UsersTab from "./tabs/UsersTab";
import { PAGE_SETTINGS_TREE } from "./tabs/PageSettings/config";
import type { PageSettingKey, PageSettingsNode } from "./tabs/PageSettings/types";

type SettingsTabId = "general" | "pages" | "appearance" | "notifications" | "users" | "advanced";

type TabBoundaryProps = {
  children: React.ReactNode;
  tab: SettingsTabId;
};

type TabBoundaryState = {
  hasError: boolean;
};

class SettingsTabBoundary extends React.Component<TabBoundaryProps, TabBoundaryState> {
  constructor(props: TabBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): TabBoundaryState {
    return { hasError: true };
  }

  componentDidUpdate(prevProps: TabBoundaryProps) {
    if (prevProps.tab !== this.props.tab && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 rounded-lg border border-red-500/40 bg-red-500/10 text-red-300">
          Dieser Settings-Tab konnte nicht geladen werden.
        </div>
      );
    }

    return this.props.children;
  }
}

export default function Settings() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTabId>("general");
  const [pagesExpanded, setPagesExpanded] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    "/ai": false,
    "/storage": false,
    "/documentation": false,
  });
  const [selectedPageKey, setSelectedPageKey] = useState<PageSettingKey>("/dashboard");

  const tabTitles: Record<SettingsTabId, string> = {
    general: t("settings.general"),
    pages: t("settings.pages"),
    appearance: t("settings.appearance"),
    notifications: t("settings.notifications"),
    users: t("settings.users") || "Users",
    advanced: t("settings.advanced")
  };

  const tabDescriptions: Record<SettingsTabId, string> = {
    general: t("settings.general.desc"),
    pages: t("settings.pages.desc"),
    appearance: t("settings.appearance.desc"),
    notifications: t("settings.notifications.desc"),
    users: t("settings.users.desc") || "Manage and create user accounts",
    advanced: t("settings.advanced.desc")
  };

  const tabButtonClass = (tabId: SettingsTabId) =>
    `w-full justify-start px-4 py-2 rounded-lg transition-all ${
      activeTab === tabId
        ? "bg-[color-mix(in_srgb,var(--color-primary)_24%,transparent)] text-text font-medium border-l-2 border-primary"
        : "text-slate-400 hover:text-slate-100 hover:bg-slate-700/30"
    }`;

  const pageItemClass = (pageKey: PageSettingKey) =>
    `w-full justify-start rounded-lg transition-all ${
      activeTab === "pages" && selectedPageKey === pageKey
        ? "bg-[color-mix(in_srgb,var(--color-primary)_24%,transparent)] text-text font-medium border-l-2 border-primary"
        : "text-slate-400 hover:text-slate-100 hover:bg-slate-700/30"
    }`;

  const openPagesSection = () => {
    // Nur das Auf- und Zuklappen der Unterseiten steuern, nicht das Tab wechseln
    setPagesExpanded((prev) => !prev);
  };

  const openPageSettings = (pageKey: PageSettingKey) => {
    setActiveTab("pages");
    setSelectedPageKey(pageKey);
  };

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups((prev) => ({ ...prev, [groupKey]: !prev[groupKey] }));
  };

  const renderPageNode = (node: PageSettingsNode, depth = 0) => {
    const hasChildren = !!node.children?.length;
    const isExpanded = expandedGroups[node.key] ?? false;

    return (
      <div key={node.key} className="space-y-1">
        <div className="flex items-center gap-1">
          <Button
            onClick={() => openPageSettings(node.key)}
            className={`${pageItemClass(node.key)} ${depth > 0 ? "text-sm" : ""}`}
            variant="ghost"
          >
            {t(node.labelKey as any)}
          </Button>

          {hasChildren && (
            <Button
              onClick={() => toggleGroup(node.key)}
              isIconOnly
              className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-700/30"
              variant="ghost"
              aria-label={isExpanded ? t("settings.collapse") : t("settings.expand")}
            >
              <ChevronDown size={14} className={`transition-transform ${isExpanded ? "rotate-180" : ""}`} />
            </Button>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="ml-3 space-y-1 border-l border-slate-700/40 pl-2">
            {node.children!.map((child) => renderPageNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="doc-theme-form flex h-[80vh] overflow-hidden rounded-3xl bg-slate-900/30">
      <div className="w-64 border-r border-slate-700/50 bg-slate-900/50 p-4 shrink-0 overflow-y-auto hidden md:block">
        <h2 className="text-xl font-bold mb-6 text-slate-100 px-2">{t("settings.title")}</h2>
        <nav className="space-y-1">
          <Button onClick={() => setActiveTab("general")} className={tabButtonClass("general")} variant="ghost">
            {t("settings.general")}
          </Button>
          <Button onClick={openPagesSection} className={tabButtonClass("pages")} variant="ghost">
            <div className="w-full flex items-center justify-between">
              <span>{t("settings.pages")}</span>
              <ChevronDown size={16} className={`transition-transform ${pagesExpanded ? "rotate-180" : ""}`} />
            </div>
          </Button>

          {pagesExpanded && (
            <div className="ml-4 mt-1 space-y-1 border-l border-slate-700/50 pl-2">
              {PAGE_SETTINGS_TREE.map((node) => renderPageNode(node))}
            </div>
          )}
          <Button onClick={() => setActiveTab("appearance")} className={tabButtonClass("appearance")} variant="ghost">
            {t("settings.appearance")}
          </Button>
          <Button onClick={() => setActiveTab("notifications")} className={tabButtonClass("notifications")} variant="ghost">
            {t("settings.notifications")}
          </Button>

          {user?.role === "ADMIN" && (
            <>
              <Button onClick={() => setActiveTab("users")} className={tabButtonClass("users")} variant="ghost">
                {t("settings.users") || "Users"}
              </Button>
              <Button onClick={() => setActiveTab("advanced")} className={tabButtonClass("advanced")} variant="ghost">
                {t("settings.advanced")}
              </Button>
            </>
          )}
        </nav>
      </div>

      <div className="flex-1 p-4 md:p-6 overflow-y-auto">
        <div className="mb-5 pb-3 border-b border-slate-700/50">
          <h1 className="text-2xl font-bold mb-1 text-text">{tabTitles[activeTab]}</h1>
          <p className="text-sm text-slate-400">{tabDescriptions[activeTab]}</p>
        </div>

        <SettingsTabBoundary tab={activeTab}>
          {activeTab === "general" && <GeneralTab />}
          {activeTab === "pages" && <PagesTab selectedPageKey={selectedPageKey} />}
          {activeTab === "appearance" && <AppearanceTab />}
          {activeTab === "notifications" && <NotificationsTab />}
          {activeTab === "users" && user?.role === "ADMIN" && <UsersTab />}
          {activeTab === "advanced" && user?.role === "ADMIN" && <AdvancedTab />}
        </SettingsTabBoundary>
      </div>
    </div>
  );
}
