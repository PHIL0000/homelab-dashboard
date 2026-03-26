import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

import GeneralTab from "./tabs/GeneralTab";
import AppearanceTab from "./tabs/AppearanceTab";
import NotificationsTab from "./tabs/NotificationsTab";
import AdvancedTab from "./tabs/AdvancedTab";

export default function Settings() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'allgemein' | 'darstellung' | 'benachrichtigungen' | 'erweitert'>('allgemein');

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
        {activeTab === 'darstellung' && <AppearanceTab />}
        {activeTab === 'benachrichtigungen' && <NotificationsTab />}
        {activeTab === 'erweitert' && <AdvancedTab />}
      </div>
    </div>
  );
}
