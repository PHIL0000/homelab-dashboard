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
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    return saved === "true";
  });

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", isCollapsed.toString());
  }, [isCollapsed]);

  const isActive = (path: string) => location.pathname === path;
  const activeNavItemClass = "bg-[color-mix(in_srgb,var(--color-primary)_78%,black)] text-white ring-1 ring-[color-mix(in_srgb,var(--color-primary)_55%,transparent)] shadow-[0_0_24px_color-mix(in_srgb,var(--color-primary)_55%,transparent)]";
  const inactiveNavItemClass = "text-text hover:text-primary hover:bg-[color-mix(in_srgb,var(--color-primary)_18%,transparent)] hover:translate-x-1";
  const sidebarButtonBaseClass = "rounded-lg transition-all duration-200";
  const dropdownToggleClass = "w-full flex items-center justify-between px-3 py-2.5 text-white hover:text-primary hover:bg-[color-mix(in_srgb,var(--color-primary)_18%,transparent)] !border-0 !border-transparent !ring-0 !shadow-none";

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

  return (
    <div 
      className={`${isCollapsed ? "w-20" : "w-64"} h-screen rounded-none border-r border-border flex flex-col bg-sidebar transition-all duration-300 ease-in-out relative z-20 shrink-0`}
    >
      <div className={`p-6 border-b border-border flex items-center justify-between h-[89px]`}>
        {!isCollapsed && (
          <div className="overflow-hidden transition-all duration-300 whitespace-nowrap">
            <h1
              className="text-2xl font-bold tracking-tight"
              style={{ color: "var(--color-primary)" }}
            >
              Homelab
            </h1>
            <p className="text-[10px] mt-0.5 text-slate-200/80 uppercase tracking-widest font-medium">Dashboard</p>
          </div>
        )}
        <Button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-2 ${sidebarButtonBaseClass} ${inactiveNavItemClass} ${isCollapsed ? "mx-auto" : ""}`}
          aria-label={isCollapsed ? t("nav.sidebar.expand") : t("nav.sidebar.collapse")}
          isIconOnly
          variant="ghost"
        >
          {isCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
        </Button>
      </div>

      <nav className="flex-1 p-3 overflow-y-auto overflow-x-hidden scrollbar-thin">
        {/* TOP ITEMS */}
        {topItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            title={isCollapsed ? item.label : undefined}
            className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"} px-3 py-2.5 rounded-lg mb-1.5 transition-all duration-200 group ${
              isActive(item.path)
                ? activeNavItemClass
                : inactiveNavItemClass
            }`}
          >
            <item.icon size={20} className={`shrink-0 ${isActive(item.path) ? "" : "text-text-secondary group-hover:text-primary"} transition-colors`} />
            {!isCollapsed && <span className="font-medium whitespace-nowrap">{item.label}</span>}
          </Link>
        ))}

        {/* AI SECTION */}
        <div className="mb-1.5 mt-2">
          {isCollapsed ? (
            <Button
              onClick={() => {
                setIsCollapsed(false);
                setOpenAI(true);
              }}
              aria-label={t("nav.ai")}
              className={`w-full flex items-center justify-center px-3 py-2.5 group text-white hover:text-primary hover:bg-[color-mix(in_srgb,var(--color-primary)_18%,transparent)] !border-0 !border-transparent !ring-0 !shadow-none ${sidebarButtonBaseClass}`}
              variant="ghost"
            >
              <Bot size={20} className="text-white group-hover:text-primary transition-colors shrink-0" />
            </Button>
          ) : (
            <Button
              onClick={() => setOpenAI(!openAI)}
              className={`group ${sidebarButtonBaseClass} ${dropdownToggleClass}`}
              variant="ghost"
            >
              <div className="flex items-center gap-3">
                <Bot size={20} className="text-white group-hover:text-primary transition-colors shrink-0" />
                <span className="font-medium whitespace-nowrap text-white">{t("nav.ai")}</span>
              </div>
              <ChevronDown
                size={16}
                className={`text-white group-hover:text-primary transition-transform shrink-0 ${openAI ? "rotate-180" : ""}`}
              />
            </Button>
          )}

          {openAI && !isCollapsed && (
            <div className="ml-4 mt-1 space-y-1 relative before:absolute before:left-[11px] before:top-0 before:bottom-2 before:w-[1px] before:bg-border">
              {aiItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ml-4 group ${
                    isActive(item.path)
                      ? activeNavItemClass
                      : inactiveNavItemClass
                  }`}
                >
                  <item.icon size={16} className={`shrink-0 ${isActive(item.path) ? "" : "opacity-70 group-hover:opacity-100"} transition-opacity`} />
                  <span className="whitespace-nowrap">{item.label}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* STORAGE SECTION */}
        <div className="mb-1.5">
          {isCollapsed ? (
            <Button
              onClick={() => {
                setIsCollapsed(false);
                setOpenStorage(true);
              }}
              aria-label={t("nav.storage")}
              className={`w-full flex items-center justify-center px-3 py-2.5 group text-white hover:text-primary hover:bg-[color-mix(in_srgb,var(--color-primary)_18%,transparent)] !border-0 !border-transparent !ring-0 !shadow-none ${sidebarButtonBaseClass}`}
              variant="ghost"
            >
              <HardDrive size={20} className="text-white group-hover:text-primary transition-colors shrink-0" />
            </Button>
          ) : (
            <Button
              onClick={() => setOpenStorage(!openStorage)}
              className={`group ${sidebarButtonBaseClass} ${dropdownToggleClass}`}
              variant="ghost"
            >
              <div className="flex items-center gap-3">
                <HardDrive size={20} className="text-white group-hover:text-primary transition-colors shrink-0" />
                <span className="font-medium whitespace-nowrap text-white">{t("nav.storage")}</span>
              </div>
              <ChevronDown
                size={16}
                className={`text-white group-hover:text-primary transition-transform shrink-0 ${openStorage ? "rotate-180" : ""}`}
              />
            </Button>
          )}

          {openStorage && !isCollapsed && (
            <div className="ml-4 mt-1 space-y-1 relative before:absolute before:left-[11px] before:top-0 before:bottom-2 before:w-[1px] before:bg-border">
              {storageItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ml-4 group ${
                    isActive(item.path)
                      ? activeNavItemClass
                      : inactiveNavItemClass
                  }`}
                >
                  <item.icon size={16} className={`shrink-0 ${isActive(item.path) ? "" : "opacity-70 group-hover:opacity-100"} transition-opacity`} />
                  <span className="whitespace-nowrap">{item.label}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* DOCUMENTATION SECTION */}
        <div className="mb-1.5">
          {isCollapsed ? (
            <Button
              onClick={() => {
                setIsCollapsed(false);
                setOpenDocs(true);
              }}
              aria-label={t("nav.documentation")}
              className={`w-full flex items-center justify-center px-3 py-2.5 group text-white hover:text-primary hover:bg-[color-mix(in_srgb,var(--color-primary)_18%,transparent)] !border-0 !border-transparent !ring-0 !shadow-none ${sidebarButtonBaseClass}`}
              variant="ghost"
            >
              <LayoutDashboard size={20} className="text-white group-hover:text-primary transition-colors shrink-0" />
            </Button>
          ) : (
            <Button
              onClick={() => setOpenDocs(!openDocs)}
              className={`group ${sidebarButtonBaseClass} ${dropdownToggleClass}`}
              variant="ghost"
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard size={20} className="text-white group-hover:text-primary transition-colors shrink-0" />
                <span className="font-medium whitespace-nowrap text-white">{t("nav.documentation")}</span>
              </div>
              <ChevronDown
                size={16}
                className={`text-white group-hover:text-primary transition-transform shrink-0 ${openDocs ? "rotate-180" : ""}`}
              />
            </Button>
          )}

          {openDocs && !isCollapsed && (
            <div className="ml-4 mt-1 space-y-1 relative before:absolute before:left-[11px] before:top-0 before:bottom-2 before:w-[1px] before:bg-border">
              {documentationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ml-4 group ${
                    isActive(item.path)
                      ? activeNavItemClass
                      : inactiveNavItemClass
                  }`}
                >
                  <item.icon size={16} className={`shrink-0 ${isActive(item.path) ? "" : "opacity-70 group-hover:opacity-100"} transition-opacity`} />
                  <span className="whitespace-nowrap">{item.label}</span>
                </Link>
              ))}
            </div>
          )}
        </div>


        {/* BOTTOM ITEMS */}
        {bottomItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            title={isCollapsed ? item.label : undefined}
            className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"} px-3 py-2.5 rounded-lg mb-1.5 transition-all duration-200 group ${
              isActive(item.path)
                ? activeNavItemClass
                : inactiveNavItemClass
            }`}
          >
            <item.icon size={20} className={`shrink-0 ${isActive(item.path) ? "" : "text-text-secondary group-hover:text-primary"} transition-colors`} />
            {!isCollapsed && <span className="font-medium whitespace-nowrap">{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* USER & SETTINGS */}
      <div className={`p-3 flex ${isCollapsed ? "flex-col" : "items-center"} gap-2 border-t border-border`}>
        <Button
          onClick={() => onOpenModal("account")}
          aria-label={t("nav.account")}
          className={`flex-1 flex gap-3 px-2 py-2 group ${sidebarButtonBaseClass} ${inactiveNavItemClass} !border-0 !border-transparent !ring-0 !shadow-none ${isCollapsed ? "justify-center h-12" : "items-center h-14"}`}
          variant="ghost"
        >
          <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 bg-primary shadow-[0_0_10px_color-mix(in_srgb,var(--color-primary)_40%,transparent)] group-hover:shadow-[0_0_15px_color-mix(in_srgb,var(--color-primary)_80%,transparent)] transition-shadow">
            <span className="text-sm font-bold text-white uppercase">{user?.username ? user.username.substring(0, 1) : "U"}</span>
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-text truncate group-hover:text-primary transition-colors">{user?.username || "User"}</p>
              <p className="text-xs text-text-secondary truncate">{user?.role === "ADMIN" ? "Administrator" : "User"}</p>
            </div>
          )}
        </Button>

        <Button
          onClick={() => onOpenModal("settings")}
          aria-label={t("nav.settings")}
          className={`flex-shrink-0 flex items-center justify-center group ${sidebarButtonBaseClass} ${inactiveNavItemClass} !border-0 !border-transparent !ring-0 !shadow-none ${isCollapsed ? "w-full h-12" : "h-14 w-12"}`}
          variant="ghost"
        >
          <Settings size={20} className="text-text-secondary group-hover:text-primary transition-colors" />
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
