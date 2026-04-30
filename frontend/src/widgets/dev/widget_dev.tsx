import { useState, useEffect } from "react";
import { Card, Chip } from "@heroui/react";
import { Monitor } from "lucide-react";
import type { WidgetDefinition, WidgetComponentProps } from "../types";

function DevInfoWidget({ isEditing }: WidgetComponentProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="h-full p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Monitor size={16} className="text-primary" />
        <span className="font-medium text-sm">Dev Info</span>
        {isEditing && (
          <Chip size="sm" variant="soft" className="ml-auto text-xs">
            Edit
          </Chip>
        )}
      </div>
      <div className="text-sm space-y-2 flex-1">
        <div className="flex justify-between items-center">
          <span className="text-default-500">Widget System</span>
          <Chip size="sm" variant="soft">Active</Chip>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-500">Registry</span>
          <span className="text-primary font-mono text-xs">auto-sync</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-500">Time</span>
          <span className="font-mono text-xs">{time.toLocaleTimeString()}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-500">Version</span>
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
  icon: "Monitor",
  defaultW: 3,
  defaultH: 4,
  minW: 2,
  minH: 3,
  defaultConfig: {},
  component: DevInfoWidget,
};
