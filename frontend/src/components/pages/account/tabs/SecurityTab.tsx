import { Card } from '@heroui/react'
import { useLanguage } from '@/context/LanguageContext';

export default function SecurityTab() {
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
