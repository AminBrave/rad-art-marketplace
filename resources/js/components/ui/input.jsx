import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export const Input = forwardRef(({ className, type = 'text', ...props }, ref) => (
    <input
        ref={ref}
        type={type}
        data-slot="input"
        className={cn(
            'flex h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors',
            'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
            'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive',
            className,
        )}
        {...props}
    />
));
Input.displayName = 'Input';

export const InputGroup = forwardRef(({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex h-9 w-full min-w-0 items-center rounded-md border border-input bg-transparent shadow-sm focus-within:ring-1 focus-within:ring-ring', className)} {...props} />
));
InputGroup.displayName = 'InputGroup';

export const InputGroupAddon = forwardRef(({ className, align = 'inline-start', ...props }, ref) => (
    <div ref={ref} data-align={align} className={cn('flex h-full items-center justify-center px-3 text-sm text-muted-foreground [&_svg]:size-4', className)} {...props} />
));
InputGroupAddon.displayName = 'InputGroupAddon';

export const InputGroupText = forwardRef(({ className, ...props }, ref) => (
    <span ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
));
InputGroupText.displayName = 'InputGroupText';

export const InputGroupInput = forwardRef(({ className, ...props }, ref) => (
    <input ref={ref} className={cn('h-full min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50', className)} {...props} />
));
InputGroupInput.displayName = 'InputGroupInput';
