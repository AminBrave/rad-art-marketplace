import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext(null);
const STORAGE_KEY = 'rademan-theme';
const THEMES = ['system', 'light', 'dark'];

function readInitialTheme() {
    if (typeof window === 'undefined') return 'system';

    try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        return THEMES.includes(stored) ? stored : 'system';
    } catch {
        return 'system';
    }
}

function applyTheme(theme, prefersDark) {
    if (typeof document === 'undefined') return;

    const resolvedTheme = theme === 'system'
        ? (prefersDark ? 'dark' : 'light')
        : theme;

    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = resolvedTheme;
}

export function ThemeProvider({ children }) {
    const [theme, setThemeState] = useState(readInitialTheme);

    const setTheme = useCallback((nextTheme) => {
        if (THEMES.includes(nextTheme)) setThemeState(nextTheme);
    }, []);

    const cycleTheme = useCallback(() => {
        setThemeState((current) => THEMES[(THEMES.indexOf(current) + 1) % THEMES.length]);
    }, []);

    useEffect(() => {
        const media = window.matchMedia('(prefers-color-scheme: dark)');
        const syncTheme = () => applyTheme(theme, media.matches);

        syncTheme();
        try {
            window.localStorage.setItem(STORAGE_KEY, theme);
        } catch {
            // Theme remains available for this session when storage is restricted.
        }

        if (theme !== 'system') return undefined;

        media.addEventListener?.('change', syncTheme);
        return () => media.removeEventListener?.('change', syncTheme);
    }, [theme]);

    useEffect(() => {
        const syncStoredTheme = (event) => {
            if (event.key === STORAGE_KEY && THEMES.includes(event.newValue)) {
                setThemeState(event.newValue);
            }
        };

        window.addEventListener('storage', syncStoredTheme);
        return () => window.removeEventListener('storage', syncStoredTheme);
    }, []);

    const value = useMemo(() => ({ theme, setTheme, cycleTheme }), [theme, setTheme, cycleTheme]);

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within ThemeProvider');
    return context;
}
