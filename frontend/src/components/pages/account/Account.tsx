import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';

import ProfileTab from './tabs/ProfileTab';
import SecurityTab from './tabs/SecurityTab';
import ConnectionsTab from './tabs/ConnectionsTab';

export default function Account() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'profil' | 'sicherheit' | 'verknuepfungen'>('profil');

  const tabTitles = {
    profil: t('account.profile'),
    sicherheit: t('account.security'),
    verknuepfungen: t('account.connections')
  };

  const tabDescriptions = {
    profil: t('account.profile.desc'),
    sicherheit: t('account.security.desc'),
    verknuepfungen: t('account.connections.desc')
  };

  return (
    <div className="flex h-[80vh] overflow-hidden">
      {/* Sidebar Navigation for Modal */}
      <div className="w-64 border-r border-border bg-content/50 p-4 shrink-0 overflow-y-auto hidden md:block">
        <h2 className="text-xl font-bold mb-6 text-text px-2">{t('account.title')}</h2>
        <nav className="space-y-1">
          <button 
            onClick={() => setActiveTab('profil')}
            className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeTab === 'profil' ? 'bg-[color-mix(in_srgb,var(--color-primary)_20%,transparent)] text-primary font-medium' : 'text-text hover:bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)] hover:text-primary'}`}
          >
            {t('account.profile')}
          </button>
          <button 
            onClick={() => setActiveTab('sicherheit')}
            className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeTab === 'sicherheit' ? 'bg-[color-mix(in_srgb,var(--color-primary)_20%,transparent)] text-primary font-medium' : 'text-text hover:bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)] hover:text-primary'}`}
          >
            {t('account.security')}
          </button>
          <button 
            onClick={() => setActiveTab('verknuepfungen')}
            className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeTab === 'verknuepfungen' ? 'bg-[color-mix(in_srgb,var(--color-primary)_20%,transparent)] text-primary font-medium' : 'text-text hover:bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)] hover:text-primary'}`}
          >
            {t('account.connections')}
          </button>
          <button className="w-full text-left px-4 py-2 rounded-lg text-text hover:bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)] hover:text-primary transition-colors mt-8 text-red-400 hover:text-red-500 hover:bg-red-500/10">
            {t('account.logout')}
          </button>
        </nav>
      </div>

      <div className="flex-1 p-6 md:p-8 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-text mb-2">{tabTitles[activeTab]}</h1>
          <p className="text-text-secondary">{tabDescriptions[activeTab]}</p>
        </div>

        {activeTab === 'profil' && <ProfileTab />}
        {activeTab === 'sicherheit' && <SecurityTab />}
        {activeTab === 'verknuepfungen' && <ConnectionsTab />}
      </div>
    </div>
  )
}

