import React, { createContext, useState, useContext } from 'react';

interface ThemeToggleContextProps {
  toggleTheme: () => void;
  mode: 'light' | 'dark';
}

export const ThemeToggleContext = createContext<ThemeToggleContextProps>({
  toggleTheme: () => {},
  mode: 'light',
});

interface ThemeToggleProviderProps {
  children: React.ReactNode;
}

export const ThemeToggleProvider: React.FC<ThemeToggleProviderProps> = ({ children }) => {
  const [mode, setMode] = useState<'light' | 'dark'>('light');

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeToggleContext.Provider value={{ toggleTheme, mode }}>
      {children}
    </ThemeToggleContext.Provider>
  );
};

export const useThemeToggle = () => useContext(ThemeToggleContext);