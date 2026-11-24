import React, { createContext, useContext, useMemo } from 'react';
import { DARK_PALETTE, LIGHT_PALETTE, ThemeMode, ThemePalette } from './tokens';

interface ThemeContextValue {
  mode: ThemeMode;
  palette: ThemePalette;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  mode: ThemeMode;
  onChangeMode: (mode: ThemeMode) => void;
  children: React.ReactNode;
}

export function ThemeProvider({ mode, onChangeMode, children }: ThemeProviderProps) {
  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      palette: mode === 'dark' ? DARK_PALETTE : LIGHT_PALETTE,
      toggleTheme: () => onChangeMode(mode === 'dark' ? 'light' : 'dark'),
      setThemeMode: onChangeMode,
    }),
    [mode, onChangeMode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}
