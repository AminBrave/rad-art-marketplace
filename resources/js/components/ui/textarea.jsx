import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export const Textarea = forwardRef(({ className, ...props }, ref) => (
    <textarea
        ref={ref}
        data-slot="textarea"
        className={cn(
            'flex min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors',
            'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive',
            className,
        )}
        {...props}
    />
));
Textarea.displayName = 'Textarea';
