import { useState } from 'react';
import { useLanguage } from "@/context/LanguageContext";

export default function AdvancedTab() {
  const { t } = useLanguage();
  const [haDomain, setHaDomain] = useState(localStorage.getItem('haDomain') || "https://");

  const saveHaDomain = () => {
    localStorage.setItem('haDomain', haDomain);
    alert(t('settings.save')); // Optional feedback, but keeps it simple
  };

  return (
    <div className="grid grid-cols-1 gap-6 max-w-3xl">
      <div className="p-6 rounded-lg border border-border bg-content">
        <h2 className="text-xl font-semibold mb-4 text-text">{t('settings.integration')}</h2>
        
        {/* Home Assistant Integration */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-medium text-text">{t('settings.haDomain')}</h3>
              <p className="text-sm text-text-secondary">{t('settings.haDomain.desc')}</p>
            </div>
          </div>
          <div className="flex gap-2 w-full max-w-md">
            <input 
              type="url" 
              placeholder={t('settings.haDomain.placeholder')} 
              value={haDomain}
              onChange={(e) => setHaDomain(e.target.value)}
              className="flex-1 bg-background border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-primary" 
            />
            <button 
              onClick={saveHaDomain}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:shadow-[0_0_15px_color-mix(in_srgb,var(--color-primary)_50%,transparent)] transition-all"
            >
              {t('settings.save')}
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-lg border border-border bg-content">
        <h2 className="text-xl font-semibold mb-4 text-text">{t('settings.advanced')}</h2>
        <div className="space-y-4">
          <p className="text-text-secondary text-sm italic">{t('settings.empty')}</p>
        </div>
      </div>
    </div>
  );
}
