import { cn } from '../../lib/utils';
import { forwardRef } from 'react';

const inputVariants = {
    default: 'flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
    checkbox: 'h-4 w-4 shrink-0 rounded-sm border border-primary accent-primary text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
    radio: 'h-4 w-4 shrink-0 rounded-full border border-primary accent-primary text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
};

export const Input = forwardRef(function Input({ className, type = 'text', ...props }, ref) {
    const variant = type === 'checkbox' ? 'checkbox' : type === 'radio' ? 'radio' : type === 'hidden' ? null : 'default';
    return <input
        type={type}
        ref={ref}
        className={cn(variant ? inputVariants[variant] : '', className)}
        {...props}
    />;
});
Input.displayName = 'Input';
