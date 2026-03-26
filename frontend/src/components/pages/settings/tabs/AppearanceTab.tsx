import { useState } from 'react';
import type { Theme } from "@/context/ThemeContext";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";
import { ChevronDown } from "lucide-react";

export default function AppearanceTab() {
  const { theme, setTheme, availableThemes } = useTheme();
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const themeLabels: Record<string, string> = {
    midnight: "🌃 Midnight",
    oled: "⬛ OLED",
    cyberpunk: "🤖 Cyberpunk",
    github: "🐙 GitHub",
    japan: "🌸 Japan",
    forest: "🌲 Forest",
  };

  return (
    <div className="grid grid-cols-1 gap-6 max-w-3xl">
      <div className="p-6 rounded-lg border border-border bg-content">
        <h2 className="text-xl font-semibold mb-4 text-text">{t('settings.theme')}</h2>
        
        {/* Dropdown Button */}
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-between bg-primary text-white hover:shadow-[0_0_20px_color-mix(in_srgb,var(--color-primary)_60%,transparent)] hover:-translate-y-0.5"
          >
            <span>{themeLabels[theme]}</span>
            <ChevronDown
              size={18}
              className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
            />
          </button>

          {/* Dropdown Menu */}
          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-3 rounded-lg border border-border bg-content shadow-xl shadow-black/50 z-10 overflow-hidden transform origin-top transition-all">
              {availableThemes.map((tIter: Theme) => (
                <button
                  key={tIter}
                  onClick={() => {
                    setTheme(tIter);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-3 text-left transition-all duration-200 border-b border-border last:border-b-0 ${
                    theme === tIter
                      ? "bg-primary text-white"
                      : "bg-content text-text hover:bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)] hover:text-primary hover:pl-6"
                  }`}
                >
                  {themeLabels[tIter]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
