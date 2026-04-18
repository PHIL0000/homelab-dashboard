import { useEffect, useState } from 'react';
import { Button, Card, Input } from '@heroui/react';
import type { Theme } from "@/context/ThemeContext";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from '@/context/AuthContext';

const DEFAULT_OLED_RGB = { r: 126, g: 34, b: 206 };

const isRgbObject = (value: unknown): value is { r: number; g: number; b: number } => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const rgb = value as Record<string, unknown>;
  return [rgb.r, rgb.g, rgb.b].every((entry) => Number.isInteger(entry) && Number(entry) >= 0 && Number(entry) <= 255);
};


const clampByte = (value: number) => Math.max(0, Math.min(255, Math.round(value)));

function rgbToHex({ r, g, b }: { r: number; g: number; b: number }): string {
  return (
    '#' +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      })
      .join('')
  );
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  let clean = hex.replace(/^#/, '');
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  if (clean.length !== 6) return null;
  const num = parseInt(clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export default function AppearanceTab() {
  const { theme, setTheme, availableThemes, themeConfig } = useTheme();
  const { t } = useLanguage();
  const { user, token, updateUser } = useAuth();
  const [rgb, setRgb] = useState(DEFAULT_OLED_RGB);
  const [hex, setHex] = useState(rgbToHex(DEFAULT_OLED_RGB));
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);


  // Sync RGB and HEX when user changes
  useEffect(() => {
    if (isRgbObject(user?.oledAccentRgb)) {
      setRgb(user.oledAccentRgb);
      setHex(rgbToHex(user.oledAccentRgb));
    } else {
      setRgb(DEFAULT_OLED_RGB);
      setHex(rgbToHex(DEFAULT_OLED_RGB));
    }
  }, [user?.oledAccentRgb]);

  // Sync HEX when RGB changes (from UI)
  useEffect(() => {
    setHex(rgbToHex(rgb));
  }, [rgb]);

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


  const setRgbChannel = (channel: 'r' | 'g' | 'b', value: string) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
      setRgb((prev) => ({ ...prev, [channel]: 0 }));
      return;
    }
    setRgb((prev) => ({ ...prev, [channel]: clampByte(parsed) }));
  };

  const setHexColor = (value: string) => {
    setHex(value);
    const rgbVal = hexToRgb(value);
    if (rgbVal) setRgb(rgbVal);
  };

  const saveOledAccent = async () => {
    if (!user || !token) return;

    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch(`http://localhost:3001/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ oledAccentRgb: rgb })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || t('settings.saveError'));
      }

      updateUser(data);
      setMessage({ type: 'success', text: t('settings.saveSuccess') });
      setTimeout(() => setMessage(null), 2500);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || t('settings.saveError') });
    } finally {
      setIsSaving(false);
    }
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
                className={`border transition-all ${isActive ? 'border-primary ring-1 ring-[color-mix(in_srgb,var(--color-primary)_42%,transparent)]' : 'border-slate-700/50'} p-3`}
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
                    {isActive && <span className="text-xs text-text">Aktiv</span>}
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

        {theme === 'oled' && (
          <div className="mt-6 rounded-lg border border-slate-700/50 bg-slate-800/40 p-4">
            <h3 className="text-sm uppercase tracking-wide text-slate-300 mb-3">{t('settings.oledAccent')}</h3>

            {message && (
              <div className={`p-3 rounded-lg mb-4 ${message.type === 'success' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                {message.text}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">R</label>
                <Input type="number" min={0} max={255} value={String(rgb.r)} onChange={(e) => setRgbChannel('r', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">G</label>
                <Input type="number" min={0} max={255} value={String(rgb.g)} onChange={(e) => setRgbChannel('g', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">B</label>
                <Input type="number" min={0} max={255} value={String(rgb.b)} onChange={(e) => setRgbChannel('b', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">HEX</label>
                <Input type="text" value={hex} maxLength={7} onChange={(e) => setHexColor(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Color</label>
                <input
                  type="color"
                  value={hex}
                  onChange={(e) => setHexColor(e.target.value)}
                  className="w-full h-10 p-0 border-0 bg-transparent cursor-pointer"
                  style={{ minWidth: 40 }}
                />
              </div>
              <div className="sm:col-span-5 flex flex-col gap-2 mt-2">
                <Button isDisabled={isSaving} onClick={saveOledAccent} className="w-full px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:shadow-[0_0_15px_color-mix(in_srgb,var(--color-glow)_50%,transparent)] transition-all disabled:opacity-50">
                  {isSaving ? `${t('settings.save')}...` : t('settings.save')}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-slate-300 border border-slate-600"
                  onClick={() => {
                    setRgb(DEFAULT_OLED_RGB);
                    setHex(rgbToHex(DEFAULT_OLED_RGB));
                  }}
                >
                  {t('settings.resetAccent') || 'Reset accent color'}
                </Button>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-3">
              <div className="h-6 w-6 rounded-full border border-slate-500" style={{ backgroundColor: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` }} />
              <p className="text-xs text-slate-400">rgb({rgb.r}, {rgb.g}, {rgb.b}) / {hex.toUpperCase()}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
