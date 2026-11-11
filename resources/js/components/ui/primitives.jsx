import { cloneElement, isValidElement, useId } from 'react';
import { cn } from '../../lib/utils';
import { Field, FieldLabel, FieldDescription, FieldError } from './field';
import { Button } from './button';

export { Button };

export function IconButton({ children, label, size = 'icon', className = '', ...props }) {
    const normalizedSize = size === 'sm' ? 'icon-sm' : size === 'lg' ? 'icon-lg' : size === 'md' ? 'icon' : size;
    return (
        <Button
            type="button"
            variant="outline"
            size={normalizedSize}
            aria-label={label}
            title={label}
            className={cn('shrink-0 p-0', className)}
            {...props}
        >
            {children}
        </Button>
    );
}

const badgeVariants = {
    default: 'border-transparent bg-primary text-primary-foreground shadow-sm',
    neutral: 'border-transparent bg-secondary text-secondary-foreground',
    secondary: 'border-transparent bg-secondary text-secondary-foreground',
    outline: 'text-foreground',
    destructive: 'border-transparent bg-destructive text-destructive-foreground shadow-sm',
    success: 'border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
    warning: 'border-transparent bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300',
    danger: 'border-transparent bg-destructive text-destructive-foreground',
    info: 'border-transparent bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-300',
    accent: 'border-transparent bg-accent text-accent-foreground',
};

export function Badge({ children, variant = 'neutral', className = '' }) {
    return (
        <span className={cn(
            'inline-flex w-fit items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
            badgeVariants[variant] ?? badgeVariants.neutral,
            className,
        )}>
            {children}
        </span>
    );
}

const controlClass = 'ra-control';

export function FormField({ id, label, hint, error, required = false, children, className = '' }) {
    const generatedId = useId();
    const fieldId = id ?? generatedId;
    const describedBy = [
        hint ? `${fieldId}-hint` : null,
        error ? `${fieldId}-error` : null,
    ].filter(Boolean).join(' ') || undefined;
    const control = isValidElement(children)
        ? cloneElement(children, {
            id: fieldId,
            'aria-invalid': error ? true : children.props['aria-invalid'],
            'aria-describedby': describedBy ?? children.props['aria-describedby'],
        })
        : children;

    return (
        <Field className={cn('gap-2', className)} data-invalid={Boolean(error)}>
            <FieldLabel htmlFor={fieldId}>{label}{required && <span aria-hidden="true" className="ms-1 text-destructive">*</span>}</FieldLabel>
            {control}
            {hint && <FieldDescription id={`${fieldId}-hint`}>{hint}</FieldDescription>}
            {error && <FieldError id={`${fieldId}-error`}>{error}</FieldError>}
        </Field>
    );
}

