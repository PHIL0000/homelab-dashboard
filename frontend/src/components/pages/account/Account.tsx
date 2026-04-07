import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';

import ProfileTab from './tabs/ProfileTab';
import SecurityTab from './tabs/SecurityTab';
import ConnectionsTab from './tabs/ConnectionsTab';

export default function Account() {
  const { t } = useLanguage();
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'connections'>('profile');

  const tabTitles = {
    profile: t('account.profile'),
    security: t('account.security'),
    connections: t('account.connections')
  };

  const tabDescriptions = {
    profile: t('account.profile.desc'),
    security: t('account.security.desc'),
    connections: t('account.connections.desc')
  };

  return (
    <div className="flex h-[80vh] overflow-hidden">
      {/* Sidebar Navigation for Modal */}
      <div className="w-64 border-r border-border bg-content/50 p-4 shrink-0 overflow-y-auto hidden md:block">
        <h2 className="text-xl font-bold mb-6 text-text px-2">{t('account.title')}</h2>
        <nav className="space-y-1">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeTab === 'profile' ? 'bg-[color-mix(in_srgb,var(--color-primary)_20%,transparent)] text-primary font-medium' : 'text-text hover:bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)] hover:text-primary'}`}
          >
            {t('account.profile')}
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeTab === 'security' ? 'bg-[color-mix(in_srgb,var(--color-primary)_20%,transparent)] text-primary font-medium' : 'text-text hover:bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)] hover:text-primary'}`}
          >
            {t('account.security')}
          </button>
          <button 
            onClick={() => setActiveTab('connections')}
            className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeTab === 'connections' ? 'bg-[color-mix(in_srgb,var(--color-primary)_20%,transparent)] text-primary font-medium' : 'text-text hover:bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)] hover:text-primary'}`}
          >
            {t('account.connections')}
          </button>
          <button 
            onClick={() => logout()}
            className="w-full text-left px-4 py-2 rounded-lg text-text hover:bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)] hover:text-primary transition-colors mt-8 text-red-400 hover:text-red-500 hover:bg-red-500/10"
          >
            {t('account.logout')}
          </button>
        </nav>
      </div>

      <div className="flex-1 p-6 md:p-8 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-text mb-2">{tabTitles[activeTab]}</h1>
          <p className="text-text-secondary">{tabDescriptions[activeTab]}</p>
        </div>

        {activeTab === 'profile' && <ProfileTab />}
        {activeTab === 'security' && <SecurityTab />}
        {activeTab === 'connections' && <ConnectionsTab />}
      </div>
    </div>
  )
}

