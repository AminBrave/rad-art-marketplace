import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export const Separator = forwardRef(function Separator({ className, orientation = 'horizontal', decorative = true, ...props }, ref) {
    return <div
        ref={ref}
        role={decorative ? 'none' : 'separator'}
        aria-orientation={decorative ? undefined : orientation}
        data-orientation={orientation}
        className={cn('shrink-0 bg-border', orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px', className)}
        {...props}
    />;
});
Separator.displayName = 'Separator';
