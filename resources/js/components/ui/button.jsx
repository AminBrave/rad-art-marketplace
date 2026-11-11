import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

const variants = {
    default: 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90',
    primary: 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90',
    destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
    danger: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
    outline: 'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
    secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    link: 'text-primary underline-offset-4 hover:underline',
};

const sizes = {
    default: 'h-9 px-4 py-2',
    sm: 'h-8 rounded-md px-3 text-xs',
    md: 'h-9 px-4 py-2',
    lg: 'h-10 rounded-md px-8',
    icon: 'h-9 w-9',
    'icon-sm': 'h-8 w-8',
    'icon-lg': 'h-10 w-10',
};

export const Button = forwardRef(function Button({
    children,
    variant = 'default',
    size = 'default',
    loading = false,
    disabled = false,
    block = false,
    type = 'button',
    className,
    ...props
}, ref) {
    return (
        <button
            ref={ref}
            type={type}
            disabled={disabled || loading}
            aria-busy={loading || undefined}
            className={cn(
                'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                'disabled:pointer-events-none disabled:opacity-50',
                '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
                variants[variant] ?? variants.default,
                sizes[size] ?? sizes.default,
                block && 'w-full',
                className,
            )}
            {...props}
        >
            {loading && <span aria-hidden="true" className="size-4 animate-spin rounded-full border-2 border-current border-e-transparent" />}
            {children}
        </button>
    );
});
