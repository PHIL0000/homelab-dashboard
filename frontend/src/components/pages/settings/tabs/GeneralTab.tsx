import { useLanguage } from "@/context/LanguageContext";
import type { Language } from "@/i18n/translations";

export default function GeneralTab() {
  const { t, language, setLanguage } = useLanguage();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === "en" || value === "de") {
      setLanguage(value as Language);
    }
  };
  
  return (
    <div className="grid grid-cols-1 gap-6 max-w-3xl">
      <div className="p-6 rounded-lg border border-slate-700/50 bg-slate-900/50">
        <h2 className="text-xl font-semibold mb-4 text-slate-100">{t('settings.dashboardInfo')}</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">{t('settings.dashboardName')}</label>
            <input
              type="text"
              defaultValue="Homelab Dashboard"
              className="w-full bg-slate-800 border border-slate-700/50 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">{t('settings.language')}</label>
            <select
              value={language}
              onChange={handleLanguageChange}
              className="w-full bg-slate-800 border border-slate-700/50 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-purple-500"
            >
              <option value="en">English</option>
              <option value="de">Deutsch</option>
            </select>
          </div>
        </div>
      </div>
      <div className="p-6 rounded-lg border border-slate-700/50 bg-slate-900/50">
        <h2 className="text-xl font-semibold mb-2 text-slate-100">{t('settings.timezoneDate')}</h2>
        <div className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">{t('settings.timezone')}</label>
            <select
              defaultValue="Europe/Berlin"
              className="w-full bg-slate-800 border border-slate-700/50 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-purple-500"
            >
              <option value="Europe/Berlin">Europe/Berlin</option>
              <option value="UTC">UTC</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
