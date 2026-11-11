import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext(null);
const STORAGE_KEY = 'rad-theme';

function readInitialTheme() {
    if (typeof window === 'undefined') return 'light';
    try {
        return window.localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light';
    } catch {
        return 'light';
    }
}

export function ThemeProvider({ children, defaultTheme = 'light' }) {
    const [theme, setTheme] = useState(() => readInitialTheme() || defaultTheme);

    useEffect(() => {
        const root = document.documentElement;
        root.classList.toggle('dark', theme === 'dark');
        root.style.colorScheme = theme;
        try {
            window.localStorage.setItem(STORAGE_KEY, theme);
        } catch {
            // The selected theme remains active for this session if storage is unavailable.
        }
    }, [theme]);

    const value = useMemo(() => ({
        theme,
        setTheme,
        toggleTheme: () => setTheme((current) => current === 'dark' ? 'light' : 'dark'),
    }), [theme]);

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within ThemeProvider');
    return context;
}
