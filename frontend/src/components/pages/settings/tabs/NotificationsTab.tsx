import { useLanguage } from "@/context/LanguageContext";

export default function NotificationsTab() {
  const { t } = useLanguage();
  return (
    <div className="grid grid-cols-1 gap-6 max-w-3xl">
      <div className="p-6 rounded-lg border border-border bg-content">
        <h2 className="text-xl font-semibold mb-4 text-text">{t('settings.notifications')}</h2>
        <div className="space-y-4">
          <p className="text-text-secondary text-sm italic">{t('settings.empty')}</p>
        </div>
      </div>
    </div>
  );
}
