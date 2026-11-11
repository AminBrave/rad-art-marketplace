import { cloneElement, isValidElement, useId } from 'react';
import { cn } from '../../lib/utils';

const buttonVariants = {
    primary: 'ra-button--primary',
    secondary: 'ra-button--secondary',
    outline: 'ra-button--outline',
    ghost: 'ra-button--ghost',
    danger: 'ra-button--danger',
};

const buttonSizes = {
    sm: 'ra-button--sm',
    md: 'ra-button--md',
    lg: 'ra-button--lg',
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
            className={cn('ra-button ra-button--outline ra-icon-button shrink-0', dimensions[size] ?? dimensions.md, className)}
            {...props}
        >
            {children}
        </button>
    );
}

const badgeVariants = {
    neutral: 'ra-badge--neutral',
    success: 'ra-badge--success',
    warning: 'ra-badge--warning',
    danger: 'ra-badge--danger',
    info: 'ra-badge--info',
    accent: 'ra-badge--accent',
};

export function Badge({ children, variant = 'neutral', className = '' }) {
    return (
        <span className={cn('ra-badge', badgeVariants[variant] ?? badgeVariants.neutral, className)}>
            {children}
        </span>
    );
}


const pageWidths = {
    wide: 'ra-page--wide',
    reading: 'ra-page--reading',
    full: 'ra-page--full',
};

export function PageContainer({ as: Element = 'div', width = 'wide', className = '', children, ...props }) {
    return <Element className={cn('ra-page', pageWidths[width] ?? pageWidths.wide, className)} {...props}>{children}</Element>;
}

export function PageHeader({ eyebrow, title, description, actions, level = 1, className = '', titleClassName = '', descriptionClassName = '' }) {
    const Heading = level === 2 ? 'h2' : 'h1';
    return (
        <header className={cn('ra-page-header', className)}>
            <div className="ra-page-header__copy">
                {eyebrow && <p className="ra-page-header__eyebrow">{eyebrow}</p>}
                <Heading className={cn('ra-page-header__title', titleClassName)}>{title}</Heading>
                {description && <p className={cn('ra-page-header__description', descriptionClassName)}>{description}</p>}
            </div>
            {actions && <div className="ra-page-header__actions">{actions}</div>}
        </header>
    );
}

export function SectionHeader({ id, eyebrow, title, description, actions, className = '', level = 2 }) {
    const Heading = level === 3 ? 'h3' : 'h2';
    return (
        <header className={cn('ra-section-header', className)}>
            <div className="ra-section-header__copy">
                {eyebrow && <p className="ra-section-header__eyebrow">{eyebrow}</p>}
                <Heading id={id} className="ra-section-header__title">{title}</Heading>
                {description && <p className="ra-section-header__description">{description}</p>}
            </div>
            {actions && <div className="ra-section-header__actions">{actions}</div>}
        </header>
    );
}

const surfaceVariants = {
    default: 'ra-surface',
    muted: 'ra-surface ra-surface--muted',
    raised: 'ra-surface ra-surface--raised',
    interactive: 'ra-surface ra-surface--interactive',
};

export function Surface({ as: Element = 'section', variant = 'default', className = '', children, ...props }) {
    return <Element className={cn(surfaceVariants[variant] ?? surfaceVariants.default, className)} {...props}>{children}</Element>;
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
        <div className={`ra-form-field ${className}`}>
            <label htmlFor={fieldId} className="ra-form-field__label">
                {label}
                {required && <span aria-hidden="true" className="ms-1 text-danger">*</span>}
            </label>
            {control}
            {hint && <p id={`${fieldId}-hint`} className="ra-form-field__hint">{hint}</p>}
            {error && <p id={`${fieldId}-error`} role="alert" className="ra-form-field__error">{error}</p>}
        </div>
    );
}

export function TextInput({ className = '', ...props }) {
    return <input className={`${controlClass} ${className}`} {...props} />;
}

export function TextareaField({ className = '', rows = 4, ...props }) {
    return <textarea rows={rows} className={`${controlClass} ra-control--textarea ${className}`} {...props} />;
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
        <form onSubmit={submit} role="search" className={`ra-search-field ${className}`}>
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
