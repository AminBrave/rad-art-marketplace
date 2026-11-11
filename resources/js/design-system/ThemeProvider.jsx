import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getThemeConfig } from './theme-config.js';
import { getInitialTheme, isThemeEnabled, persistThemePreference, resolveTheme } from './theme-utils.js';

const ThemeContext = createContext(null);

function getBrowserStorage() {
    try {
        return typeof window === 'undefined' ? null : window.localStorage;
    } catch {
        return null;
    }
}

export function ThemeProvider({ children }) {
    const config = useMemo(() => getThemeConfig(), []);
    const [theme, setThemeState] = useState(() => getInitialTheme(getBrowserStorage(), config));

    const setTheme = useCallback((nextTheme) => {
        if (!config.allowRuntimeSwitching || !isThemeEnabled(nextTheme, config)) return;
        setThemeState(nextTheme);
    }, [config]);

    const resetTheme = useCallback(() => {
        setTheme(config.defaultTheme);
    }, [config.defaultTheme, setTheme]);

    useEffect(() => {
        if (typeof document !== 'undefined') {
            document.documentElement.dataset.theme = theme;
        }

        persistThemePreference(getBrowserStorage(), theme, config);
    }, [config, theme]);

    const value = useMemo(() => ({
        theme,
        setTheme,
        resetTheme,
        availableThemes: Object.values(config.themes ?? {}).filter((item) => item.enabled),
        isThemeSwitchingEnabled: Boolean(config.allowRuntimeSwitching)
            && Object.values(config.themes ?? {}).filter((item) => item.enabled).length > 1,
    }), [config, resetTheme, setTheme, theme]);

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
    const context = useContext(ThemeContext);

    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider.');
    }

    return context;
}
