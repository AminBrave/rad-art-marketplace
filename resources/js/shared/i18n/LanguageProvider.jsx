import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { english, fa } from './dictionaries';

const STORAGE_KEY = 'rademan-locale';
const LOCALES = ['fa', 'en'];
const LanguageContext = createContext(null);

function readLocale() {
    if (typeof window === 'undefined') return 'fa';
    try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        return LOCALES.includes(stored) ? stored : 'fa';
    } catch {
        return 'fa';
    }
}

export function LanguageProvider({ children }) {
    const [locale, setLocaleState] = useState(readLocale);
    const setLocale = useCallback((nextLocale) => {
        if (LOCALES.includes(nextLocale)) setLocaleState(nextLocale);
    }, []);
    const t = useCallback((value) => locale === 'en' ? (english[value] ?? value) : (fa[value] ?? value), [locale]);

    useEffect(() => {
        const root = document.documentElement;
        root.lang = locale;
        root.dir = locale === 'fa' ? 'rtl' : 'ltr';
        try {
            window.localStorage.setItem(STORAGE_KEY, locale);
        } catch {
            // The selected locale remains active for this session.
        }
    }, [locale]);

    useEffect(() => {
        const syncLocale = (event) => {
            if (event.key === STORAGE_KEY && LOCALES.includes(event.newValue)) setLocaleState(event.newValue);
        };
        window.addEventListener('storage', syncLocale);
        return () => window.removeEventListener('storage', syncLocale);
    }, []);

    const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);
    return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

// Keep the provider and hook together as the public localization API.
// eslint-disable-next-line react-refresh/only-export-components
export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) throw new Error('useLanguage must be used inside LanguageProvider');
    return context;
}
