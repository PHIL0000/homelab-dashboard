import { useState, useEffect } from 'react';
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";

export default function AdvancedTab() {
  const { t } = useLanguage();
  const { token } = useAuth();
  const [haDomain, setHaDomain] = useState("https://");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/settings');
        if (res.ok) {
          const data = await res.json();
          if (data.haDomain) {
            setHaDomain(data.haDomain);
          }
        }
      } catch (error) {
        console.error("Failed to load HA domain", error);
      }
    };
    fetchSettings();
  }, []);

  const saveHaDomain = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      const res = await fetch('http://localhost:3001/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ haDomain })
      });
      
      if (!res.ok) {
        throw new Error('Failed to save settings');
      }
      
      setMessage({ type: 'success', text: t('settings.save') + " Successful!" });
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 max-w-3xl">
      <div className="p-6 rounded-lg border border-border bg-content">
        <h2 className="text-xl font-semibold mb-4 text-text">{t('settings.integration')}</h2>
        
        {message && (
          <div className={`p-3 rounded-lg mb-4 ${message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            {message.text}
          </div>
        )}

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
              disabled={isSaving}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:shadow-[0_0_15px_color-mix(in_srgb,var(--color-primary)_50%,transparent)] transition-all disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : t('settings.save')}
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
