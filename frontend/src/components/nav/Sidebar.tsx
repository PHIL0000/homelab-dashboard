// components/nav/Sidebar.tsx
import React, { useState, useEffect } from "react";
import { Button } from "@heroui/react";
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import InfoCard from "./components/InfoCard";
import NavGroupSection from "./components/NavGroupSection";
import SidebarFooter from "./components/SidebarFooter";
import {
  Settings,
  LayoutDashboard,
  CalendarDays,
  Bot,
  MessageSquare,
  Image as ImageIcon,
  HardDrive,
  Database,
  Cloud,
  Code2,
  Home,
  Activity,
  GitBranch,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

interface SidebarProps {
  onOpenModal: (modal: "settings" | "account") => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onOpenModal }) => {
  const { t } = useLanguage();
  const { user, token } = useAuth();
  const location = useLocation();
  const [openAI, setOpenAI] = useState(false);
  const [openStorage, setOpenStorage] = useState(false);
  const [openDocs, setOpenDocs] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    return saved === "true";
  });

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", isCollapsed.toString());
  }, [isCollapsed]);

  const dashboardTitle = user?.dashboardName?.trim() || "Homelab";
  const isActive = (path: string) => location.pathname === path;

  const getNavItemClass = (active: boolean) => {
    return active
      ? "text-[var(--color-primary)] border-l-2 border-[var(--color-primary)] bg-[color-mix(in_srgb,var(--color-primary)_24%,transparent)]"
      : "text-[var(--color-textSecondary)] hover:text-[var(--color-text)] hover:bg-[color-mix(in_srgb,var(--color-primary)_18%,transparent)]";
  };

  const pageVisibilityMap = user?.pageVisibility ?? {};
  const isPageVisible = (path: string) => pageVisibilityMap[path] !== false;
  const isAiGroupVisible = isPageVisible("/ai");
  const isStorageGroupVisible = isPageVisible("/storage");
  const isDocsGroupVisible = isPageVisible("/documentation");

  const topItems = [
    { label: t("nav.dashboard"), path: "/dashboard", icon: LayoutDashboard },
    { label: t("nav.calendar"), path: "/calendar", icon: CalendarDays },
    { label: t("nav.homeAssistant"), path: "/home-assistant", icon: Home },
  ];

  const aiItems = [
    { label: t("nav.ai.chat"), path: "/ai/chat", icon: MessageSquare },
    { label: t("nav.ai.imageGen"), path: "/ai/image-gen", icon: ImageIcon },
  ];

  const storageItems = [
    { label: t("nav.storage.nas"), path: "/storage/nas", icon: Database },
    {
      label: t("nav.storage.nextcloud"),
      path: "/storage/nextcloud",
      icon: Cloud,
    },
    { label: t("nav.storage.gitlab"), path: "/storage/gitlab", icon: Code2 },
  ];

  const documentationItems = [
    {
      label: t("nav.docs.overview"),
      path: "/documentation/overview",
      icon: LayoutDashboard,
    },
    { label: t("nav.docs.map"), path: "/documentation/map", icon: GitBranch },
    {
      label: t("nav.docs.hardware"),
      path: "/documentation/hardware",
      icon: HardDrive,
    },
    {
      label: t("nav.docs.services"),
      path: "/documentation/services",
      icon: Settings,
    },
    {
      label: t("nav.docs.storage"),
      path: "/documentation/storage",
      icon: Database,
    },
    { label: t("nav.docs.documents"), path: "/documentation/docs", icon: Bot },
  ];

  const bottomItems = [
    { label: t("nav.performance"), path: "/performance", icon: Activity },
  ];

  const visibleTopItems = topItems.filter((item) => isPageVisible(item.path));
  const visibleAiItems = isAiGroupVisible
    ? aiItems.filter((item) => isPageVisible(item.path))
    : [];
  const visibleStorageItems = isStorageGroupVisible
    ? storageItems.filter((item) => isPageVisible(item.path))
    : [];
  const visibleDocumentationItems = isDocsGroupVisible
    ? documentationItems.filter((item) => isPageVisible(item.path))
    : [];
  const visibleBottomItems = bottomItems.filter((item) =>
    isPageVisible(item.path),
  );

  return (
    <div
      className={`${isCollapsed ? "w-20" : "w-64"} sidebar-theme-gradient h-screen rounded-none border-r border-[color-mix(in_srgb,var(--color-border)_72%,transparent)] flex flex-col transition-all duration-300 ease-in-out relative z-20 shrink-0`}
    >
      {/* ── HEADER ── */}
      <div className="sidebar-theme-surface border-b border-[color-mix(in_srgb,var(--color-border)_72%,transparent)] p-3">
        {/* Expanded: Titel + Button */}
        {!isCollapsed && (
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-xl font-bold text-[var(--color-primary)]">
                {dashboardTitle}
              </p>
              <p className="text-xs text-[var(--color-textSecondary)] uppercase tracking-widest">
                {t("nav.dashboard")}
              </p>
            </div>
            <Button
              onPress={() => setIsCollapsed(true)}
              className="p-2 rounded-lg text-[var(--color-textSecondary)] hover:text-[var(--color-text)] sidebar-theme-hover"
              aria-label={t("nav.sidebar.collapse")}
              isIconOnly
              variant="ghost"
            >
              <PanelLeftClose size={18} />
            </Button>
          </div>
        )}

        {/* Collapsed: nur Expand-Button */}
        {isCollapsed && (
          <div className="flex justify-center mb-2">
            <Button
              onPress={() => setIsCollapsed(false)}
              className="p-2 rounded-lg text-[var(--color-textSecondary)] hover:text-[var(--color-text)] sidebar-theme-hover"
              aria-label={t("nav.sidebar.expand")}
              isIconOnly
              variant="ghost"
            >
              <PanelLeftOpen size={18} />
            </Button>
          </div>
        )}

        {/* InfoCard */}
        <InfoCard
          timezone={user?.timezone}
          timeFormat={user?.timeFormat}
          dateFormat={user?.dateFormat}
          token={token}
          isCollapsed={isCollapsed}
        />
      </div>

      {/* ── NAV ── */}
      <nav className="flex-1 p-3 overflow-y-auto overflow-x-hidden scrollbar-thin">
        {visibleTopItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            title={isCollapsed ? item.label : undefined}
            className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"} px-3 py-2.5 rounded-lg mb-1.5 transition-all ${getNavItemClass(isActive(item.path))}`}
          >
            <item.icon size={20} className="shrink-0" />
            {!isCollapsed && (
              <span className="font-medium whitespace-nowrap text-sm">
                {item.label}
              </span>
            )}
          </Link>
        ))}

        <NavGroupSection
          containerClassName="mb-1.5 mt-4"
          items={visibleAiItems}
          groupLabel={t("nav.ai")}
          groupIcon={Bot}
          isCollapsed={isCollapsed}
          isOpen={openAI}
          onToggleOpen={() => setOpenAI(!openAI)}
          onExpandFromCollapsed={() => {
            setIsCollapsed(false);
            setOpenAI(true);
          }}
          isActive={isActive}
          getNavItemClass={getNavItemClass}
        />

        <NavGroupSection
          items={visibleStorageItems}
          groupLabel={t("nav.storage")}
          groupIcon={HardDrive}
          isCollapsed={isCollapsed}
          isOpen={openStorage}
          onToggleOpen={() => setOpenStorage(!openStorage)}
          onExpandFromCollapsed={() => {
            setIsCollapsed(false);
            setOpenStorage(true);
          }}
          isActive={isActive}
          getNavItemClass={getNavItemClass}
        />

        <NavGroupSection
          items={visibleDocumentationItems}
          groupLabel={t("nav.documentation")}
          groupIcon={LayoutDashboard}
          isCollapsed={isCollapsed}
          isOpen={openDocs}
          onToggleOpen={() => setOpenDocs(!openDocs)}
          onExpandFromCollapsed={() => {
            setIsCollapsed(false);
            setOpenDocs(true);
          }}
          isActive={isActive}
          getNavItemClass={getNavItemClass}
        />

        {visibleBottomItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            title={isCollapsed ? item.label : undefined}
            className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"} px-3 py-2.5 rounded-lg mb-1.5 transition-all ${getNavItemClass(isActive(item.path))}`}
          >
            <item.icon size={20} className="shrink-0" />
            {!isCollapsed && (
              <span className="font-medium whitespace-nowrap text-sm">
                {item.label}
              </span>
            )}
          </Link>
        ))}
      </nav>

      {/* ── FOOTER ── */}
      <SidebarFooter
        isCollapsed={isCollapsed}
        username={user?.username}
        role={user?.role}
        accountLabel={t("nav.account")}
        settingsLabel={t("nav.settings")}
        onOpenModal={onOpenModal}
      />
    </div>
  );
};

export default Sidebar;
