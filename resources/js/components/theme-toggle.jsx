import { Moon, Sun } from 'lucide-react';
import { Button } from './ui/primitives';
import { useTheme } from './use-theme';

export function ThemeToggle({ className = '' }) {
    const { theme, toggleTheme } = useTheme();
    const label = theme === 'dark' ? 'فعال‌کردن حالت روشن' : 'فعال‌کردن حالت تیره';
    return (
        <Button type="button" variant="outline" size="icon" className={className} onClick={toggleTheme} aria-label={label} title={label}>
            {theme === 'dark' ? <Sun aria-hidden="true" className="h-4 w-4" /> : <Moon aria-hidden="true" className="h-4 w-4" />}
        </Button>
    );
}
