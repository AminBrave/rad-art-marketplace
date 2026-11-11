import { cn } from '../../lib/utils';

export function Separator({ className, orientation = 'horizontal', decorative = true, ...props }) {
    return <div
        role={decorative ? 'none' : 'separator'}
        aria-orientation={decorative ? undefined : orientation}
        data-orientation={orientation}
        className={cn('shrink-0 bg-border', orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px', className)}
        {...props}
    />;
}
