import { useEffect, useState } from 'react';
import { Button, Input, Select, ListBox } from '@heroui/react';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from "@/context/LanguageContext";
import type { Language } from "@/i18n/translations";
import { useAuth } from '@/context/AuthContext';

const TIMEZONE_OPTIONS = [
  'Europe/Berlin',
  'UTC',
  'Europe/London',
  'America/New_York',
  'America/Los_Angeles',
  'Asia/Tokyo'
];

const DATE_FORMAT_OPTIONS = ['DD-MM-YYYY', 'MM-DD-YYYY', 'YYYY-MM-DD', 'DD.MM.YYYY'] as const;
const TIME_FORMAT_OPTIONS = ['24h', '12h'] as const;

export default function GeneralTab() {
  const { t, language, setLanguage } = useLanguage();
  const { user, token, updateUser } = useAuth();
  const [dashboardName, setDashboardName] = useState('Homelab');
  const [timezone, setTimezone] = useState('Europe/Berlin');
  const [timeFormat, setTimeFormat] = useState<'12h' | '24h'>('24h');
  const [dateFormat, setDateFormat] = useState<'DD-MM-YYYY' | 'MM-DD-YYYY' | 'YYYY-MM-DD' | 'DD.MM.YYYY'>('DD-MM-YYYY');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!user) return;
    setDashboardName(user.dashboardName || 'Homelab');
    setTimezone(user.timezone || 'Europe/Berlin');
    setTimeFormat(user.timeFormat === '12h' ? '12h' : '24h');

    const nextDateFormat = user.dateFormat;
    if (nextDateFormat === 'MM-DD-YYYY' || nextDateFormat === 'YYYY-MM-DD' || nextDateFormat === 'DD.MM.YYYY' || nextDateFormat === 'DD-MM-YYYY') {
      setDateFormat(nextDateFormat);
    } else {
      setDateFormat('DD-MM-YYYY');
    }
  }, [user]);

  const handleLanguageChange = (value: string) => {
    if (value === "en" || value === "de") {
      setLanguage(value as Language);
    }
  };

  const handleSave = async () => {
    if (!user || !token) return;

    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch(`http://localhost:3001/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          dashboardName: dashboardName.trim() || 'Homelab',
          timezone,
          timeFormat,
          dateFormat
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || t('settings.saveError'));
      }

      updateUser(data);
      setMessage({ type: 'success', text: t('settings.saveSuccess') });
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || t('settings.saveError') });
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="doc-theme-form grid grid-cols-1 gap-6 max-w-3xl">
      <div className="p-6 rounded-lg border border-slate-700/50 bg-slate-900/50">
        <h2 className="text-xl font-semibold mb-4 text-slate-100">{t('settings.dashboardInfo')}</h2>
        {message && (
          <div className={`p-3 rounded-lg mb-4 ${message.type === 'success' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
            {message.text}
          </div>
        )}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">{t('settings.dashboardName')}</label>
            <Input
              type="text"
              value={dashboardName}
              onChange={(e) => setDashboardName(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">{t('settings.language')}</label>
            <Select selectedKey={language} onChange={(key) => { if (key != null) handleLanguageChange(String(key)); }} className="w-full">
              <Select.Trigger className="w-full px-3 flex items-center justify-between">
                <Select.Value />
                <ChevronDown size={16} className="text-slate-400" />
              </Select.Trigger>
              <Select.Popover className="w-[var(--trigger-width)]">
                <ListBox>
                  <ListBox.Item id="en" className="pl-2">English</ListBox.Item>
                  <ListBox.Item id="de" className="pl-2">Deutsch</ListBox.Item>
                </ListBox>
              </Select.Popover>
            </Select>
          </div>
        </div>
      </div>
      <div className="p-6 rounded-lg border border-slate-700/50 bg-slate-900/50">
        <h2 className="text-xl font-semibold mb-2 text-slate-100">{t('settings.timezoneDate')}</h2>
        <div className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">{t('settings.timezone')}</label>
            <Select selectedKey={timezone} onChange={(key) => { if (key != null) setTimezone(String(key)); }} className="w-full">
              <Select.Trigger className="w-full px-3 flex items-center justify-between">
                <Select.Value />
                <ChevronDown size={16} className="text-slate-400" />
              </Select.Trigger>
              <Select.Popover className="w-[var(--trigger-width)]">
                <ListBox>
                  {TIMEZONE_OPTIONS.map((zone) => (
                    <ListBox.Item key={zone} id={zone} className="pl-2">{zone}</ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
            </Select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Time Format</label>
              <Select selectedKey={timeFormat} onChange={(key) => { if (key != null) setTimeFormat(String(key) === '12h' ? '12h' : '24h'); }} className="w-full">
                <Select.Trigger className="w-full px-3 flex items-center justify-between">
                  <Select.Value />
                  <ChevronDown size={16} className="text-slate-400" />
                </Select.Trigger>
                <Select.Popover className="w-[var(--trigger-width)]">
                  <ListBox>
                    {TIME_FORMAT_OPTIONS.map((format) => (
                      <ListBox.Item key={format} id={format} className="pl-2">{format}</ListBox.Item>
                    ))}
                  </ListBox>
                </Select.Popover>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Date Format</label>
              <Select selectedKey={dateFormat} onChange={(key) => {
                if (key == null) return;
                const value = String(key);
                if (value === 'MM-DD-YYYY' || value === 'YYYY-MM-DD' || value === 'DD.MM.YYYY' || value === 'DD-MM-YYYY') {
                  setDateFormat(value);
                }
              }} className="w-full">
                <Select.Trigger className="w-full px-3 flex items-center justify-between">
                  <Select.Value />
                  <ChevronDown size={16} className="text-slate-400" />
                </Select.Trigger>
                <Select.Popover className="w-[var(--trigger-width)]">
                  <ListBox>
                    {DATE_FORMAT_OPTIONS.map((format) => (
                      <ListBox.Item key={format} id={format} className="pl-2">{format}</ListBox.Item>
                    ))}
                  </ListBox>
                </Select.Popover>
              </Select>
            </div>
          </div>
          <Button
            type="button"
            isDisabled={isSaving}
            onClick={handleSave}
            className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:shadow-[0_0_15px_color-mix(in_srgb,var(--color-glow)_50%,transparent)] transition-all disabled:opacity-50"
          >
            {isSaving ? `${t('settings.save')}...` : t('settings.save')}
          </Button>
        </div>
      </div>
    </div>
  );
}
