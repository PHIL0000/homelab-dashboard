import React, { createContext, useContext, useState, useEffect } from "react";

export type Theme =
  | "midnight"
  | "oled"
  | "cyberpunk"
  | "github"
  | "japan"
  | "forest"
  | "aurora"
  | "sunset"
  | "ocean"
  | "nebula";

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
    gradientStart: string;
    gradientMid: string;
    gradientEnd: string;
    glow: string;
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
      gradientStart: "#312e81",
      gradientMid: "#581c87",
      gradientEnd: "#0f172a",
      glow: "#8b5cf6",
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
      gradientStart: "#09090b",
      gradientMid: "#18181b",
      gradientEnd: "#000000",
      glow: "#7e22ce",
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
      gradientStart: "#1a1040",
      gradientMid: "#3b0764",
      gradientEnd: "#0b1021",
      glow: "#00f0ff",
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
      gradientStart: "#0d1117",
      gradientMid: "#161b22",
      gradientEnd: "#0b1d35",
      glow: "#58a6ff",
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
      gradientStart: "#3f0c19",
      gradientMid: "#7f1d1d",
      gradientEnd: "#1a0f0f",
      glow: "#fb7185",
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
      gradientStart: "#052e16",
      gradientMid: "#14532d",
      gradientEnd: "#022c22",
      glow: "#4ade80",
    },
  },
  aurora: {
    name: "aurora",
    label: "Aurora",
    colors: {
      primary: "#22d3ee",
      secondary: "#a78bfa",
      accent: "#34d399",
      background: "#020617",
      content: "#0b1225",
      sidebar: "#060d1a",
      text: "#e2e8f0",
      textSecondary: "#94a3b8",
      border: "#2b3f67",
      gradientStart: "#0f172a",
      gradientMid: "#164e63",
      gradientEnd: "#1e1b4b",
      glow: "#22d3ee",
    },
  },
  sunset: {
    name: "sunset",
    label: "Sunset",
    colors: {
      primary: "#fb7185",
      secondary: "#f59e0b",
      accent: "#f97316",
      background: "#140a12",
      content: "#1f1020",
      sidebar: "#160c16",
      text: "#ffe4e6",
      textSecondary: "#fdba74",
      border: "#7c2d12",
      gradientStart: "#3f1d2e",
      gradientMid: "#7c2d12",
      gradientEnd: "#431407",
      glow: "#fb7185",
    },
  },
  ocean: {
    name: "ocean",
    label: "Ocean",
    colors: {
      primary: "#38bdf8",
      secondary: "#14b8a6",
      accent: "#7dd3fc",
      background: "#041420",
      content: "#0a2233",
      sidebar: "#071a2a",
      text: "#e0f2fe",
      textSecondary: "#7dd3fc",
      border: "#155e75",
      gradientStart: "#082f49",
      gradientMid: "#0e7490",
      gradientEnd: "#0f172a",
      glow: "#38bdf8",
    },
  },
  nebula: {
    name: "nebula",
    label: "Nebula",
    colors: {
      primary: "#c084fc",
      secondary: "#60a5fa",
      accent: "#f472b6",
      background: "#0b0820",
      content: "#181133",
      sidebar: "#120d2a",
      text: "#f1f5f9",
      textSecondary: "#c4b5fd",
      border: "#4c1d95",
      gradientStart: "#312e81",
      gradientMid: "#4c1d95",
      gradientEnd: "#1e1b4b",
      glow: "#c084fc",
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
    const config = themes[selectedTheme] || themes["midnight"];
    const html = document.documentElement;
    const body = document.body;

    html.setAttribute("data-theme", selectedTheme);
    body.setAttribute("data-theme", selectedTheme);

    Object.entries(config.colors).forEach(([key, value]) => {
      html.style.setProperty(`--color-${key}`, value);
    });

    const bodyStyle = body.style;
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
