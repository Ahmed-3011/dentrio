'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');

  const applyTheme = (t: Theme) => {
    const root = document.documentElement;
    if (t === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem('dentrio_theme') as Theme | null;
      const initialTheme = saved === 'light' || saved === 'dark' ? saved : 'dark';
      // One-time localStorage hydration after first paint (runs only on mount).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTheme(initialTheme);
      applyTheme(initialTheme);
    } catch {
      // LocalStorage unavailable (e.g. private browsing or sandbox)
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    try {
      localStorage.setItem('dentrio_theme', nextTheme);
    } catch {
      // Ignore write errors
    }
    applyTheme(nextTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
