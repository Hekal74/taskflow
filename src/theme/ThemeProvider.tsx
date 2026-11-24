/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type Theme = 'light' | 'dark';
export type AccentColor = 'indigo' | 'blue' | 'teal' | 'rose' | 'amber';

export const ACCENT_COLORS: ReadonlyArray<{
  id: AccentColor;
  label: string;
  swatch: string;
}> = [
  { id: 'indigo', label: 'Indigo', swatch: '#3659c9' },
  { id: 'blue', label: 'Blue', swatch: '#1769aa' },
  { id: 'teal', label: 'Teal', swatch: '#08766f' },
  { id: 'rose', label: 'Rose', swatch: '#b52e53' },
  { id: 'amber', label: 'Amber', swatch: '#a84c00' },
];

const THEME_STORAGE_KEY = 'taskflow_theme';
const ACCENT_STORAGE_KEY = 'taskflow_accent';

interface ThemeContextValue {
  theme: Theme;
  accentColor: AccentColor;
  toggleTheme: () => void;
  setAccentColor: (accentColor: AccentColor) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const getStorage = (): Storage | null => {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
};

const readStoredTheme = (): Theme | null => {
  try {
    const storedTheme = getStorage()?.getItem(THEME_STORAGE_KEY);
    return storedTheme === 'light' || storedTheme === 'dark'
      ? storedTheme
      : null;
  } catch {
    return null;
  }
};

const getSystemTheme = (): Theme =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';

const readStoredAccent = (): AccentColor => {
  try {
    const storedAccent = getStorage()?.getItem(ACCENT_STORAGE_KEY);
    return ACCENT_COLORS.some((color) => color.id === storedAccent)
      ? (storedAccent as AccentColor)
      : 'indigo';
  } catch {
    return 'indigo';
  }
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(
    () => readStoredTheme() ?? getSystemTheme(),
  );
  const [hasExplicitTheme, setHasExplicitTheme] = useState(
    () => readStoredTheme() !== null,
  );
  const [accentColor, setAccentColorState] =
    useState<AccentColor>(readStoredAccent);

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.dataset.accent = accentColor;
  }, [theme, accentColor]);

  useEffect(() => {
    if (hasExplicitTheme || typeof window.matchMedia !== 'function') return;

    const preference = window.matchMedia('(prefers-color-scheme: dark)');
    const updateSystemTheme = (event: MediaQueryListEvent) => {
      if (readStoredTheme() === null) {
        setTheme(event.matches ? 'dark' : 'light');
      }
    };

    preference.addEventListener('change', updateSystemTheme);
    return () => preference.removeEventListener('change', updateSystemTheme);
  }, [hasExplicitTheme]);

  const toggleTheme = useCallback(() => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    setHasExplicitTheme(true);
    try {
      getStorage()?.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {
      // The current selection still applies for this session.
    }
  }, [theme]);

  const setAccentColor = useCallback((nextAccent: AccentColor) => {
    setAccentColorState(nextAccent);
    try {
      getStorage()?.setItem(ACCENT_STORAGE_KEY, nextAccent);
    } catch {
      // The current selection still applies for this session.
    }
  }, []);

  const contextValue = useMemo(
    () => ({ theme, accentColor, toggleTheme, setAccentColor }),
    [theme, accentColor, toggleTheme, setAccentColor],
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }

  return context;
}
