import { useState } from 'react';
import { Button } from '@heroui/react';
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
          <Button
            onClick={() => setActiveTab('profile')}
            className={`w-full text-left px-4 py-2 rounded-lg transition-colors !border-0 !border-transparent !ring-0 !shadow-none ${activeTab === 'profile' ? 'bg-[color-mix(in_srgb,var(--color-primary)_20%,transparent)] text-primary font-medium' : 'text-text hover:bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)] hover:text-primary'}`}
            variant="ghost"
          >
            {t('account.profile')}
          </Button>
          <Button
            onClick={() => setActiveTab('security')}
            className={`w-full text-left px-4 py-2 rounded-lg transition-colors !border-0 !border-transparent !ring-0 !shadow-none ${activeTab === 'security' ? 'bg-[color-mix(in_srgb,var(--color-primary)_20%,transparent)] text-primary font-medium' : 'text-text hover:bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)] hover:text-primary'}`}
            variant="ghost"
          >
            {t('account.security')}
          </Button>
          <Button
            onClick={() => setActiveTab('connections')}
            className={`w-full text-left px-4 py-2 rounded-lg transition-colors !border-0 !border-transparent !ring-0 !shadow-none ${activeTab === 'connections' ? 'bg-[color-mix(in_srgb,var(--color-primary)_20%,transparent)] text-primary font-medium' : 'text-text hover:bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)] hover:text-primary'}`}
            variant="ghost"
          >
            {t('account.connections')}
          </Button>
          <Button
            onClick={() => logout()}
            className="w-full text-left px-4 py-2 rounded-lg text-text hover:bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)] hover:text-primary transition-colors mt-8 text-red-400 hover:text-red-500 hover:bg-red-500/10 !border-0 !border-transparent !ring-0 !shadow-none"
            variant="ghost"
          >
            {t('account.logout')}
          </Button>
        </nav>
      </div>

      <div className="flex-1 p-4 md:p-6 overflow-y-auto">
        <div className="mb-5 pb-3 border-b border-border">
          <h1 className="text-2xl font-bold text-primary mb-1">{tabTitles[activeTab]}</h1>
          <p className="text-sm text-text-secondary">{tabDescriptions[activeTab]}</p>
        </div>

        {activeTab === 'profile' && <ProfileTab />}
        {activeTab === 'security' && <SecurityTab />}
        {activeTab === 'connections' && <ConnectionsTab />}
      </div>
    </div>
  )
}

