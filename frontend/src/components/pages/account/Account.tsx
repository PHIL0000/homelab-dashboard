import { useState } from 'react';
import { Card } from '@heroui/react'
import { Home, Cloud } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

function ProfileTab() {
  const { t } = useLanguage();
  return (
    <div className="grid grid-cols-1 gap-6 max-w-3xl">
      <Card className="p-6 bg-content border border-border">
        <h2 className="text-xl font-semibold mb-2 text-text">{t('account.profileInfo')}</h2>
        <div className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">{t('account.username')}</label>
            <input type="text" defaultValue="User" className="w-full bg-background border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">{t('account.email')}</label>
            <input type="email" defaultValue="user@example.com" className="w-full bg-background border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-primary" />
          </div>
          <button className="px-4 py-2 bg-primary text-white rounded-lg hover:shadow-[0_0_15px_color-mix(in_srgb,var(--color-primary)_50%,transparent)] transition-all">
            {t('account.saveChanges')}
          </button>
        </div>
      </Card>
      <Card className="p-6 bg-content border border-border">
        <h2 className="text-xl font-semibold mb-2 text-text">{t('account.profileImage')}</h2>
        <div className="flex items-center gap-4 mt-4">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-xl font-bold text-white shadow-[0_0_15px_color-mix(in_srgb,var(--color-primary)_50%,transparent)]">
            U
          </div>
          <button className="px-4 py-2 border border-border text-text rounded-lg hover:bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)] hover:text-primary transition-all">
            {t('account.changeImage')}
          </button>
        </div>
      </Card>
    </div>
  );
}

function SecurityTab() {
  const { t } = useLanguage();
  return (
    <div className="grid grid-cols-1 gap-6 max-w-3xl">
      <Card className="p-6 bg-content border border-border">
        <h2 className="text-xl font-semibold mb-2 text-text">{t('account.changePassword')}</h2>
        <div className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">{t('account.currentPassword')}</label>
            <input type="password" placeholder="••••••••" className="w-full bg-background border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">{t('account.newPassword')}</label>
            <input type="password" placeholder="••••••••" className="w-full bg-background border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-primary" />
          </div>
          <button className="px-4 py-2 bg-primary text-white rounded-lg hover:shadow-[0_0_15px_color-mix(in_srgb,var(--color-primary)_50%,transparent)] transition-all">
            {t('account.updatePassword')}
          </button>
        </div>
      </Card>
      <Card className="p-6 bg-content border border-border">
        <h2 className="text-xl font-semibold mb-2 text-text">{t('account.2fa')}</h2>
        <p className="text-text-secondary mb-4">{t('account.2fa.desc')}</p>
        <button className="px-4 py-2 border border-border text-text rounded-lg hover:bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)] hover:text-primary transition-all">
          {t('account.2fa.setup')}
        </button>
      </Card>
    </div>
  );
}

function ConnectionsTab() {
  const { t } = useLanguage();
  return (
    <div className="grid grid-cols-1 gap-6 max-w-3xl">
      <Card className="p-6 bg-content border border-border">
        <h2 className="text-xl font-semibold mb-2 text-text">{t('account.connectedServices')}</h2>
        <p className="text-text-secondary mb-6">{t('account.connections.notice')}</p>
        
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border border-border rounded-lg bg-background">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                <Home size={20} />
              </div>
              <div>
                <h3 className="text-lg font-medium text-text">Home Assistant</h3>
                <p className="text-sm text-text-secondary">{t('account.connections.ha.desc')}</p>
                <span className="text-xs text-text-secondary inline-block mt-1">{t('account.notConnected')}</span>
              </div>
            </div>
            <button className="px-4 py-2 border border-border text-text rounded-lg hover:bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)] hover:text-primary transition-all whitespace-nowrap">
              {t('account.connect')}
            </button>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border border-border rounded-lg bg-background">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-sky-500/10 flex items-center justify-center text-sky-500">
                <Cloud size={20} />
              </div>
              <div>
                <h3 className="text-lg font-medium text-text">Nextcloud</h3>
                <p className="text-sm text-text-secondary">{t('account.connections.nc.desc')}</p>
                <span className="text-xs text-text-secondary inline-block mt-1">{t('account.notConnected')}</span>
              </div>
            </div>
            <button className="px-4 py-2 border border-border text-text rounded-lg hover:bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)] hover:text-primary transition-all whitespace-nowrap">
              {t('account.connect')}
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}

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
