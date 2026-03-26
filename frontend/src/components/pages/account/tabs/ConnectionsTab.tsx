import { Card } from '@heroui/react'
import { Home, Cloud } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function ConnectionsTab() {
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
