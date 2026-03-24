import React from "react";
import type { Theme } from "@/context/ThemeContext";
import { useTheme } from "@/context/ThemeContext";

export default function Settings() {
  const { theme, setTheme, availableThemes } = useTheme();

  const themeLabels: Record<string, string> = {
    dark: "🌙 Dark",
    light: "☀️ Light",
    ocean: "🌊 Ocean",
    forest: "🌲 Forest",
    sunset: "🌅 Sunset",
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-text">Settings</h1>
        <p className="text-text-secondary">Konfiguriere deine Einstellungen</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-lg border border-border bg-content">
          <h2 className="text-xl font-semibold mb-4 text-text">Theme</h2>
          <div className="space-y-3">
            {availableThemes.map((t: Theme) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`w-full px-4 py-3 rounded-lg transition-all hover:opacity-80 ${
                  theme === t
                    ? "bg-primary text-white shadow-lg"
                    : "bg-sidebar text-text"
                }`}
              >
                {themeLabels[t]}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-lg border border-border bg-content">
          <h2 className="text-xl font-semibold mb-2 text-text">Benachrichtigungen</h2>
          <p className="text-text-secondary">Settings Inhalte kommen hier hin</p>
        </div>
      </div>
    </div>
  );
}
