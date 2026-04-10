import React, { createContext, useContext, useState, useEffect } from "react";

export type Theme = "midnight" | "oled" | "cyberpunk" | "github" | "japan" | "forest";

interface ThemeConfig {
  name: Theme;
  label: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    content: string;
    sidebar: string;
    text: string;
    textSecondary: string;
    border: string;
  };
}

const themes: Record<Theme, ThemeConfig> = {
  midnight: {
    name: "midnight",
    label: "Midnight",
    colors: {
      primary: "#8b5cf6",
      secondary: "#a78bfa",
      accent: "#d8b4fe",
      background: "#090514", /* Fast schwarz mit extrem leichtem Lila-Schimmer */
      content: "#110b1f",
      sidebar: "#0a0616",
      text: "#f8fafc",
      textSecondary: "#94a3b8",
  border: "#4a3578",
    },
  },
  oled: {
    name: "oled",
    label: "OLED",
    colors: {
      primary: "#581c87", /* Dunkles, kräftiges Lila */
      secondary: "#3b0764", /* Noch dunkleres Lila */
      accent: "#7e22ce",
      background: "#000000", /* Absolut reines Schwarz */
      content: "#0a0a0a", /* Sehr dunkles Grau für Cards */
      sidebar: "#050505", /* Fast unsichtbar */
      text: "#fafafa",
      textSecondary: "#a1a1aa",
  border: "#3b3b45",
    },
  },
  cyberpunk: {
    name: "cyberpunk",
    label: "Cyberpunk",
    colors: {
      primary: "#fce22a", /* Neon Yellow */
      secondary: "#ff003c", /* Neon Pink */
      accent: "#00f0ff", /* Neon Cyan */
      background: "#050512", /* Tiefes Blau-Schwarz */
      content: "#0e0d26",
      sidebar: "#090819",
      text: "#e0def4",
      textSecondary: "#908caa",
  border: "#4a4290",
    },
  },
  github: {
    name: "github",
    label: "GitHub",
    colors: {
      primary: "#58a6ff", /* GH Blue */
      secondary: "#238636", /* GH Green */
      accent: "#8b949e",
      background: "#0d1117", /* GH Dark Background */
      content: "#161b22",
      sidebar: "#010409",
      text: "#c9d1d9",
      textSecondary: "#8b949e",
  border: "#5b646f",
    },
  },
  japan: {
    name: "japan",
    label: "Japan",
    colors: {
      primary: "#f43f5e", /* Rose/Crimson */
      secondary: "#fda4af", /* Sakura Pink */
      accent: "#fb7185",
      background: "#0f0505", /* Extrem dunkles Blutrot/Schwarz */
      content: "#1a0f0f",
      sidebar: "#140909",
      text: "#fef2f2",
      textSecondary: "#fecdd3",
  border: "#6f3434",
    },
  },
  forest: {
    name: "forest",
    label: "Forest",
    colors: {
      primary: "#10b981", /* Emerald */
      secondary: "#a3e635", /* Lime */
      accent: "#4ade80",
      background: "#020604", /* Nahezu komplett schwarzes Grün */
      content: "#061209",
      sidebar: "#030b06",
      text: "#f0fdf4",
      textSecondary: "#86efac",
  border: "#255c3b",
    },
  },
};

interface ThemeContextType {
  theme: Theme;
  themeConfig: ThemeConfig;
  setTheme: (theme: Theme) => void;
  availableThemes: Theme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem("theme") as Theme;
    // Prüfen, ob das gespeicherte Theme noch existiert (sonst Fallback auf Midnight)
    if (saved && themes[saved]) {
      return saved;
    }
    return "midnight";
  });

  useEffect(() => {
    localStorage.setItem("theme", theme);
    applyTheme(theme);
  }, [theme]);

  const applyTheme = (selectedTheme: Theme) => {
    const config = themes[selectedTheme] || themes["midnight"]; // Sicherstellen, dass config nicht undefined ist
    const html = document.documentElement;

    // Setze CSS-Variablen für inline styles
    Object.entries(config.colors).forEach(([key, value]) => {
      html.style.setProperty(`--color-${key}`, value);
    });

    // Inline styles für kritische Farben
    const bodyStyle = document.body.style;
    bodyStyle.backgroundColor = config.colors.background;
    bodyStyle.color = config.colors.text;
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeConfig: themes[theme],
        setTheme,
        availableThemes: Object.keys(themes) as Theme[],
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};
