import { Select, ListBox } from '@heroui/react';
import type { Theme } from "@/context/ThemeContext";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";
import { ChevronDown } from 'lucide-react';

export default function AppearanceTab() {
  const { theme, setTheme, availableThemes } = useTheme();
  const { t } = useLanguage();

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
      <div className="p-6 rounded-lg border border-slate-700/50 bg-slate-900/50">
        <h2 className="text-xl font-semibold mb-4 text-slate-100">{t('settings.theme')}</h2>
        
        <Select
          className="w-full"
          selectedKey={theme}
          onChange={(key) => {
            if (key) {
              setTheme(key as Theme);
            }
          }}
        >
          <Select.Trigger className="w-full px-3 flex items-center justify-between">
            <Select.Value />
            <ChevronDown size={16} className="text-slate-400" />
          </Select.Trigger>
          <Select.Popover className="w-[var(--trigger-width)]">
            <ListBox>
              {availableThemes.map((tIter: Theme) => (
                <ListBox.Item key={tIter} id={tIter} className="pl-2">
                  {themeLabels[tIter]}
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>
      </div>
    </div>
  );
}
