import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

export const Select = forwardRef(function Select({ className, children, ...props }, ref) {
    return (
        <div className="relative w-full">
            <select
                ref={ref}
                className={cn('flex h-9 w-full appearance-none rounded-md border border-input bg-background px-3 py-1 pe-9 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50', className)}
                {...props}
            >{children}</select>
            <ChevronDown aria-hidden="true" className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>
    );
});
Select.displayName = 'Select';
