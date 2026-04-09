import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";

import GeneralTab from "./tabs/GeneralTab";
import AppearanceTab from "./tabs/AppearanceTab";
import NotificationsTab from "./tabs/NotificationsTab";
import AdvancedTab from "./tabs/AdvancedTab";
import UsersTab from "./tabs/UsersTab";

export default function Settings() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'general' | 'appearance' | 'notifications' | 'users' | 'advanced'>('general');                           
  const tabTitles = {
    general: t('settings.general'),
    appearance: t('settings.appearance'),
    notifications: t('settings.notifications'),
    users: t('settings.users') || 'Users',
    advanced: t('settings.advanced')
  };

  const tabDescriptions = {
    general: t('settings.general.desc'),
    appearance: t('settings.appearance.desc'),
    notifications: t('settings.notifications.desc'),
    users: t('settings.users.desc') || 'Manage and create user accounts',
    advanced: t('settings.advanced.desc')
  };

  return (
    <div className="flex h-[80vh] overflow-hidden">
      {/* Sidebar Navigation for Modal */}
      <div className="w-64 border-r border-border bg-content/50 p-4 shrink-0 overflow-y-auto hidden md:block">                                      
        <h2 className="text-xl font-bold mb-6 text-text px-2">{t('settings.title')}</h2>                                                            
        <nav className="space-y-1">
          <button 
            onClick={() => setActiveTab('general')}
            className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeTab === 'general' ? 'bg-[color-mix(in_srgb,var(--color-primary)_20%,transparent)] text-primary font-medium' : 'text-text hover:bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)] hover:text-primary'}`}                                                              >
            {t('settings.general')}
          </button>
          <button 
            onClick={() => setActiveTab('appearance')}
            className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeTab === 'appearance' ? 'bg-[color-mix(in_srgb,var(--color-primary)_20%,transparent)] text-primary font-medium' : 'text-text hover:bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)] hover:text-primary'}`}                                                           >
            {t('settings.appearance')}
          </button>
          <button 
            onClick={() => setActiveTab('notifications')}
            className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeTab === 'notifications' ? 'bg-[color-mix(in_srgb,var(--color-primary)_20%,transparent)] text-primary font-medium' : 'text-text hover:bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)] hover:text-primary'}`}                                                        >
            {t('settings.notifications')}
          </button>
          
          {user && user.role === 'ADMIN' && (
            <>
              <button 
                onClick={() => setActiveTab('users')}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeTab === 'users' ? 'bg-[color-mix(in_srgb,var(--color-primary)_20%,transparent)] text-primary font-medium' : 'text-text hover:bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)] hover:text-primary'}`}
              >
                {t('settings.users') || 'Users'}
              </button>
              <button 
                onClick={() => setActiveTab('advanced')}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeTab === 'advanced' ? 'bg-[color-mix(in_srgb,var(--color-primary)_20%,transparent)] text-primary font-medium' : 'text-text hover:bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)] hover:text-primary'}`}                                                             >
                {t('settings.advanced')}
              </button>
            </>
          )}
        </nav>
      </div>

      <div className="flex-1 p-4 md:p-6 overflow-y-auto">
        <div className="mb-5 pb-3 border-b border-border">
          <h1 className="text-2xl font-bold mb-1 text-primary">{tabTitles[activeTab]}</h1>
          <p className="text-sm text-text-secondary">{tabDescriptions[activeTab]}</p>
        </div>

        {activeTab === 'general' && <GeneralTab />}
        {activeTab === 'appearance' && <AppearanceTab />}
        {activeTab === 'notifications' && <NotificationsTab />}
        {activeTab === 'users' && user?.role === 'ADMIN' && <UsersTab />}
        {activeTab === 'advanced' && user?.role === 'ADMIN' && <AdvancedTab />}
      </div>
    </div>
  );
}
