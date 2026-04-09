import { useLanguage } from "@/context/LanguageContext";
import type { Language } from "@/i18n/translations";

export default function GeneralTab() {
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
              <option value="en">English</option>
              <option value="de">Deutsch</option>
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
