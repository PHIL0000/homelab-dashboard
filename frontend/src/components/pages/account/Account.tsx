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
      <div className="w-64 border-r border-slate-700/50 bg-slate-900/30 p-4 shrink-0 overflow-y-auto hidden md:block">
        <h2 className="text-xl font-bold mb-6 text-slate-100 px-2">{t('account.title')}</h2>
        <nav className="space-y-1">
          <Button
            onClick={() => setActiveTab('profile')}
            className={`w-full justify-start px-4 py-2 rounded-lg transition-all ${activeTab === 'profile' ? 'bg-purple-600/30 text-purple-300 font-medium border-l-2 border-purple-500' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-700/30'}`}
            variant="ghost"
          >
            {t('account.profile')}
          </Button>
          <Button
            onClick={() => setActiveTab('security')}
            className={`w-full justify-start px-4 py-2 rounded-lg transition-all ${activeTab === 'security' ? 'bg-purple-600/30 text-purple-300 font-medium border-l-2 border-purple-500' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-700/30'}`}
            variant="ghost"
          >
            {t('account.security')}
          </Button>
          <Button
            onClick={() => setActiveTab('connections')}
            className={`w-full justify-start px-4 py-2 rounded-lg transition-all ${activeTab === 'connections' ? 'bg-purple-600/30 text-purple-300 font-medium border-l-2 border-purple-500' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-700/30'}`}
            variant="ghost"
          >
            {t('account.connections')}
          </Button>
          <Button
            onClick={() => logout()}
            className="w-full justify-start px-4 py-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all mt-8"
            variant="ghost"
          >
            {t('account.logout')}
          </Button>
        </nav>
      </div>

      <div className="flex-1 p-4 md:p-6 overflow-y-auto">
        <div className="mb-5 pb-3 border-b border-slate-700/50">
          <h1 className="text-2xl font-bold text-purple-400 mb-1">{tabTitles[activeTab]}</h1>
          <p className="text-sm text-slate-400">{tabDescriptions[activeTab]}</p>
        </div>

        {activeTab === 'profile' && <ProfileTab />}
        {activeTab === 'security' && <SecurityTab />}
        {activeTab === 'connections' && <ConnectionsTab />}
      </div>
    </div>
  )
}

