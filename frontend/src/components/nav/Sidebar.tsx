// components/nav/Sidebar.tsx
import React, { useState, useEffect } from "react";
import { Button } from "@heroui/react";
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { 
  ChevronDown, 
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
  PanelLeftOpen
} from "lucide-react";

interface SidebarProps {
  onOpenModal: (modal: "settings" | "account") => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onOpenModal }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const location = useLocation();
  const [openAI, setOpenAI] = useState(false);
  const [openStorage, setOpenStorage] = useState(false);
  const [openDocs, setOpenDocs] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    return saved === "true";
  });

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", isCollapsed.toString());
  }, [isCollapsed]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const dashboardTitle = user?.dashboardName?.trim() || 'Homelab';
  const userTimezone = user?.timezone || 'Europe/Berlin';
  const userTimeFormat = user?.timeFormat === '12h' ? '12h' : '24h';
  const userDateFormat = user?.dateFormat || 'DD-MM-YYYY';

  const formatDate = (date: Date) => {
    try {
      const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: userTimezone,
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).formatToParts(date);

      const day = parts.find((part) => part.type === 'day')?.value || '';
      const month = parts.find((part) => part.type === 'month')?.value || '';
      const year = parts.find((part) => part.type === 'year')?.value || '';

      switch (userDateFormat) {
        case 'MM-DD-YYYY':
          return `${month}-${day}-${year}`;
        case 'YYYY-MM-DD':
          return `${year}-${month}-${day}`;
        case 'DD.MM.YYYY':
          return `${day}.${month}.${year}`;
        case 'DD-MM-YYYY':
        default:
          return `${day}-${month}-${year}`;
      }
    } catch {
      return date.toLocaleDateString();
    }
  };

  const formatTime = (date: Date) => {
    try {
      return new Intl.DateTimeFormat('en-GB', {
        timeZone: userTimezone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: userTimeFormat === '12h'
      }).format(date);
    } catch {
      return date.toLocaleTimeString();
    }
  };

  const sidebarClockLabel = `${formatDate(now)} • ${formatTime(now)}`;

  const isActive = (path: string) => location.pathname === path;

  const getNavItemClass = (active: boolean) => {
    return active 
      ? "text-[var(--color-primary)] border-l-2 border-[var(--color-primary)] bg-[color-mix(in_srgb,var(--color-primary)_24%,transparent)]"
      : "text-[var(--color-textSecondary)] hover:text-[var(--color-text)] hover:bg-[color-mix(in_srgb,var(--color-primary)_18%,transparent)]";
  };

  const pageVisibilityMap = user?.pageVisibility ?? {};
  const isPageVisible = (path: string) => pageVisibilityMap[path] !== false;
  const isAiGroupVisible = isPageVisible('/ai');
  const isStorageGroupVisible = isPageVisible('/storage');
  const isDocsGroupVisible = isPageVisible('/documentation');

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
    { label: t("nav.storage.nextcloud"), path: "/storage/nextcloud", icon: Cloud },
    { label: t("nav.storage.gitlab"), path: "/storage/gitlab", icon: Code2 },
  ];

  const documentationItems = [
    { label: t("nav.docs.overview"), path: "/documentation/overview", icon: LayoutDashboard },
    { label: t("nav.docs.map"), path: "/documentation/map", icon: GitBranch },
    { label: t("nav.docs.hardware"), path: "/documentation/hardware", icon: HardDrive },
    { label: t("nav.docs.services"), path: "/documentation/services", icon: Settings },
    { label: t("nav.docs.storage"), path: "/documentation/storage", icon: Database },
    { label: t("nav.docs.documents"), path: "/documentation/docs", icon: Bot },
  ];

  const bottomItems = [
    { label: t("nav.performance"), path: "/performance", icon: Activity },
  ];

  const visibleTopItems = topItems.filter((item) => isPageVisible(item.path));
  const visibleAiItems = isAiGroupVisible ? aiItems.filter((item) => isPageVisible(item.path)) : [];
  const visibleStorageItems = isStorageGroupVisible
    ? storageItems.filter((item) => isPageVisible(item.path))
    : [];
  const visibleDocumentationItems = isDocsGroupVisible
    ? documentationItems.filter((item) => isPageVisible(item.path))
    : [];
  const visibleBottomItems = bottomItems.filter((item) => isPageVisible(item.path));

  return (
    <div
      className={`${isCollapsed ? "w-20" : "w-64"} sidebar-theme-gradient h-screen rounded-none border-r border-[color-mix(in_srgb,var(--color-border)_72%,transparent)] flex flex-col transition-all duration-300 ease-in-out relative z-20 shrink-0`}
    >
      <div className={`sidebar-theme-surface p-4 border-b border-[color-mix(in_srgb,var(--color-border)_72%,transparent)] flex items-center justify-between h-[80px]`}>
        {!isCollapsed && (
          <div className="overflow-hidden transition-all duration-300 whitespace-nowrap">
            <h1 className="text-2xl font-bold tracking-tight text-[var(--color-primary)]">
              {dashboardTitle}
            </h1>
            <p className="text-[10px] mt-0.5 text-[var(--color-textSecondary)] uppercase tracking-widest font-medium">Dashboard</p>
            <p className="text-[10px] mt-1 text-[var(--color-textSecondary)]">{sidebarClockLabel}</p>
          </div>
        )}
        <Button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg text-[var(--color-textSecondary)] hover:text-[var(--color-text)] sidebar-theme-hover"
          aria-label={isCollapsed ? t("nav.sidebar.expand") : t("nav.sidebar.collapse")}
          isIconOnly
          variant="ghost"
        >
          {isCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
        </Button>
      </div>

      <nav className="flex-1 p-3 overflow-y-auto overflow-x-hidden scrollbar-thin">
        {/* TOP ITEMS */}
        {visibleTopItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            title={isCollapsed ? item.label : undefined}
            className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"} px-3 py-2.5 rounded-lg mb-1.5 transition-all ${getNavItemClass(isActive(item.path))}`}
          >
            <item.icon size={20} className="shrink-0" />
            {!isCollapsed && <span className="font-medium whitespace-nowrap text-sm">{item.label}</span>}
          </Link>
        ))}

        {/* AI SECTION */}
        {visibleAiItems.length > 0 && (
        <div className="mb-1.5 mt-4">
          {isCollapsed ? (
            <Button
              onClick={() => {
                setIsCollapsed(false);
                setOpenAI(true);
              }}
              aria-label={t("nav.ai")}
              isIconOnly
              variant="ghost"
              className="w-full rounded-lg text-[var(--color-textSecondary)] hover:text-[var(--color-text)] sidebar-theme-hover"
            >
              <Bot size={20} />
            </Button>
          ) : (
            <Button
              onClick={() => setOpenAI(!openAI)}
              className="w-full justify-between rounded-lg text-[var(--color-textSecondary)] hover:text-[var(--color-text)] sidebar-theme-hover"
              variant="ghost"
            >
              <div className="flex items-center gap-3">
                <Bot size={20} />
                <span className="font-medium">{t("nav.ai")}</span>
              </div>
              <ChevronDown size={16} className={`transition-transform ${openAI ? "rotate-180" : ""}`} />
            </Button>
          )}

          {openAI && !isCollapsed && (
            <div className="ml-4 mt-2 space-y-1 border-l border-[color-mix(in_srgb,var(--color-border)_72%,transparent)] pl-3">
              {visibleAiItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${getNavItemClass(isActive(item.path))}`}
                >
                  <item.icon size={16} className="shrink-0" />
                  <span className="whitespace-nowrap">{item.label}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
        )}

        {/* STORAGE SECTION */}
        {visibleStorageItems.length > 0 && (
        <div className="mb-1.5">
          {isCollapsed ? (
            <Button
              onClick={() => {
                setIsCollapsed(false);
                setOpenStorage(true);
              }}
              aria-label={t("nav.storage")}
              isIconOnly
              variant="ghost"
              className="w-full rounded-lg text-[var(--color-textSecondary)] hover:text-[var(--color-text)] sidebar-theme-hover"
            >
              <HardDrive size={20} />
            </Button>
          ) : (
            <Button
              onClick={() => setOpenStorage(!openStorage)}
              className="w-full justify-between rounded-lg text-[var(--color-textSecondary)] hover:text-[var(--color-text)] sidebar-theme-hover"
              variant="ghost"
            >
              <div className="flex items-center gap-3">
                <HardDrive size={20} />
                <span className="font-medium">{t("nav.storage")}</span>
              </div>
              <ChevronDown size={16} className={`transition-transform ${openStorage ? "rotate-180" : ""}`} />
            </Button>
          )}

          {openStorage && !isCollapsed && (
            <div className="ml-4 mt-2 space-y-1 border-l border-[color-mix(in_srgb,var(--color-border)_72%,transparent)] pl-3">
              {visibleStorageItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${getNavItemClass(isActive(item.path))}`}
                >
                  <item.icon size={16} className="shrink-0" />
                  <span className="whitespace-nowrap">{item.label}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
        )}

        {/* DOCUMENTATION SECTION */}
        {visibleDocumentationItems.length > 0 && (
        <div className="mb-1.5">
          {isCollapsed ? (
            <Button
              onClick={() => {
                setIsCollapsed(false);
                setOpenDocs(true);
              }}
              aria-label={t("nav.documentation")}
              isIconOnly
              variant="ghost"
              className="w-full rounded-lg text-[var(--color-textSecondary)] hover:text-[var(--color-text)] sidebar-theme-hover"
            >
              <LayoutDashboard size={20} />
            </Button>
          ) : (
            <Button
              onClick={() => setOpenDocs(!openDocs)}
              className="w-full justify-between rounded-lg text-[var(--color-textSecondary)] hover:text-[var(--color-text)] sidebar-theme-hover"
              variant="ghost"
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard size={20} />
                <span className="font-medium">{t("nav.documentation")}</span>
              </div>
              <ChevronDown size={16} className={`transition-transform ${openDocs ? "rotate-180" : ""}`} />
            </Button>
          )}

          {openDocs && !isCollapsed && (
            <div className="ml-4 mt-2 space-y-1 border-l border-[color-mix(in_srgb,var(--color-border)_72%,transparent)] pl-3">
              {visibleDocumentationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${getNavItemClass(isActive(item.path))}`}
                >
                  <item.icon size={16} className="shrink-0" />
                  <span className="whitespace-nowrap">{item.label}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
        )}


        {/* BOTTOM ITEMS */}
        {visibleBottomItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            title={isCollapsed ? item.label : undefined}
            className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"} px-3 py-2.5 rounded-lg mb-1.5 transition-all ${getNavItemClass(isActive(item.path))}`}
          >
            <item.icon size={20} className="shrink-0" />
            {!isCollapsed && <span className="font-medium whitespace-nowrap text-sm">{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* USER & SETTINGS FOOTER */}
  <div className={`sidebar-theme-surface p-3 flex ${isCollapsed ? "flex-col" : "items-center"} gap-2 border-t border-[color-mix(in_srgb,var(--color-border)_72%,transparent)]`}>
        <Button
          onClick={() => onOpenModal("account")}
          isIconOnly={isCollapsed}
          variant="ghost"
          className={`${isCollapsed ? "w-full h-10 justify-center" : "flex-1 justify-start"} rounded-lg text-[var(--color-textSecondary)] hover:text-[var(--color-text)] sidebar-theme-hover`}
          aria-label={t("nav.account")}
        >
          {isCollapsed ? (
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs" style={{ backgroundColor: 'var(--color-primary)' }}>
              {user?.username ? user.username.substring(0, 1).toUpperCase() : "U"}
            </div>
          ) : (
            <>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0" style={{ backgroundColor: 'var(--color-primary)' }}>
                {user?.username ? user.username.substring(0, 1).toUpperCase() : "U"}
              </div>
              <div className="flex-1 min-w-0 text-left pl-2">
                <p className="text-sm font-medium text-[var(--color-text)] truncate">{user?.username || "User"}</p>
                <p className="text-xs text-[var(--color-textSecondary)] truncate">{user?.role === "ADMIN" ? "Administrator" : "User"}</p>
              </div>
            </>
          )}
        </Button>

        <Button
          onClick={() => onOpenModal("settings")}
          isIconOnly
          variant="ghost"
          className={`${isCollapsed ? "w-full" : "w-10"} h-10 rounded-lg text-[var(--color-textSecondary)] hover:text-[var(--color-text)] sidebar-theme-hover`}
          aria-label={t("nav.settings")}
        >
          <Settings size={20} />
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
