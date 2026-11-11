import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from './useTheme.js';

function readColorScheme() {
    try {
        return window.localStorage.getItem('rad-art-color-scheme') || 'system';
    } catch {
        return 'system';
    }
}

function applyColorScheme(value) {
    const dark = value === 'dark'
        || (value === 'system' && window.matchMedia?.('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', Boolean(dark));
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
}

function ColorSchemeControl() {
    const [scheme, setScheme] = useState(readColorScheme);

    useEffect(() => {
        applyColorScheme(scheme);
        try {
            window.localStorage.setItem('rad-art-color-scheme', scheme);
        } catch {
            // The selected scheme remains active for this page session.
        }
    }, [scheme]);

    useEffect(() => {
        if (scheme !== 'system') return undefined;
        const media = window.matchMedia('(prefers-color-scheme: dark)');
        const update = () => applyColorScheme('system');
        media.addEventListener?.('change', update);
        return () => media.removeEventListener?.('change', update);
    }, [scheme]);

    const next = scheme === 'dark' ? 'light' : 'dark';
    return (
        <button
            type="button"
            aria-label={scheme === 'dark' ? 'تغییر به حالت روشن' : 'تغییر به حالت تیره'}
            title={scheme === 'dark' ? 'حالت روشن' : 'حالت تیره'}
            onClick={() => setScheme(next)}
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-md border border-input bg-background text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
            {scheme === 'dark' ? <Sun aria-hidden="true" size={16} /> : <Moon aria-hidden="true" size={16} />}
        </button>
    );
}

export default function ThemeSwitcher({ className = '' }) {
    const { theme, setTheme, availableThemes, isThemeSwitchingEnabled } = useTheme();

    return (
        <div className={`inline-flex min-w-0 items-center gap-2 ${className}`}>
            {isThemeSwitchingEnabled && (
                <label className="inline-flex min-w-0 items-center gap-2 text-xs font-medium text-muted-foreground">
                    <span className="sr-only">پوسته</span>
                    <select
                        aria-label="انتخاب پوسته"
                        value={theme}
                        onChange={(event) => setTheme(event.target.value)}
                        className="h-9 max-w-28 rounded-md border border-input bg-background px-2 text-xs font-medium text-foreground shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring sm:max-w-36"
                    >
                        {availableThemes.map((item) => (
                            <option key={item.id} value={item.id}>{item.name}</option>
                        ))}
                    </select>
                </label>
            )}
            {theme === 'new-york' && <ColorSchemeControl />}
        </div>
    );
}
