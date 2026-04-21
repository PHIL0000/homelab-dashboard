import { Button, Card } from "@heroui/react";
import { Home, Cloud } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function ConnectionsTab() {
  const { t } = useLanguage();
  return (
    <div className="grid grid-cols-1 gap-6 max-w-3xl">
      <Card className="p-6 bg-slate-900/50 border border-slate-700/50">
        <h2 className="text-xl font-semibold mb-2 text-slate-100">
          {t("account.connectedServices")}
        </h2>
        <p className="text-slate-400 mb-6">{t("account.connections.notice")}</p>

        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border border-slate-700/50 rounded-lg bg-slate-800/30">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                <Home size={20} />
              </div>
              <div>
                <h3 className="text-lg font-medium text-slate-100">
                  Home Assistant
                </h3>
                <p className="text-sm text-slate-400">
                  {t("account.connections.ha.desc")}
                </p>
                <span className="text-xs text-slate-500 inline-block mt-1">
                  {t("account.notConnected")}
                </span>
              </div>
            </div>
            <Button
              className="px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/30 transition-all whitespace-nowrap"
              variant="ghost"
            >
              {t("account.connect")}
            </Button>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border border-slate-700/50 rounded-lg bg-slate-800/30">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-sky-500/10 flex items-center justify-center text-sky-500">
                <Cloud size={20} />
              </div>
              <div>
                <h3 className="text-lg font-medium text-slate-100">
                  Nextcloud
                </h3>
                <p className="text-sm text-slate-400">
                  {t("account.connections.nc.desc")}
                </p>
                <span className="text-xs text-slate-500 inline-block mt-1">
                  {t("account.notConnected")}
                </span>
              </div>
            </div>
            <Button
              className="px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/30 transition-all whitespace-nowrap"
              variant="ghost"
            >
              {t("account.connect")}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
