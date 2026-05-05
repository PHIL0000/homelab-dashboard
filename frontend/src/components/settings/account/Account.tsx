import { useState } from "react";
import { Button } from "@heroui/react";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";

import ProfileTab from "./tabs/ProfileTab";
import SecurityTab from "./tabs/SecurityTab";
import ConnectionsTab from "./tabs/ConnectionsTab";

export default function Account() {
  const { t } = useLanguage();
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "profile" | "security" | "connections"
  >("profile");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const tabTitles = {
    profile: t("account.profile"),
    security: t("account.security"),
    connections: t("account.connections"),
  };

  const tabDescriptions = {
    profile: t("account.profile.desc"),
    security: t("account.security.desc"),
    connections: t("account.connections.desc"),
  };

  return (
    <div className="doc-theme-form flex h-[80vh] overflow-hidden">
      {/* Sidebar Navigation for Modal */}
      <div className="w-64 border-r border-slate-700/50 bg-slate-900/30 p-4 shrink-0 overflow-y-auto hidden md:block">
        <h2 className="text-xl font-bold mb-6 text-slate-100 px-2">
          {t("account.title")}
        </h2>
        <nav className="space-y-1">
          <Button
            onClick={() => setActiveTab("profile")}
            className={`w-full justify-start px-4 py-2 rounded-lg transition-all ${activeTab === "profile" ? "bg-[color-mix(in_srgb,var(--color-primary)_24%,transparent)] text-text font-medium border-l-2 border-primary" : "text-slate-400 hover:text-slate-100 hover:bg-slate-700/30"}`}
            variant="ghost"
          >
            {t("account.profile")}
          </Button>
          <Button
            onClick={() => setActiveTab("security")}
            className={`w-full justify-start px-4 py-2 rounded-lg transition-all ${activeTab === "security" ? "bg-[color-mix(in_srgb,var(--color-primary)_24%,transparent)] text-text font-medium border-l-2 border-primary" : "text-slate-400 hover:text-slate-100 hover:bg-slate-700/30"}`}
            variant="ghost"
          >
            {t("account.security")}
          </Button>
          <Button
            onClick={() => setActiveTab("connections")}
            className={`w-full justify-start px-4 py-2 rounded-lg transition-all ${activeTab === "connections" ? "bg-[color-mix(in_srgb,var(--color-primary)_24%,transparent)] text-text font-medium border-l-2 border-primary" : "text-slate-400 hover:text-slate-100 hover:bg-slate-700/30"}`}
            variant="ghost"
          >
            {t("account.connections")}
          </Button>
          <Button
            onClick={() => logout()}
            className="w-full justify-start px-4 py-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all mt-8"
            variant="ghost"
          >
            {t("account.logout")}
          </Button>
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
                  { id: "profile" as const, label: t("account.profile") },
                  { id: "security" as const, label: t("account.security") },
                  { id: "connections" as const, label: t("account.connections") },
                ]
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setMobileNavOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-all ${
                    activeTab === tab.id
                      ? "bg-[color-mix(in_srgb,var(--color-primary)_24%,transparent)] text-white font-medium"
                      : "text-slate-400 hover:text-slate-100 hover:bg-slate-700/30"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
              <button
                onClick={() => { logout(); setMobileNavOpen(false); }}
                className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all border-t border-slate-700/50 mt-1"
              >
                {t("account.logout")}
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 p-4 md:p-6 overflow-y-auto">
        <div className="mb-5 pb-3 border-b border-slate-700/50">
          <h1 className="text-2xl font-bold text-text mb-1">
            {tabTitles[activeTab]}
          </h1>
          <p className="text-sm text-slate-400">{tabDescriptions[activeTab]}</p>
        </div>

        {activeTab === "profile" && <ProfileTab />}
        {activeTab === "security" && <SecurityTab />}
        {activeTab === "connections" && <ConnectionsTab />}
        </div>
      </div>
    </div>
  );
}
