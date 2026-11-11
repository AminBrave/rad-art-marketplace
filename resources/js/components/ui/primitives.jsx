import { cloneElement, isValidElement, useId } from 'react';
import { cn } from '../../lib/utils';
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
        <div className={`grid gap-2 ${className}`} data-slot="field">
            <label htmlFor={fieldId} className="text-sm font-medium leading-none">
                {label}
                {required && <span aria-hidden="true" className="ms-1 text-destructive">*</span>}
            </label>
            {control}
            {hint && <p id={`${fieldId}-hint`} className="text-sm text-muted-foreground">{hint}</p>}
            {error && <p id={`${fieldId}-error`} role="alert" className="text-sm font-medium text-destructive">{error}</p>}
        </div>
    );
}

export function TextInput({ className = '', ...props }) {
    return <input className={cn(controlClass, className)} {...props} />;
}

export function TextareaField({ className = '', rows = 4, ...props }) {
    return <textarea rows={rows} className={cn(controlClass, 'min-h-20 resize-y', className)} {...props} />;
}

export function SelectField({ className = '', children, ...props }) {
    return (
        <select className={cn(controlClass, className)} {...props}>
            {children}
        </select>
    );
}

export function SearchField({
    value,
    onChange,
    onSearch,
    placeholder = 'جست‌وجو…',
    label = 'جست‌وجو',
    buttonLabel = 'جست‌وجو',
    disabled = false,
    className = '',
}) {
    const searchId = useId();
    const submit = (event) => {
        event.preventDefault();
        onSearch?.(value);
    };

    return (
        <form onSubmit={submit} role="search" className={cn('flex min-w-0 flex-col gap-2 sm:flex-row', className)}>
            <label className="sr-only" htmlFor={searchId}>{label}</label>
            <TextInput
                id={searchId}
                type="search"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
            />
            <Button type="submit" size="md" disabled={disabled}>{buttonLabel}</Button>
        </form>
    );
}
