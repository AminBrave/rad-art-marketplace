import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export function Avatar({ className, children, ...props }) {
    return <span data-slot="avatar" className={cn('relative flex size-10 shrink-0 overflow-hidden rounded-full bg-muted', className)} {...props}>{children}</span>;
}

export const AvatarImage = forwardRef(({ className, alt = '', ...props }, ref) => (
    <img ref={ref} alt={alt} className={cn('aspect-square size-full object-cover', className)} {...props} />
));
AvatarImage.displayName = 'AvatarImage';

export const AvatarFallback = forwardRef(({ className, ...props }, ref) => (
    <span className={cn('flex size-full items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground', className)} {...props} />
));
AvatarFallback.displayName = 'AvatarFallback';

export const Progress = forwardRef(({ className, value = 0, max = 100, ...props }, ref) => {
    const normalized = Math.min(max, Math.max(0, Number(value) || 0));
    return <div ref={ref} role="progressbar" aria-valuemin={0} aria-valuemax={max} aria-valuenow={normalized} className={cn('relative h-2 w-full overflow-hidden rounded-full bg-secondary', className)} {...props}>
        <div className="h-full bg-primary transition-[width] duration-300" style={{ width: (normalized / max) * 100 + '%' }} />
    </div>;
});
Progress.displayName = 'Progress';

export function Spinner({ className, label = 'در حال بارگذاری', ...props }) {
    return <span role="status" aria-label={label} className={cn('inline-block size-4 animate-spin rounded-full border-2 border-current border-e-transparent', className)} {...props} />;
}

export function Kbd({ className, ...props }) {
    return <kbd className={cn('pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground', className)} {...props} />;
}

export function Toggle({ pressed = false, onPressedChange, variant = 'default', className, children, ...props }) {
    return <button type="button" aria-pressed={pressed} data-state={pressed ? 'on' : 'off'} onClick={() => onPressedChange?.(!pressed)}
        className={cn('inline-flex h-9 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
            pressed && 'bg-accent text-accent-foreground', variant === 'outline' && 'border border-input bg-transparent', className)} {...props}>{children}</button>;
}

export function AspectRatio({ ratio = 1, className, children, ...props }) {
    return <div className={cn('relative w-full', className)} style={{ aspectRatio: ratio }} {...props}>{children}</div>;
}

export function ButtonGroup({ className, orientation = 'horizontal', ...props }) {
    return <div role="group" data-orientation={orientation} className={cn(
        'inline-flex items-center [&>button]:rounded-none [&>button:first-child]:rounded-s-md [&>button:last-child]:rounded-e-md [&>button:not(:first-child)]:-ms-px',
        orientation === 'vertical' && 'flex-col [&>button]:w-full [&>button:first-child]:rounded-s-none [&>button:first-child]:rounded-t-md [&>button:last-child]:rounded-e-none [&>button:last-child]:rounded-b-md [&>button:not(:first-child)]:-mt-px [&>button:not(:first-child)]:-ms-0',
        className,
    )} {...props} />;
}
