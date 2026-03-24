import { useState } from "react";
import type { Theme } from "@/context/ThemeContext";
import { useTheme } from "@/context/ThemeContext";
import { ChevronDown } from "lucide-react";

export default function Settings() {
  const { theme, setTheme, availableThemes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

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
          
          {/* Dropdown Button */}
          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-full px-4 py-3 rounded-lg transition-all flex items-center justify-between bg-primary text-white hover:opacity-90"
            >
              <span>{themeLabels[theme]}</span>
              <ChevronDown
                size={18}
                className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 rounded-lg border border-border bg-content shadow-lg z-10">
                {availableThemes.map((t: Theme) => (
                  <button
                    key={t}
                    onClick={() => {
                      setTheme(t);
                      setIsOpen(false);
                    }}
                    className={`w-full px-4 py-3 text-left transition-all hover:opacity-80 border-b border-border last:border-b-0 ${
                      theme === t
                        ? "bg-primary text-white"
                        : "bg-sidebar text-text"
                    }`}
                  >
                    {themeLabels[t]}
                  </button>
                ))}
              </div>
            )}
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
