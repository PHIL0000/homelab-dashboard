import { useLanguage } from "@/context/LanguageContext";

export default function NotificationsTab() {
  const { t } = useLanguage();
  return (
    <div className="grid grid-cols-1 gap-6 max-w-3xl">
      <div className="p-6 rounded-lg border border-slate-700/50 bg-slate-900/50">
        <h2 className="text-xl font-semibold mb-4 text-slate-100">
          {t("settings.notifications")}
        </h2>
        <div className="space-y-4">
          <p className="text-slate-400 text-sm italic">{t("settings.empty")}</p>
        </div>
      </div>
    </div>
  );
}
