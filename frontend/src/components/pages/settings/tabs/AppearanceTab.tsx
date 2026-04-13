import { Button, Card } from '@heroui/react';
import type { Theme } from "@/context/ThemeContext";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";

export default function AppearanceTab() {
  const { theme, setTheme, availableThemes, themeConfig } = useTheme();
  const { t } = useLanguage();

  const themePreviewGradients: Record<Theme, string> = {
    midnight: "linear-gradient(120deg, #312e81, #581c87, #0f172a)",
    oled: "linear-gradient(120deg, #09090b, #18181b, #000000)",
    cyberpunk: "linear-gradient(120deg, #1a1040, #3b0764, #0b1021)",
    github: "linear-gradient(120deg, #0d1117, #161b22, #0b1d35)",
    japan: "linear-gradient(120deg, #3f0c19, #7f1d1d, #1a0f0f)",
    forest: "linear-gradient(120deg, #052e16, #14532d, #022c22)",
    aurora: "linear-gradient(120deg, #0f172a, #164e63, #1e1b4b)",
    sunset: "linear-gradient(120deg, #3f1d2e, #7c2d12, #431407)",
    ocean: "linear-gradient(120deg, #082f49, #0e7490, #0f172a)",
    nebula: "linear-gradient(120deg, #312e81, #4c1d95, #1e1b4b)",
  };

  const themeLabels: Record<string, string> = {
    midnight: "🌃 Midnight",
    oled: "⬛ OLED",
    cyberpunk: "🤖 Cyberpunk",
    github: "🐙 GitHub",
    japan: "🌸 Japan",
    forest: "🌲 Forest",
    aurora: "🌌 Aurora",
    sunset: "🌇 Sunset",
    ocean: "🌊 Ocean",
    nebula: "✨ Nebula",
  };

  return (
    <div className="grid grid-cols-1 gap-6 max-w-5xl">
      <div className="rounded-lg border border-slate-700/50 bg-slate-900/50 p-6">
        <h2 className="mb-2 text-xl font-semibold text-slate-100">{t('settings.theme')}</h2>
        <p className="mb-5 text-sm text-slate-400">
          Wähle ein Theme mit globalem Farbverlauf. Es wird direkt auf alle Seiten angewendet.
        </p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {availableThemes.map((tIter: Theme) => {
            const isActive = theme === tIter;
            return (
              <Card
                key={tIter}
                className={`border transition-all ${isActive ? 'border-purple-500 ring-1 ring-purple-500/40' : 'border-slate-700/50'} p-3`}
              >
                <button
                  type="button"
                  onClick={() => setTheme(tIter)}
                  className="w-full text-left"
                  aria-pressed={isActive}
                >
                  <div
                    className="h-20 w-full rounded-lg border border-slate-700/40"
                    style={{
                      background: themePreviewGradients[tIter],
                    }}
                  />
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-200">{themeLabels[tIter] ?? tIter}</span>
                    {isActive && <span className="text-xs text-purple-300">Aktiv</span>}
                  </div>
                </button>
              </Card>
            );
          })}
        </div>

        <div className="mt-5 rounded-lg border border-slate-700/50 bg-slate-800/40 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Aktuelles Theme</p>
          <p className="mt-1 text-sm text-slate-200">{themeLabels[theme] ?? themeConfig.label}</p>
          <div className="mt-3 flex gap-2">
            <span className="h-6 w-6 rounded-full border border-slate-600" style={{ backgroundColor: 'var(--color-primary)' }} />
            <span className="h-6 w-6 rounded-full border border-slate-600" style={{ backgroundColor: 'var(--color-secondary)' }} />
            <span className="h-6 w-6 rounded-full border border-slate-600" style={{ backgroundColor: 'var(--color-accent)' }} />
          </div>
        </div>

        <div className="mt-4">
          <Button variant="ghost" className="text-slate-300" onClick={() => setTheme('midnight')}>
            Auf Midnight zurücksetzen
          </Button>
        </div>
      </div>
    </div>
  );
}
