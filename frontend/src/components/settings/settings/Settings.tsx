import React, { useRef, useState } from "react";
import { Alert, Button } from "@heroui/react";
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
import type {
  PageSettingKey,
  PageSettingsNode,
} from "./tabs/PageSettings/types";

type SettingsTabId =
  | "general"
  | "pages"
  | "appearance"
  | "notifications"
  | "users"
  | "advanced";

type TabBoundaryProps = {
  children: React.ReactNode;
  tab: SettingsTabId;
};

type TabBoundaryState = {
  hasError: boolean;
};

class SettingsTabBoundary extends React.Component<
  TabBoundaryProps,
  TabBoundaryState
> {
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
        <Alert status="danger">
          <Alert.Content>
            <Alert.Description>
              Dieser Settings-Tab konnte nicht geladen werden.
            </Alert.Description>
          </Alert.Content>
        </Alert>
      );
    }

    return this.props.children;
  }
}

export default function Settings() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTabId>("general");
  const tabSaveRef = useRef<(() => Promise<void>) | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleGlobalSave = async () => {
    if (!tabSaveRef.current || isSaving) return;
    setIsSaving(true);
    try {
      await tabSaveRef.current();
    } finally {
      setIsSaving(false);
    }
  };
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [mobilePageOpen, setMobilePageOpen] = useState(false);
  const [pagesExpanded, setPagesExpanded] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {
      "/ai": false,
      "/storage": false,
      "/documentation": false,
    },
  );
  const [selectedPageKey, setSelectedPageKey] =
    useState<PageSettingKey>("/dashboard");

  const tabTitles: Record<SettingsTabId, string> = {
    general: t("settings.general"),
    pages: t("settings.pages"),
    appearance: t("settings.appearance"),
    notifications: t("settings.notifications"),
    users: t("settings.users") || "Users",
    advanced: t("settings.advanced"),
  };

  const tabDescriptions: Record<SettingsTabId, string> = {
    general: t("settings.general.desc"),
    pages: t("settings.pages.desc"),
    appearance: t("settings.appearance.desc"),
    notifications: t("settings.notifications.desc"),
    users: t("settings.users.desc") || "Manage and create user accounts",
    advanced: t("settings.advanced.desc"),
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

  const findPageLabel = (key: PageSettingKey): string => {
    for (const node of PAGE_SETTINGS_TREE) {
      if (node.key === key) return t(node.labelKey as any);
      if (node.children) {
        for (const child of node.children) {
          if (child.key === key) return t(child.labelKey as any);
        }
      }
    }
    return key;
  };

  const renderMobilePageNode = (node: PageSettingsNode, depth = 0): React.ReactNode => {
    const hasChildren = !!node.children?.length;
    const isExpanded = expandedGroups[node.key] ?? false;
    const isSelected = selectedPageKey === node.key;
    return (
      <div key={node.key}>
        <div className="flex items-center">
          <button
            onClick={() => { openPageSettings(node.key); setMobilePageOpen(false); }}
            className={`flex-1 text-left py-2.5 text-sm transition-all ${depth > 0 ? "pl-8 pr-4" : "px-4"} ${
              isSelected
                ? "bg-[color-mix(in_srgb,var(--color-primary)_24%,transparent)] text-white font-medium"
                : "text-slate-400 hover:text-slate-100 hover:bg-slate-700/30"
            }`}
          >
            {t(node.labelKey as any)}
          </button>
          {hasChildren && (
            <button
              onClick={() => toggleGroup(node.key)}
              className="px-3 py-2.5 text-slate-400 hover:text-slate-100 shrink-0"
            >
              <ChevronDown
                size={14}
                className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}
              />
            </button>
          )}
        </div>
        {hasChildren && isExpanded && (
          <div className="border-l border-slate-700/40 ml-4">
            {node.children!.map((child) => renderMobilePageNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
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
              aria-label={
                isExpanded ? t("settings.collapse") : t("settings.expand")
              }
            >
              <ChevronDown
                size={14}
                className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}
              />
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
        <h2 className="text-xl font-bold mb-6 text-slate-100 px-2">
          {t("settings.title")}
        </h2>
        <nav className="space-y-1">
          <Button
            onClick={() => setActiveTab("general")}
            className={tabButtonClass("general")}
            variant="ghost"
          >
            {t("settings.general")}
          </Button>
          <Button
            onClick={openPagesSection}
            className={tabButtonClass("pages")}
            variant="ghost"
          >
            <div className="w-full flex items-center justify-between">
              <span>{t("settings.pages")}</span>
              <ChevronDown
                size={16}
                className={`transition-transform ${pagesExpanded ? "rotate-180" : ""}`}
              />
            </div>
          </Button>

          {pagesExpanded && (
            <div className="ml-4 mt-1 space-y-1 border-l border-slate-700/50 pl-2">
              {PAGE_SETTINGS_TREE.map((node) => renderPageNode(node))}
            </div>
          )}
          <Button
            onClick={() => setActiveTab("appearance")}
            className={tabButtonClass("appearance")}
            variant="ghost"
          >
            {t("settings.appearance")}
          </Button>
          <Button
            onClick={() => setActiveTab("notifications")}
            className={tabButtonClass("notifications")}
            variant="ghost"
          >
            {t("settings.notifications")}
          </Button>

          {user?.role === "ADMIN" && (
            <>
              <Button
                onClick={() => setActiveTab("users")}
                className={tabButtonClass("users")}
                variant="ghost"
              >
                {t("settings.users") || "Users"}
              </Button>
              <Button
                onClick={() => setActiveTab("advanced")}
                className={tabButtonClass("advanced")}
                variant="ghost"
              >
                {t("settings.advanced")}
              </Button>
            </>
          )}
        </nav>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Tab Dropdown */}
        <div className="md:hidden relative px-4 pt-16 shrink-0">
          <button
            onClick={() => setMobileNavOpen((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-100"
          >
            <span className="font-medium">{tabTitles[activeTab]}</span>
            <ChevronDown
              size={16}
              className={`transition-transform ${mobileNavOpen ? "rotate-180" : ""}`}
            />
          </button>
          {mobileNavOpen && (
            <div className="absolute top-[calc(100%-4px)] left-4 right-4 z-50 mt-1 rounded-lg bg-slate-800 border border-slate-700/50 shadow-xl overflow-hidden">
              {(
                [
                  { id: "general" as SettingsTabId, label: t("settings.general") },
                  { id: "pages" as SettingsTabId, label: t("settings.pages") },
                  { id: "appearance" as SettingsTabId, label: t("settings.appearance") },
                  { id: "notifications" as SettingsTabId, label: t("settings.notifications") },
                  ...(user?.role === "ADMIN"
                    ? [
                        { id: "users" as SettingsTabId, label: t("settings.users") || "Users" },
                        { id: "advanced" as SettingsTabId, label: t("settings.advanced") },
                      ]
                    : []),
                ] as { id: SettingsTabId; label: string }[]
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setMobileNavOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-all ${
                    activeTab === tab.id
                      ? "bg-[color-mix(in_srgb,var(--color-primary)_24%,transparent)] text-white font-medium"
                      : "text-slate-400 hover:text-slate-100 hover:bg-slate-700/30"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Mobile Page Selector */}
        {activeTab === "pages" && (
          <div className="md:hidden relative px-4 pb-3 shrink-0">
            <button
              onClick={() => setMobilePageOpen((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-2 rounded-lg bg-slate-700/30 border border-slate-700/50 text-slate-300 text-sm"
            >
              <span>{findPageLabel(selectedPageKey)}</span>
              <ChevronDown
                size={14}
                className={`transition-transform ${mobilePageOpen ? "rotate-180" : ""}`}
              />
            </button>
            {mobilePageOpen && (
              <div className="absolute top-[calc(100%-4px)] left-4 right-4 z-50 mt-1 rounded-lg bg-slate-800 border border-slate-700/50 shadow-xl max-h-64 overflow-y-auto">
                {PAGE_SETTINGS_TREE.map((node) => renderMobilePageNode(node))}
              </div>
            )}
          </div>
        )}

        <div className="px-4 md:px-6 pt-4 md:pt-6 pb-3 border-b border-slate-700/50 shrink-0">
          <h1 className="text-2xl font-bold mb-1 text-text">
            {tabTitles[activeTab]}
          </h1>
          <p className="text-sm text-slate-400">{tabDescriptions[activeTab]}</p>
        </div>

        <div className="flex-1 p-4 md:p-6 overflow-y-auto">
          <SettingsTabBoundary tab={activeTab}>
            {activeTab === "general" && <GeneralTab saveFnRef={tabSaveRef} />}
            {activeTab === "pages" && (
              <PagesTab selectedPageKey={selectedPageKey} />
            )}
            {activeTab === "appearance" && <AppearanceTab />}
            {activeTab === "notifications" && <NotificationsTab />}
            {activeTab === "users" && user?.role === "ADMIN" && <UsersTab />}
            {activeTab === "advanced" && user?.role === "ADMIN" && (
              <AdvancedTab />
            )}
          </SettingsTabBoundary>
        </div>

        {activeTab === "general" && (
          <div className="shrink-0 px-4 md:px-6 py-3 border-t border-slate-700/50 bg-slate-900/80 backdrop-blur-sm flex justify-end">
            <Button
              type="button"
              isDisabled={isSaving}
              onClick={handleGlobalSave}
              className="text-sm px-3 py-2 rounded-lg bg-purple-600 text-white font-medium hover:shadow-[0_0_15px_rgba(168,_85,_247,_0.5)] transition-all disabled:opacity-50"
            >
              {isSaving ? `${t("settings.save")}...` : t("settings.save")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
