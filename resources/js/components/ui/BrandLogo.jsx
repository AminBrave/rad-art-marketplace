import { useEffect, useState } from 'react';
import { useLanguage } from '../../app/LanguageContext';
import { useTheme } from '../../app/useTheme';

const LOGO_FORMATS = ['svg', 'png', 'jpg'];
const LOGO_CACHE_NAME = 'rademan-brand-assets-v1';

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

/** Load logos through the browser cache, with a persistent Cache Storage fallback for offline visits. */
export function BrandLogo({ className = '', size = 'default' }) {
    const { locale } = useLanguage();
    const { theme } = useTheme();
    const isDark = useResolvedDarkTheme(theme);
    const themeName = isDark ? 'dark' : 'light';
    const name = locale === 'fa' ? 'ردّمن' : 'Rademan';
    const [logoUrl, setLogoUrl] = useState(null);
    const imageSize = {
        default: 'h-14 w-auto max-w-52 sm:h-16',
        footer: 'h-28 w-auto max-w-80 sm:h-32',
        sidebar: 'h-24 w-auto max-w-72 sm:h-28',
    }[size] ?? 'h-14 w-auto max-w-52 sm:h-16';

    useEffect(() => {
        let active = true;
        let objectUrl = null;

        setLogoUrl(null);

        const loadLogo = async () => {
            let cache = null;

            try {
                if ('caches' in window) {
                    cache = await window.caches.open(LOGO_CACHE_NAME);
                }
            } catch {
                // Cache Storage may be unavailable; the browser's HTTP cache still applies.
            }

            for (const format of LOGO_FORMATS) {
                const url = `/rademan-logo-${themeName}.${format}`;
                let response = null;

                try {
                    response = await fetch(url, { cache: 'no-cache' });
                    if (!response.ok) {
                        continue;
                    }

                    if (cache) {
                        try {
                            await cache.put(url, response.clone());
                        } catch {
                            // Continue with the successfully retrieved logo if storage is full or blocked.
                        }
                    }
                } catch {
                    // If offline, fall back to a previously saved copy on this device.
                    if (cache) {
                        try {
                            response = await cache.match(url);
                        } catch {
                            response = null;
                        }
                    }
                }

                if (!response?.ok) {
                    continue;
                }

                try {
                    const blob = await response.blob();
                    if (!blob.size) continue;

                    objectUrl = URL.createObjectURL(blob);
                    if (active) {
                        setLogoUrl(objectUrl);
                    } else {
                        URL.revokeObjectURL(objectUrl);
                    }
                    return;
                } catch {
                    // Try the next supported image format.
                }
            }
        };

        loadLogo();

        return () => {
            active = false;
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [themeName]);

    return (
        <span className={`inline-flex min-w-0 items-center no-underline ${className}`.trim()}>
            {logoUrl && (
                <img
                    src={logoUrl}
                    alt={name}
                    lang={locale}
                    className={`${imageSize} shrink-0 object-contain`}
                />
            )}
        </span>
    );
}
