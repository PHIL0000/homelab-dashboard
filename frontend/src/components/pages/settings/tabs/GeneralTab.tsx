import { useLanguage } from "@/context/LanguageContext";
import { Select, ListBox } from "@heroui/react";
import { ChevronDown } from "lucide-react";
import type { Key } from "react";
import type { Language } from "@/i18n/translations";

export default function GeneralTab() {
  const { t, language, setLanguage } = useLanguage();

  const timezoneOptions = [
    { key: "Europe/Berlin", label: "Europe/Berlin" },
    { key: "UTC", label: "UTC" },
  ];

  const handleLanguageChange = (key: Key | null) => {
    if (key != null) {
      const value = String(key);
      if (value === "en" || value === "de") {
        setLanguage(value as Language);
      }
    }
  };
  
  return (
    <div className="grid grid-cols-1 gap-6 max-w-3xl">
      <div className="p-6 rounded-lg border border-border bg-content">
        <h2 className="text-xl font-semibold mb-4 text-text">{t('settings.dashboardInfo')}</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">{t('settings.dashboardName')}</label>
            <input
              type="text"
              defaultValue="Homelab Dashboard"
              className="w-full bg-background border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">{t('settings.language')}</label>
            <Select
              selectedKey={language}
              onChange={handleLanguageChange}
              className="w-full"
            >
              <Select.Trigger className="w-full px-3 flex items-center justify-between">
                <Select.Value />
                <ChevronDown size={16} className="text-text-secondary" />
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
      <div className="p-6 rounded-lg border border-border bg-content">
        <h2 className="text-xl font-semibold mb-2 text-text">{t('settings.timezoneDate')}</h2>
        <div className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">{t('settings.timezone')}</label>
            <Select
              defaultSelectedKey="Europe/Berlin"
              className="w-full"
            >
              <Select.Trigger className="w-full px-3 flex items-center justify-between">
                <Select.Value />
                <ChevronDown size={16} className="text-text-secondary" />
              </Select.Trigger>
              <Select.Popover className="w-[var(--trigger-width)]">
                <ListBox>
                  {timezoneOptions.map((timezone) => (
                    <ListBox.Item key={timezone.key} id={timezone.key} className="pl-2">{timezone.label}</ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
