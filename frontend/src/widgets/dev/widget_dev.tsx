import { useState, useEffect } from "react";
import { Card, Chip } from "@heroui/react";
import { Monitor } from "lucide-react";
import type { WidgetDefinition, WidgetComponentProps } from "../types";
import { useLanguage } from "@/context/LanguageContext";

function DevInfoWidget({ isEditing }: WidgetComponentProps) {
  const { t } = useLanguage();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="h-full p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Monitor size={16} className="text-primary" />
        <span className="font-medium text-sm">{t("widget.dev.name")}</span>
        {isEditing && (
          <Chip size="sm" variant="soft" className="ml-auto text-xs">
            {t("common.editChip")}
          </Chip>
        )}
      </div>
      <div className="text-sm space-y-2 flex-1">
        <div className="flex justify-between items-center">
          <span className="text-default-500">{t("widget.dev.widgetSystem")}</span>
          <Chip size="sm" variant="soft">{t("widget.dev.active")}</Chip>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-500">{t("widget.dev.registry")}</span>
          <span className="text-primary font-mono text-xs">{t("widget.dev.autoSync")}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-500">{t("widget.dev.time")}</span>
          <span className="font-mono text-xs">{time.toLocaleTimeString()}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-500">{t("widget.dev.version")}</span>
          <span className="text-default-400 text-xs">v1.0.0</span>
        </div>
      </div>
    </Card>
  );
}

export const widgetDef: WidgetDefinition = {
  key: "dev.info-card",
  name: "Dev Info",
  description: "Shows widget system status and a live clock. Example widget.",
  nameKey: "widget.dev.name",
  descriptionKey: "widget.dev.description",
  icon: "Monitor",
  defaultW: 2,
  defaultH: 2,
  minW: 2,
  minH: 2,
  defaultConfig: {},
  component: DevInfoWidget,
};
