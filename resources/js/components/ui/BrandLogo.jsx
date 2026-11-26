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
export function BrandLogo({ className = '', size = 'default' }) {
    const { locale } = useLanguage();
    const { theme } = useTheme();
    const isDark = useResolvedDarkTheme(theme);
    const [formatIndex, setFormatIndex] = useState(0);
    const name = locale === 'fa' ? 'ردّمن' : 'Rademan';
    const themeName = isDark ? 'dark' : 'light';
    const logoSrc = `/rademan-logo-${themeName}.${LOGO_FORMATS[formatIndex]}`;
    const imageSize = {
        default: 'h-14 w-auto max-w-52 sm:h-16',
        footer: 'h-28 w-auto max-w-80 sm:h-32',
        sidebar: 'h-24 w-auto max-w-72 sm:h-28',
    }[size] ?? 'h-14 w-auto max-w-52 sm:h-16';

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
                    className={`${imageSize} shrink-0 object-contain`}
                />
            )}
        </span>
    );
}
