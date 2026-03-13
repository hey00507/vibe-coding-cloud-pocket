import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme, ThemeMode } from '../types/theme';
import { lightTheme, darkTheme } from '../constants/theme';
import { STORAGE_KEYS } from '../constants/storageKeys';

export interface ThemeContextValue {
  theme: Theme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isDark: boolean;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  children: React.ReactNode;
  initialMode?: ThemeMode; // 테스트용
}

export function ThemeProvider({ children, initialMode }: ThemeProviderProps) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(initialMode ?? 'system');
  const [isLoaded, setIsLoaded] = useState(!!initialMode);
  const systemScheme = useColorScheme();

  useEffect(() => {
    if (initialMode) return;
    AsyncStorage.getItem(STORAGE_KEYS.THEME_MODE)
      .then((saved) => {
        if (saved === 'light' || saved === 'dark' || saved === 'system') {
          setThemeModeState(saved);
        }
      })
      .finally(() => setIsLoaded(true));
  }, [initialMode]);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    AsyncStorage.setItem(STORAGE_KEYS.THEME_MODE, mode);
  }, []);

  const resolvedMode = themeMode === 'system'
    ? (systemScheme ?? 'light')
    : themeMode;

  const theme = useMemo(
    () => (resolvedMode === 'dark' ? darkTheme : lightTheme),
    [resolvedMode],
  );

  const isDark = resolvedMode === 'dark';

  const value = useMemo(
    () => ({ theme, themeMode, setThemeMode, isDark }),
    [theme, themeMode, setThemeMode, isDark],
  );

  if (!isLoaded) return null;

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
