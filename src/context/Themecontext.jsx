import { createContext, useContext, useState, useEffect } from "react";

const THEMES = {
  violet: {
    primary:       "#7c3aed",
    primaryDim:    "rgba(124,58,237,0.12)",
    primaryBorder: "rgba(124,58,237,0.3)",
    primaryGlow:   "rgba(124,58,237,0.35)",
  },
  rose: {
    primary:       "#e11d48",
    primaryDim:    "rgba(225,29,72,0.12)",
    primaryBorder: "rgba(225,29,72,0.3)",
    primaryGlow:   "rgba(225,29,72,0.35)",
  },
  sky: {
    primary:       "#0284c7",
    primaryDim:    "rgba(2,132,199,0.12)",
    primaryBorder: "rgba(2,132,199,0.3)",
    primaryGlow:   "rgba(2,132,199,0.35)",
  },
  teal: {
    primary:       "#0d9488",
    primaryDim:    "rgba(13,148,136,0.12)",
    primaryBorder: "rgba(13,148,136,0.3)",
    primaryGlow:   "rgba(13,148,136,0.35)",
  },
  amber: {
    primary:       "#d97706",
    primaryDim:    "rgba(217,119,6,0.12)",
    primaryBorder: "rgba(217,119,6,0.3)",
    primaryGlow:   "rgba(217,119,6,0.35)",
  },
  lime: {
    primary:       "#84cc16",
    primaryDim:    "rgba(132,204,22,0.12)",
    primaryBorder: "rgba(132,204,22,0.3)",
    primaryGlow:   "rgba(132,204,22,0.35)",
  },
};

const ThemeContext = createContext(null);

function applyTheme(t) {
  const root = document.documentElement;
  root.style.setProperty("--primary",        t.primary);
  root.style.setProperty("--primary-dim",    t.primaryDim);
  root.style.setProperty("--primary-border", t.primaryBorder);
  root.style.setProperty("--primary-glow",   t.primaryGlow);
}

export function ThemeProvider({ children }) {
  const [themeKey, setThemeKeyState] = useState(
    () => localStorage.getItem("themeKey") || "violet"
  );
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("darkMode") === "true"
  );

  const theme = THEMES[themeKey] || THEMES.violet;

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem("themeKey", themeKey);
  }, [themeKey, theme]);

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  const setThemeKey = (key) => {
    if (THEMES[key]) setThemeKeyState(key);
  };

  const toggleDark = () => setDarkMode(v => !v);

  return (
    <ThemeContext.Provider value={{ theme, themeKey, setThemeKey, THEMES, darkMode, toggleDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}