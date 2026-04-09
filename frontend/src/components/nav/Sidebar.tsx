// components/nav/Sidebar.tsx
import React, { useState, useEffect } from "react";
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
            <h1 className="text-2xl font-bold text-primary tracking-tight">Homelab</h1>
            <p className="text-[10px] mt-0.5 text-text-secondary uppercase tracking-widest font-medium">Dashboard</p>
          </div>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-2 rounded-lg text-text-secondary hover:text-primary hover:bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)] transition-all ${isCollapsed ? "mx-auto" : ""}`}
          title={isCollapsed ? t("nav.sidebar.expand") : t("nav.sidebar.collapse")}
        >
          {isCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
        </button>
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
                ? "bg-primary text-white shadow-[0_0_15px_color-mix(in_srgb,var(--color-primary)_50%,transparent)]"
                : "text-text hover:text-primary hover:bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)] hover:translate-x-1"
            }`}
          >
            <item.icon size={20} className={`shrink-0 ${isActive(item.path) ? "" : "text-text-secondary group-hover:text-primary"} transition-colors`} />
            {!isCollapsed && <span className="font-medium whitespace-nowrap">{item.label}</span>}
          </Link>
        ))}

        {/* AI SECTION */}
        <div className="mb-1.5 mt-2">
          {isCollapsed ? (
            <button
              onClick={() => {
                setIsCollapsed(false);
                setOpenAI(true);
              }}
              title={t("nav.ai")}
              className="w-full flex items-center justify-center px-3 py-2.5 rounded-lg transition-all duration-200 text-text hover:text-primary hover:bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)] group"
            >
              <Bot size={20} className="text-text-secondary group-hover:text-primary transition-colors shrink-0" />
            </button>
          ) : (
            <button
              onClick={() => setOpenAI(!openAI)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 text-text hover:text-primary hover:bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)] group"
            >
              <div className="flex items-center gap-3">
                <Bot size={20} className="text-text-secondary group-hover:text-primary transition-colors shrink-0" />
                <span className="font-medium whitespace-nowrap">{t("nav.ai")}</span>
              </div>
              <ChevronDown
                size={16}
                className={`text-text-secondary group-hover:text-primary transition-transform shrink-0 ${openAI ? "rotate-180" : ""}`}
              />
            </button>
          )}

          {openAI && !isCollapsed && (
            <div className="ml-4 mt-1 space-y-1 relative before:absolute before:left-[11px] before:top-0 before:bottom-2 before:w-[1px] before:bg-border">
              {aiItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ml-4 group ${
                    isActive(item.path)
                      ? "bg-primary text-white shadow-[0_0_15px_color-mix(in_srgb,var(--color-primary)_50%,transparent)]"
                      : "text-text-secondary hover:text-primary hover:bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)] hover:translate-x-1"
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
            <button
              onClick={() => {
                setIsCollapsed(false);
                setOpenStorage(true);
              }}
              title={t("nav.storage")}
              className="w-full flex items-center justify-center px-3 py-2.5 rounded-lg transition-all duration-200 text-text hover:text-primary hover:bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)] group"
            >
              <HardDrive size={20} className="text-text-secondary group-hover:text-primary transition-colors shrink-0" />
            </button>
          ) : (
            <button
              onClick={() => setOpenStorage(!openStorage)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 text-text hover:text-primary hover:bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)] group"
            >
              <div className="flex items-center gap-3">
                <HardDrive size={20} className="text-text-secondary group-hover:text-primary transition-colors shrink-0" />
                <span className="font-medium whitespace-nowrap">{t("nav.storage")}</span>
              </div>
              <ChevronDown
                size={16}
                className={`text-text-secondary group-hover:text-primary transition-transform shrink-0 ${openStorage ? "rotate-180" : ""}`}
              />
            </button>
          )}

          {openStorage && !isCollapsed && (
            <div className="ml-4 mt-1 space-y-1 relative before:absolute before:left-[11px] before:top-0 before:bottom-2 before:w-[1px] before:bg-border">
              {storageItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ml-4 group ${
                    isActive(item.path)
                      ? "bg-primary text-white shadow-[0_0_15px_color-mix(in_srgb,var(--color-primary)_50%,transparent)]"
                      : "text-text-secondary hover:text-primary hover:bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)] hover:translate-x-1"
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
            <button
              onClick={() => {
                setIsCollapsed(false);
                setOpenDocs(true);
              }}
              title={t("nav.documentation")}
              className="w-full flex items-center justify-center px-3 py-2.5 rounded-lg transition-all duration-200 text-text hover:text-primary hover:bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)] group"
            >
              <LayoutDashboard size={20} className="text-text-secondary group-hover:text-primary transition-colors shrink-0" />
            </button>
          ) : (
            <button
              onClick={() => setOpenDocs(!openDocs)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 text-text hover:text-primary hover:bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)] group"
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard size={20} className="text-text-secondary group-hover:text-primary transition-colors shrink-0" />
                <span className="font-medium whitespace-nowrap">{t("nav.documentation")}</span>
              </div>
              <ChevronDown
                size={16}
                className={`text-text-secondary group-hover:text-primary transition-transform shrink-0 ${openDocs ? "rotate-180" : ""}`}
              />
            </button>
          )}

          {openDocs && !isCollapsed && (
            <div className="ml-4 mt-1 space-y-1 relative before:absolute before:left-[11px] before:top-0 before:bottom-2 before:w-[1px] before:bg-border">
              {documentationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ml-4 group ${
                    isActive(item.path)
                      ? "bg-primary text-white shadow-[0_0_15px_color-mix(in_srgb,var(--color-primary)_50%,transparent)]"
                      : "text-text-secondary hover:text-primary hover:bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)] hover:translate-x-1"
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
                ? "bg-primary text-white shadow-[0_0_15px_color-mix(in_srgb,var(--color-primary)_50%,transparent)]"
                : "text-text hover:text-primary hover:bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)] hover:translate-x-1"
            }`}
          >
            <item.icon size={20} className={`shrink-0 ${isActive(item.path) ? "" : "text-text-secondary group-hover:text-primary"} transition-colors`} />
            {!isCollapsed && <span className="font-medium whitespace-nowrap">{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* USER & SETTINGS */}
      <div className={`p-3 flex ${isCollapsed ? "flex-col" : "items-center"} gap-2 border-t border-border`}>
        <button
          onClick={() => onOpenModal("account")}
          title={isCollapsed ? t("nav.account") : undefined}
          className={`flex-1 flex gap-3 px-2 py-2 rounded-lg transition-all duration-200 hover:bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)] hover:translate-y-[-2px] hover:shadow-lg bg-content group ${isCollapsed ? "justify-center h-12" : "items-center h-14"}`}
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
        </button>

        <button
          onClick={() => onOpenModal("settings")}
          title={isCollapsed ? t("nav.settings") : undefined}
          className={`rounded-lg flex-shrink-0 flex items-center justify-center transition-all duration-200 hover:bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)] hover:text-primary hover:rotate-90 bg-content text-text group ${isCollapsed ? "w-full h-12" : "h-14 w-12"}`}
        >
          <Settings size={20} className="text-text-secondary group-hover:text-primary transition-colors" />
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
