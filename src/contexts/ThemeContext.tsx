import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  actualTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme') as Theme;
    return saved || 'system';
  });

  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const root = window.document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const updateTheme = () => {
      let newActualTheme: 'light' | 'dark';

      if (theme === 'system') {
        newActualTheme = mediaQuery.matches ? 'dark' : 'light';
      } else {
        newActualTheme = theme;
      }

      setActualTheme(newActualTheme);

      root.classList.remove('light', 'dark');
      root.classList.add(newActualTheme);

      // Update CSS custom properties for toast styling
      if (newActualTheme === 'dark') {
        root.style.setProperty('--toast-bg', '#374151');
        root.style.setProperty('--toast-color', '#f9fafb');
        root.style.setProperty('--toast-border', '#4b5563');
      } else {
        root.style.setProperty('--toast-bg', '#ffffff');
        root.style.setProperty('--toast-color', '#111827');
        root.style.setProperty('--toast-border', '#e5e7eb');
      }
    };

    updateTheme();

    const handleMediaChange = () => {
      if (theme === 'system') {
        updateTheme();
      }
    };

    mediaQuery.addEventListener('change', handleMediaChange);
    return () => mediaQuery.removeEventListener('change', handleMediaChange);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const value: ThemeContextType = {
    theme,
    actualTheme,
    setTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};