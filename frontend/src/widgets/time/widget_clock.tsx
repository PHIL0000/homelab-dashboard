import { useState, useEffect } from "react";
import { Card } from "@heroui/react";
import type { WidgetDefinition, WidgetComponentProps } from "../types";
import { useAuth } from "@/context/AuthContext";

const FONT_MAP: Record<string, string> = {
  orbitron: "'Orbitron', monospace",
  mono: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace",
  serif: "Georgia, 'Times New Roman', serif",
  sans: "ui-sans-serif, system-ui, sans-serif",
};

const FONT_URLS: Record<string, string> = {
  orbitron:
    "https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap",
};

function loadFont(fontKey: string) {
  const url = FONT_URLS[fontKey];
  if (!url) return;
  const id = `font-link-${fontKey}`;
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = url;
  document.head.appendChild(link);
}

function ClockWidget({ config }: WidgetComponentProps) {
  const { user } = useAuth();
  const [now, setNow] = useState(new Date());

  const fontKey = (config.fontFamily as string) || "orbitron";
  const showSeconds = config.showSeconds !== false;
  const showDate = config.showDate !== false;

  useEffect(() => {
    loadFont(fontKey);
  }, [fontKey]);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const use24h = user?.timeFormat !== "12h";
  const fontFamily = FONT_MAP[fontKey] || FONT_MAP.orbitron;

  const timeStr = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    ...(showSeconds ? { second: "2-digit" } : {}),
    hour12: !use24h,
  });

  const formatDate = () => {
    const fmt = user?.dateFormat || "DD.MM.YYYY";
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = String(now.getFullYear());
    switch (fmt) {
      case "MM-DD-YYYY":
        return `${month}-${day}-${year}`;
      case "YYYY-MM-DD":
        return `${year}-${month}-${day}`;
      case "DD.MM.YYYY":
        return `${day}.${month}.${year}`;
      default:
        return `${day}-${month}-${year}`;
    }
  };

  const weekday = now.toLocaleDateString([], { weekday: "long" });

  return (
    <Card className="h-full p-4 flex flex-col items-center justify-center gap-2 relative overflow-hidden">
      {/* Radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, var(--color-primary) 0%, transparent 70%)",
          opacity: 0.06,
        }}
      />

      {/* Time */}
      <div
        className="text-5xl font-bold tracking-widest tabular-nums leading-none"
        style={{ fontFamily, color: "var(--color-primary)" }}
      >
        {timeStr}
      </div>

      {/* Date */}
      {showDate && (
        <div className="flex flex-col items-center gap-0.5">
          <span
            className="text-sm tracking-wider"
            style={{ fontFamily, color: "var(--color-text)", opacity: 0.8 }}
          >
            {weekday}
          </span>
          <span
            className="text-xs tracking-widest"
            style={{
              fontFamily,
              color: "var(--color-textSecondary)",
              opacity: 0.7,
            }}
          >
            {formatDate()}
          </span>
        </div>
      )}
    </Card>
  );
}

export const widgetDef: WidgetDefinition = {
  key: "time.clock",
  name: "Clock & Date",
  description: "Shows the current time and date.",
  nameKey: "widget.clock.name",
  descriptionKey: "widget.clock.description",
  icon: "Clock",
  defaultW: 3,
  defaultH: 3,
  minW: 2,
  minH: 2,
  defaultConfig: {
    fontFamily: "orbitron",
    showSeconds: true,
    showDate: true,
  },
  component: ClockWidget,
};
