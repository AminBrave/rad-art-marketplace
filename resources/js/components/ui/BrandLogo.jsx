import { useEffect, useState } from 'react';
import { useLanguage } from '../../app/LanguageContext';
import { useTheme } from '../../app/useTheme';

const LOGO_FORMATS = ['svg', 'png', 'jpg'];

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

/** Shared image-only application logo with automatic format and theme fallbacks. */
export function BrandLogo({ className = '', compact = false }) {
    const { locale } = useLanguage();
    const { theme } = useTheme();
    const isDark = useResolvedDarkTheme(theme);
    const [formatIndex, setFormatIndex] = useState(0);
    const name = locale === 'fa' ? 'ردّمن' : 'Rademan';
    const themeName = isDark ? 'dark' : 'light';
    const logoSrc = `/rademan-logo-${themeName}.${LOGO_FORMATS[formatIndex]}`;

    useEffect(() => {
        setFormatIndex(0);
    }, [themeName]);

    return (
        <span className={`inline-flex min-w-0 items-center no-underline ${className}`.trim()}>
            {formatIndex < LOGO_FORMATS.length && (
                <img
                    src={logoSrc}
                    alt={name}
                    lang={locale}
                    onError={() => setFormatIndex((current) => Math.min(current + 1, LOGO_FORMATS.length))}
                    className={compact ? 'h-9 w-auto max-w-36 shrink-0 object-contain' : 'h-10 w-auto max-w-40 shrink-0 object-contain sm:h-11'}
                />
            )}
        </span>
    );
}
