import { useTheme } from './useTheme.js';

export default function ThemeSwitcher({ className = '' }) {
    const { theme, setTheme, availableThemes, isThemeSwitchingEnabled } = useTheme();

    if (!isThemeSwitchingEnabled) return null;

    return (
        <label className={`inline-flex min-w-0 items-center gap-2 text-xs font-semibold text-muted ${className}`}>
            <span className="shrink-0">پوسته</span>
            <select
                aria-label="انتخاب پوسته"
                value={theme}
                onChange={(event) => setTheme(event.target.value)}
                className="min-h-9 max-w-28 sm:max-w-36 rounded-md border border-input bg-background px-2 text-xs font-semibold text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
            >
                {availableThemes.map((item) => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                ))}
            </select>
        </label>
    );
}
