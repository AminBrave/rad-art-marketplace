import { cloneElement, isValidElement, useId } from 'react';
import { cn } from '../../lib/utils';

const buttonVariants = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    outline: 'border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground',
    ghost: 'bg-transparent text-foreground hover:bg-accent/10',
    danger: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
};

const buttonSizes = {
    sm: 'min-h-9 px-3 text-xs',
    md: 'min-h-11 px-4 py-2.5 text-sm',
    lg: 'min-h-12 px-6 py-3 text-base',
};

export function Button({
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    type = 'button',
    className = '',
    ...props
}) {
    return (
        <button
            type={type}
            disabled={disabled || loading}
            aria-busy={loading || undefined}
            className={cn('ra-button', buttonVariants[variant] ?? buttonVariants.primary, buttonSizes[size] ?? buttonSizes.md, className)}
            {...props}
        >
            {loading && <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-current border-e-transparent" />}
            {children}
        </button>
    );
}

export function IconButton({ children, label, size = 'md', className = '', ...props }) {
    const dimensions = { sm: 'h-9 w-9', md: 'h-11 w-11', lg: 'h-12 w-12' };
    return (
        <button
            type="button"
            aria-label={label}
            title={label}
            className={cn('ra-button ra-button--outline shrink-0 !p-0', dimensions[size] ?? dimensions.md, className)}
            {...props}
        >
            {children}
        </button>
    );
}

const badgeVariants = {
    neutral: 'bg-surface-muted text-muted',
    success: 'bg-olive/10 text-olive',
    warning: 'bg-warning/10 text-warning',
    danger: 'bg-danger/10 text-danger',
    info: 'bg-info/10 text-info',
    accent: 'bg-terracotta/10 text-terracotta-strong',
};

export function Badge({ children, variant = 'neutral', className = '' }) {
    return (
        <span className={cn('inline-flex items-center rounded-sm px-2.5 py-1 text-xs font-bold', badgeVariants[variant] ?? badgeVariants.neutral, className)}>
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
        <div className={`grid gap-2 ${className}`}>
            <label htmlFor={fieldId} className="text-sm font-semibold text-ink">
                {label}
                {required && <span aria-hidden="true" className="ms-1 text-danger">*</span>}
            </label>
            {control}
            {hint && <p id={`${fieldId}-hint`} className="text-xs leading-6 text-muted">{hint}</p>}
            {error && <p id={`${fieldId}-error`} role="alert" className="text-xs leading-6 text-danger">{error}</p>}
        </div>
    );
}

export function TextInput({ className = '', ...props }) {
    return <input className={`${controlClass} ${className}`} {...props} />;
}

export function TextareaField({ className = '', rows = 4, ...props }) {
    return <textarea rows={rows} className={`${controlClass} min-h-28 resize-y leading-7 ${className}`} {...props} />;
}

export function SelectField({ className = '', children, ...props }) {
    return (
        <select className={`${controlClass} ${className}`} {...props}>
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
        <form onSubmit={submit} role="search" className={`flex min-w-0 flex-col gap-2 sm:flex-row ${className}`}>
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
