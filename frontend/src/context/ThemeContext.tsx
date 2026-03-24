import React, { createContext, useContext, useState, useEffect } from "react";

export type Theme = "dark" | "light" | "ocean" | "forest" | "sunset";

interface ThemeConfig {
  name: Theme;
  isDark: boolean;
  colors: {
    primary: string;
    background: string;
    content: string;
    sidebar: string;
    text: string;
    textSecondary: string;
    border: string;
  };
}

const themes: Record<Theme, ThemeConfig> = {
  dark: {
    name: "dark",
    isDark: true,
    colors: {
      primary: "#3b82f6",
      background: "#0f172a",
      content: "#1e293b",
      sidebar: "#1e293b",
      text: "#e2e8f0",
      textSecondary: "#94a3b8",
      border: "#334155",
    },
  },
  light: {
    name: "light",
    isDark: false,
    colors: {
      primary: "#2563eb",
      background: "#f8fafc",
      content: "#ffffff",
      sidebar: "#f1f5f9",
      text: "#1e293b",
      textSecondary: "#64748b",
      border: "#cbd5e1",
    },
  },
  ocean: {
    name: "ocean",
    isDark: true,
    colors: {
      primary: "#06b6d4",
      background: "#0c2340",
      content: "#164863",
      sidebar: "#0f3a5c",
      text: "#d1f0ff",
      textSecondary: "#a3d5ff",
      border: "#1e5f8f",
    },
  },
  forest: {
    name: "forest",
    isDark: true,
    colors: {
      primary: "#10b981",
      background: "#0d1b0f",
      content: "#1a3a1f",
      sidebar: "#142818",
      text: "#d1fae5",
      textSecondary: "#a7f3d0",
      border: "#1f5d3a",
    },
  },
  sunset: {
    name: "sunset",
    isDark: true,
    colors: {
      primary: "#f97316",
      background: "#1f1116",
      content: "#341e1e",
      sidebar: "#2a1618",
      text: "#ffe4cc",
      textSecondary: "#ffccaa",
      border: "#6b3b2f",
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
    const saved = localStorage.getItem("theme");
    return (saved as Theme) || "dark";
  });

  useEffect(() => {
    localStorage.setItem("theme", theme);
    applyTheme(theme);
  }, [theme]);

  const applyTheme = (selectedTheme: Theme) => {
    const config = themes[selectedTheme];
    const html = document.documentElement;

    // Entferne alte Theme-Klasse
    html.classList.remove("light");
    
    // Füge neue Theme-Klasse hinzu (für "light" Theme)
    if (!config.isDark) {
      html.classList.add("light");
    }

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
