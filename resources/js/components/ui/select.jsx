import { cn } from '../../lib/utils';
import { forwardRef } from 'react';

export const Select = forwardRef(function Select({ className, children, ...props }, ref) {
    return <select
        ref={ref}
        className={cn('flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50', className)}
        {...props}
    >{children}</select>;
});
Select.displayName = 'Select';
