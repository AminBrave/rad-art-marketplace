import { useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle() {
    const [isDark, setIsDark] = useState(() => document.documentElement.dataset.theme === 'dark');

    const toggleTheme = () => {
        const nextTheme = isDark ? 'light' : 'dark';
        document.documentElement.dataset.theme = nextTheme;
        document.querySelector('meta[name="theme-color"]')?.setAttribute(
            'content',
            nextTheme === 'dark' ? '#171816' : '#F7F5F0',
        );
        try {
            localStorage.setItem('rad-theme', nextTheme);
        } catch {
            // The current page still changes theme when storage is unavailable.
        }
        setIsDark(nextTheme === 'dark');
    };

    return (
        <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? 'فعال‌سازی پوسته روشن' : 'فعال‌سازی پوسته تیره'}
            aria-pressed={isDark}
            title={isDark ? 'پوسته روشن' : 'پوسته تیره'}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-border-strong bg-paper text-ink transition-colors hover:border-terracotta hover:text-terracotta-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        >
            {isDark
                ? <Sun size={18} aria-hidden="true" />
                : <Moon size={18} aria-hidden="true" />}
        </button>
    );
}
