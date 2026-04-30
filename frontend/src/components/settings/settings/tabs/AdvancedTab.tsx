import { useState, useEffect } from "react";
import { showError, showSuccess } from '../../../../toast';
import { Button, Input } from "@heroui/react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";

export default function AdvancedTab() {
  const { t } = useLanguage();
  const { token } = useAuth();
  const [haDomain, setHaDomain] = useState("http://homeassistant.local:8123");
  const [isSaving, setIsSaving] = useState(false);
  // Toasts werden global angezeigt, kein lokaler message-State mehr nötig

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/settings");
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
    try {
      const res = await fetch("http://localhost:3001/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ haDomain }),
      });

      if (!res.ok) {
        throw new Error("Failed to save settings");
      }

      showSuccess(t("settings.save") + " Successful!");
    } catch (error: any) {
  showError(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 max-w-3xl">
      <div className="p-6 rounded-lg border border-slate-700/50 bg-slate-900/50">
        <h2 className="text-xl font-semibold mb-4 text-slate-100">
          {t("settings.integration")}
        </h2>

        {/* Toasts werden global angezeigt */}

        {/* Home Assistant Integration */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-medium text-slate-100">
                {t("settings.haDomain")}
              </h3>
              <p className="text-sm text-slate-400">
                {t("settings.haDomain.desc")}
              </p>
            </div>
          </div>
          <div className="flex gap-2 w-full max-w-md">
            <Input
              type="url"
              placeholder={t("settings.haDomain.placeholder")}
              value={haDomain}
              onChange={(e) => setHaDomain(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={saveHaDomain}
              isDisabled={isSaving}
              className="text-sm px-3 py-2 rounded-lg bg-purple-600 text-white font-medium hover:shadow-[0_0_15px_rgba(168,_85,_247,_0.5)] transition-all disabled:opacity-50"
              variant="primary"
            >
              {isSaving ? "Saving..." : t("settings.save")}
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-lg border border-slate-700/50 bg-slate-900/50">
        <h2 className="text-xl font-semibold mb-4 text-slate-100">
          {t("settings.advanced")}
        </h2>
        <div className="space-y-4">
          <p className="text-slate-400 text-sm italic">{t("settings.empty")}</p>
        </div>
      </div>
    </div>
  );
}
