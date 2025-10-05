import React, { createContext, useContext, useState, useEffect } from 'react';

// Theme context
const ThemeContext = createContext();

// Theme provider component
export const ThemeProvider = ({ children }) => {
  // Initialize theme from localStorage or system preference (light/dark only)
  const getInitialTheme = () => {
    if (typeof window === 'undefined') return 'dark';

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;

    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    return 'light';
  };

  const [theme, setTheme] = useState(getInitialTheme);
  const [mounted, setMounted] = useState(false);

  // Apply theme to document and save to localStorage
  useEffect(() => {
    // Set mounted to true after initial render to avoid hydration mismatch
    setMounted(true);

    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme);

    // Save to localStorage (only in browser)
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', theme);
    }
  }, [theme]);

  // Listen for system theme changes (only when user hasn't chosen a theme)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleSystemThemeChange = (e) => {
      // Only update if user hasn't manually set a preference
      const savedTheme = localStorage.getItem('theme');
      if (!savedTheme) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemThemeChange);
      return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
    }
    // Fallback for older browsers
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleSystemThemeChange);
      return () => mediaQuery.removeListener(handleSystemThemeChange);
    }
  }, []);

  // Toggle between dark and light
  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Set specific theme function
  const setSpecificTheme = (newTheme) => {
    // Accept 'light' as the bluish light mode, otherwise 'dark'
    if (newTheme === 'light') {
      setTheme('light');
      return;
    }
    setTheme('dark');
  };

  // Context value
  const value = {
    theme,
    toggleTheme,
    setSpecificTheme,
    mounted
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;