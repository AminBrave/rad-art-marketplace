import { cloneElement, isValidElement, useId } from 'react';

const buttonVariants = {
    primary: 'bg-terracotta text-white hover:bg-terracotta-strong',
    secondary: 'bg-surface-muted text-ink hover:bg-border',
    outline: 'border border-border-strong bg-paper text-ink hover:border-terracotta hover:text-terracotta-strong',
    ghost: 'bg-transparent text-ink hover:bg-surface-muted',
    danger: 'bg-danger text-white hover:brightness-90',
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
            className={`inline-flex items-center justify-center gap-2 rounded-md font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta-strong disabled:cursor-not-allowed disabled:opacity-50 ${buttonVariants[variant] ?? buttonVariants.primary} ${buttonSizes[size] ?? buttonSizes.md} ${className}`}
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
            className={`inline-flex shrink-0 items-center justify-center rounded-md border border-border bg-paper text-ink transition-colors hover:border-terracotta hover:text-terracotta-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta-strong disabled:cursor-not-allowed disabled:opacity-50 ${dimensions[size] ?? dimensions.md} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}

const badgeVariants = {
    neutral: 'bg-surface-muted text-muted',
    success: 'bg-olive/10 text-olive',
    warning: 'bg-amber-100 text-amber-900',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-sky-100 text-sky-900',
    accent: 'bg-terracotta/10 text-terracotta-strong',
};

export function Badge({ children, variant = 'neutral', className = '' }) {
    return (
        <span className={`inline-flex items-center rounded-sm px-2.5 py-1 text-xs font-bold ${badgeVariants[variant] ?? badgeVariants.neutral} ${className}`}>
            {children}
        </span>
    );
}

const controlClass = 'w-full rounded-md border border-border-strong bg-paper px-3.5 py-3 text-sm text-ink placeholder:text-subtle outline-none transition-colors focus:border-terracotta focus:ring-2 focus:ring-terracotta/15 disabled:cursor-not-allowed disabled:bg-surface-muted disabled:opacity-60 aria-[invalid=true]:border-danger';

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
