import { useState } from "react";
import type { Theme } from "@/context/ThemeContext";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";
import type { Language } from "@/i18n/translations";
import { ChevronDown } from "lucide-react";

function GeneralTab() {
  const { t, language, setLanguage } = useLanguage();
  
  return (
    <div className="grid grid-cols-1 gap-6 max-w-3xl">
      <div className="p-6 rounded-lg border border-border bg-content">
        <h2 className="text-xl font-semibold mb-4 text-text">{t('settings.dashboardInfo')}</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">{t('settings.dashboardName')}</label>
            <input type="text" defaultValue="Homelab Dashboard" className="w-full bg-background border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">{t('settings.language')}</label>
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="w-full bg-background border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-primary"
            >
              <option value="de">Deutsch</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </div>
      <div className="p-6 rounded-lg border border-border bg-content">
        <h2 className="text-xl font-semibold mb-2 text-text">{t('settings.timezoneDate')}</h2>
        <div className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">{t('settings.timezone')}</label>
            <select className="w-full bg-background border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-primary">
              <option>Europe/Berlin</option>
              <option>UTC</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

function NotificationsTab() {
  const { t } = useLanguage();
  return (
    <div className="grid grid-cols-1 gap-6 max-w-3xl">
      <div className="p-6 rounded-lg border border-border bg-content">
        <h2 className="text-xl font-semibold mb-4 text-text">{t('settings.notifications')}</h2>
        <div className="space-y-4">
          <p className="text-text-secondary text-sm italic">{t('settings.empty')}</p>
        </div>
      </div>
    </div>
  );
}

function AdvancedTab() {
  const { t } = useLanguage();
  const [haDomain, setHaDomain] = useState(localStorage.getItem('haDomain') || "https://");

  const saveHaDomain = () => {
    localStorage.setItem('haDomain', haDomain);
    alert(t('settings.save')); // Optional feedback, but keeps it simple
  };

  return (
    <div className="grid grid-cols-1 gap-6 max-w-3xl">
      <div className="p-6 rounded-lg border border-border bg-content">
        <h2 className="text-xl font-semibold mb-4 text-text">{t('settings.integration')}</h2>
        
        {/* Home Assistant Integration */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-medium text-text">{t('settings.haDomain')}</h3>
              <p className="text-sm text-text-secondary">{t('settings.haDomain.desc')}</p>
            </div>
          </div>
          <div className="flex gap-2 w-full max-w-md">
            <input 
              type="url" 
              placeholder={t('settings.haDomain.placeholder')} 
              value={haDomain}
              onChange={(e) => setHaDomain(e.target.value)}
              className="flex-1 bg-background border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-primary" 
            />
            <button 
              onClick={saveHaDomain}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:shadow-[0_0_15px_color-mix(in_srgb,var(--color-primary)_50%,transparent)] transition-all"
            >
              {t('settings.save')}
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-lg border border-border bg-content">
        <h2 className="text-xl font-semibold mb-4 text-text">{t('settings.advanced')}</h2>
        <div className="space-y-4">
          <p className="text-text-secondary text-sm italic">{t('settings.empty')}</p>
        </div>
      </div>
    </div>
  );
}

export default function Settings() {
  const { theme, setTheme, availableThemes } = useTheme();
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'allgemein' | 'darstellung' | 'benachrichtigungen' | 'erweitert'>('allgemein');

  const themeLabels: Record<string, string> = {
    midnight: "🌃 Midnight",
    oled: "⬛ OLED",
    cyberpunk: "🤖 Cyberpunk",
    github: "🐙 GitHub",
    japan: "🌸 Japan",
    forest: "🌲 Forest",
  };

  const tabTitles = {
    allgemein: t('settings.general'),
    darstellung: t('settings.appearance'),
    benachrichtigungen: t('settings.notifications'),
    erweitert: t('settings.advanced')
  };

  const tabDescriptions = {
    allgemein: t('settings.general.desc'),
    darstellung: t('settings.appearance.desc'),
    benachrichtigungen: t('settings.notifications.desc'),
    erweitert: t('settings.advanced.desc')
  };

  return (
    <div className="flex h-[80vh] overflow-hidden">
      {/* Sidebar Navigation for Modal */}
      <div className="w-64 border-r border-border bg-content/50 p-4 shrink-0 overflow-y-auto hidden md:block">
        <h2 className="text-xl font-bold mb-6 text-text px-2">{t('settings.title')}</h2>
        <nav className="space-y-1">
          <button 
            onClick={() => setActiveTab('allgemein')}
            className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeTab === 'allgemein' ? 'bg-[color-mix(in_srgb,var(--color-primary)_20%,transparent)] text-primary font-medium' : 'text-text hover:bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)] hover:text-primary'}`}
          >
            {t('settings.general')}
          </button>
          <button 
            onClick={() => setActiveTab('darstellung')}
            className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeTab === 'darstellung' ? 'bg-[color-mix(in_srgb,var(--color-primary)_20%,transparent)] text-primary font-medium' : 'text-text hover:bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)] hover:text-primary'}`}
          >
            {t('settings.appearance')}
          </button>
          <button 
            onClick={() => setActiveTab('benachrichtigungen')}
            className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeTab === 'benachrichtigungen' ? 'bg-[color-mix(in_srgb,var(--color-primary)_20%,transparent)] text-primary font-medium' : 'text-text hover:bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)] hover:text-primary'}`}
          >
            {t('settings.notifications')}
          </button>
          <button 
            onClick={() => setActiveTab('erweitert')}
            className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeTab === 'erweitert' ? 'bg-[color-mix(in_srgb,var(--color-primary)_20%,transparent)] text-primary font-medium' : 'text-text hover:bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)] hover:text-primary'}`}
          >
            {t('settings.advanced')}
          </button>
        </nav>
      </div>

      <div className="flex-1 p-6 md:p-8 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-text">{tabTitles[activeTab]}</h1>
          <p className="text-text-secondary">{tabDescriptions[activeTab]}</p>
        </div>

        {activeTab === 'allgemein' && <GeneralTab />}
        
        {activeTab === 'darstellung' && (
          <div className="grid grid-cols-1 gap-6 max-w-3xl">
            <div className="p-6 rounded-lg border border-border bg-content">
              <h2 className="text-xl font-semibold mb-4 text-text">{t('settings.theme')}</h2>
              
              {/* Dropdown Button */}
              <div className="relative">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="w-full px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-between bg-primary text-white hover:shadow-[0_0_20px_color-mix(in_srgb,var(--color-primary)_60%,transparent)] hover:-translate-y-0.5"
                >
                  <span>{themeLabels[theme]}</span>
                  <ChevronDown
                    size={18}
                    className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Dropdown Menu */}
                {isOpen && (
                  <div className="absolute top-full left-0 right-0 mt-3 rounded-lg border border-border bg-content shadow-xl shadow-black/50 z-10 overflow-hidden transform origin-top transition-all">
                    {availableThemes.map((t: Theme) => (
                      <button
                        key={t}
                        onClick={() => {
                          setTheme(t);
                          setIsOpen(false);
                        }}
                        className={`w-full px-4 py-3 text-left transition-all duration-200 border-b border-border last:border-b-0 ${
                          theme === t
                            ? "bg-primary text-white"
                            : "bg-content text-text hover:bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)] hover:text-primary hover:pl-6"
                        }`}
                      >
                        {themeLabels[t]}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'benachrichtigungen' && <NotificationsTab />}
        {activeTab === 'erweitert' && <AdvancedTab />}
      </div>
    </div>
  );
}
