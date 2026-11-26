import { useEffect, useState } from 'react';
import { useLanguage } from '../../app/LanguageContext';
import { useTheme } from '../../app/useTheme';

function useResolvedDarkTheme(theme) {
    const [systemPrefersDark, setSystemPrefersDark] = useState(false);

    useEffect(() => {
        const media = window.matchMedia?.('(prefers-color-scheme: dark)');
        const sync = () => setSystemPrefersDark(Boolean(media?.matches));

        sync();
        if (theme !== 'system') return undefined;

        if (media?.addEventListener) {
            media.addEventListener('change', sync);
            return () => media.removeEventListener('change', sync);
        }

        media?.addListener?.(sync);
        return () => media?.removeListener?.(sync);
    }, [theme]);

    return theme === 'dark' || (theme === 'system' && systemPrefersDark);
}

/** Shared application identity with an asset matched to the active color scheme. */
export function BrandLogo({ className = '', compact = false }) {
    const { locale } = useLanguage();
    const { theme } = useTheme();
    const isDark = useResolvedDarkTheme(theme);
    const name = locale === 'fa' ? 'ردّمن' : 'Rademan';

    return (
        <span className={`inline-flex min-w-0 items-center gap-2.5 text-ink no-underline ${className}`.trim()}>
            <img
                src={isDark ? '/rademan-logo-dark.svg' : '/rademan-logo-light.svg'}
                alt=""
                aria-hidden="true"
                className={compact ? 'h-9 w-9 shrink-0 object-contain' : 'h-10 w-10 shrink-0 object-contain sm:h-11 sm:w-11'}
                width="44"
                height="44"
            />
            <span className="min-w-0 truncate text-lg font-black tracking-tight sm:text-xl" lang={locale} dir={locale === 'fa' ? 'rtl' : 'ltr'}>
                {name}
            </span>
        </span>
    );
}
