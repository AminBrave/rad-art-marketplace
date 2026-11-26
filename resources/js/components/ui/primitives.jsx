import { Children, cloneElement, forwardRef, isValidElement, useId } from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import { Tooltip } from './Tooltip';
import { cn } from '../../lib/utils';
import { Container } from './layout';

const buttonVariants = {
    primary: 'bg-terracotta text-inverse enabled:hover:bg-terracotta-strong',
    secondary: 'border-border bg-surface-muted text-ink enabled:hover:border-border-strong enabled:hover:bg-border',
    outline: 'border-border-strong bg-paper text-ink enabled:hover:border-terracotta enabled:hover:text-terracotta-strong',
    ghost: 'bg-transparent text-ink hover:bg-surface-muted',
    danger: 'bg-danger text-inverse enabled:hover:bg-danger',
};

const buttonSizes = {
    sm: 'min-h-9 px-3 py-1 text-xs',
    md: 'min-h-11 px-4 py-2 text-sm',
    lg: 'min-h-12 px-6 py-3 text-base',
};

export const Button = forwardRef(function Button({
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    type = 'button',
    className = '',
    ...props
}, ref) {
    return (
        <button
            ref={ref}
            type={type}
            disabled={disabled || loading}
            aria-busy={loading || undefined}
            className={cn('inline-flex min-h-11 items-center justify-center gap-2 border border-transparent px-4 py-2 text-sm font-bold leading-[1.4] tracking-[-.01em] text-ink no-underline transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus', buttonVariants[variant] ?? buttonVariants.primary, buttonSizes[size] ?? buttonSizes.md, className, 'rounded-none whitespace-nowrap')}
            {...props}
        >
            {loading && <span aria-hidden="true" className="h-4 w-4 animate-spin  border-2 border-current border-e-transparent" />}
            {children}
        </button>
    );
});

export const IconButton = forwardRef(function IconButton({ children, label, title, size = 'md', className = '', ...props }, ref) {
    const tooltipLabel = label ?? title;
    const dimensions = { sm: 'h-9 w-9', md: 'h-11 w-11', lg: 'h-12 w-12' };
    return (
        <Tooltip content={tooltipLabel}>
            <button
                ref={ref}
                type="button"
                aria-label={tooltipLabel}
                className={cn('inline-flex items-center justify-center border border-border-strong bg-paper p-0 text-ink transition-colors enabled:hover:border-terracotta enabled:hover:text-terracotta-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus shrink-0', dimensions[size] ?? dimensions.md, className, 'rounded-none shrink-0')}
                {...props}
            >
                {children}
            </button>
        </Tooltip>
    );
});

const badgeVariants = {
    neutral: 'bg-surface-muted text-muted',
    success: 'bg-success-surface text-success',
    warning: 'bg-warning-surface text-warning',
    danger: 'bg-danger-surface text-danger',
    info: 'bg-info-surface text-info',
    accent: 'bg-accent-surface text-terracotta-strong',
};

export function Badge({ children, variant = 'neutral', className = '' }) {
    return (
        <span className={cn('inline-flex items-center gap-1  px-3 py-1 text-xs font-bold leading-[1.5]', badgeVariants[variant] ?? badgeVariants.neutral, className)}>
            {children}
        </span>
    );
}


// Backward-compatible name; Container in layout.jsx is the single implementation.
export const PageContainer = Container;

/**
 * One shared hero primitive for discovery, editorial and workspace routes.
 * Route-specific content changes; the full-width frame, type scale and rhythm do not.
 */
export function UnifiedHero({
    eyebrow, title, description, breadcrumbs, actions, media, children,
    className = '', titleClassName = '', descriptionClassName = '',
    level = 1, bleed = false, compact = false, surface = 'grid',
}) {
    const Heading = level === 2 ? 'h2' : 'h1';
    return (
        <section className={cn('rd-unified-hero rd-hero-surface', (surface === 'grid' || surface === 'grid-square') && 'rd-hero-surface--grid', surface === 'plain' && 'rd-hero-surface--plain', bleed && 'rd-bleed', compact && 'rd-unified-hero--compact', className)}>
            <Container width="wide" className="rd-unified-hero__inner relative z-10">
                {breadcrumbs && <div className="mb-6 text-[11px] font-semibold text-[color:var(--rd-hero-muted)] sm:mb-8">{breadcrumbs}</div>}
                <div className={cn('grid min-w-0 items-center gap-7 lg:gap-12', media && 'lg:grid-cols-[minmax(0,1.15fr)_minmax(17rem,.85fr)]')}>
                    <div className="rd-unified-hero__title-wrap relative z-10 min-w-0">
                        {eyebrow && <p className="inline-flex items-center gap-2 border-s-2 border-[color:var(--rd-hero-accent)] px-3 py-1 text-[11px] font-extrabold leading-none tracking-[.06em] text-[color:var(--rd-hero-accent)]">{eyebrow}</p>}
                        <Heading className={cn('mt-3 max-w-4xl break-words text-[clamp(1.75rem,4.2vw,3.5rem)] font-extrabold leading-[1.2] tracking-[-.04em] text-[color:var(--rd-hero-foreground)]', titleClassName)}>{title}</Heading>
                        {description && <p className={cn('mt-3 max-w-2xl text-sm leading-8 text-[color:var(--rd-hero-muted)] sm:text-base sm:leading-9', descriptionClassName)}>{description}</p>}
                        {children && <div className="mt-5 max-w-3xl">{children}</div>}
                        {actions && <div className="mt-6 flex min-w-0 flex-wrap items-center gap-3">{actions}</div>}
                    </div>
                    {media && <div className="relative z-10 mx-auto w-full min-w-0 max-w-xl lg:max-w-none">{media}</div>}
                </div>
            </Container>
        </section>
    );
}

const sharedHeroDefaults = {
    level: 1,
    bleed: true,
    compact: false,
    surface: 'grid',
};

/**
 * Public wrappers intentionally share the complete UnifiedHero prop contract.
 * Only their default bleed behavior differs: discovery is already in a
 * full-width page frame, while PageHeader/workspace routes may need to break
 * out of a constrained parent. Every value remains explicitly overridable.
 */
export function PageHeader(props) {
    return <UnifiedHero {...sharedHeroDefaults} {...props} />;
}

/** Discovery routes may add breadcrumbs; callers decide when they are relevant. */
export function DiscoveryHero(props) {
    return <UnifiedHero {...sharedHeroDefaults} bleed={false} {...props} />;
}

export function SectionHeader({ id, eyebrow, title, description, actions, className = '', level = 2 }) {
    const Heading = level === 3 ? 'h3' : 'h2';
    return (
        <header className={cn('flex min-w-0 items-end justify-between gap-4 border-b border-divider-group pb-3 max-sm:items-stretch max-sm:flex-col', className)}>
            <div className="min-w-0">
                {eyebrow && <p className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[.04em] text-terracotta-strong before:h-px before:w-5 before:bg-terracotta">{eyebrow}</p>}
                <Heading id={id} className="mt-1 text-lg font-bold leading-heading tracking-[-.02em] text-ink">{title}</Heading>
                {description && <p className="mt-1.5 max-w-3xl text-xs leading-6 text-muted">{description}</p>}
            </div>
            {actions && <div className="flex shrink-0 flex-wrap items-center gap-2 max-sm:w-full">{actions}</div>}
        </header>
    );
}

/** Workspace routes share the same hero API; breadcrumbs remain opt-in. */
export function WorkspaceHero(props) {
    return <UnifiedHero {...sharedHeroDefaults} {...props} />;
}
export function DashboardMetricCard({ as, label, value, detail, to, eyebrow, className = '' }) {
    const Element = as ?? (to ? 'a' : 'article');
    const destinationProps = to ? (Element === 'a' ? { href: to } : { to }) : {};
    return (
        <Element {...destinationProps} className={cn('flex min-h-36 min-w-0 flex-col justify-between border border-divider-group bg-paper p-5 text-ink no-underline transition-colors hover:border-terracotta', to && 'transition duration-200 hover:-translate-y-0.5 hover:border-terracotta hover:shadow-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus', className)}>
            <span className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-muted">{label}</span>
                {eyebrow && <span className="text-[10px] font-bold text-terracotta-strong">{eyebrow}</span>}
            </span>
            <span className="mt-5 text-3xl font-extrabold tabular-nums text-ink">{value ?? '—'}</span>
            {detail && <span className="mt-2 text-xs leading-relaxed text-muted">{detail}</span>}
        </Element>
    );
}

const surfaceVariants = {
    default: 'border border-divider-group bg-surface',
    muted: 'border border-divider-group bg-surface-muted',
    raised: 'border border-divider-group bg-surface shadow-soft',
    interactive: 'border border-divider-group bg-surface transition-colors hover:border-terracotta hover:bg-surface-muted focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-focus',
};

export function Surface({ as: Element = 'section', variant = 'default', className = '', children, ...props }) {
    return <Element className={cn(surfaceVariants[variant] ?? surfaceVariants.default, className)} {...props}>{children}</Element>;
}


const statusVariants = {
    pending_review: 'warning',
    changes_requested: 'info',
    approved: 'success',
    published: 'success',
    available: 'success',
    rejected: 'danger',
    sold: 'neutral',
    not_for_sale: 'neutral',
    private: 'neutral',
    public: 'success',
};

export function StatusBadge({ status, label, className = '' }) {
    return <Badge variant={statusVariants[status] ?? 'neutral'} className={className}>{label ?? status ?? 'نامشخص'}</Badge>;
}

const controlClass = 'w-full min-h-11  border border-border-strong bg-paper px-3.5 py-2 font-sans text-sm text-ink transition-colors placeholder:text-subtle focus-visible:border-focus focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus disabled:cursor-not-allowed disabled:bg-surface-muted disabled:opacity-65 aria-[invalid=true]:border-danger';

export function FormField({ id, label, hint, error, required = false, children, className = '' }) {
    const generatedId = useId();
    const fieldId = id ?? generatedId;
    const describedBy = [
        children?.props?.['aria-describedby'],
        hint ? `${fieldId}-hint` : null,
        error ? `${fieldId}-error` : null,
    ].filter(Boolean).join(' ').split(/\\s+/).filter((value, index, values) => values.indexOf(value) === index).join(' ') || undefined;
    const control = isValidElement(children)
        ? cloneElement(children, {
            id: fieldId,
            'aria-invalid': error ? true : children.props['aria-invalid'],
            'aria-describedby': describedBy,
            'aria-labelledby': children.props['aria-labelledby'] ?? `${fieldId}-label`,
        })
        : children;

    return (
        <div className={cn('grid gap-2', className)}>
            <label id={`${fieldId}-label`} htmlFor={fieldId} className="text-sm font-semibold text-ink">
                {label}
                {required && <span aria-hidden="true" className="ms-1 text-danger">*</span>}
            </label>
            {control}
            {hint && <p id={`${fieldId}-hint`} className="text-xs leading-relaxed text-muted">{hint}</p>}
            {error && <p id={`${fieldId}-error`} role="alert" className="text-xs leading-relaxed text-danger">{error}</p>}
        </div>
    );
}

export const TextInput = forwardRef(function TextInput({ className = '', ...props }, ref) {
    return <input ref={ref} className={cn(controlClass, className, '')} {...props} />;
});

export const TextareaField = forwardRef(function TextareaField({ className = '', rows = 4, ...props }, ref) {
    return <textarea ref={ref} rows={rows} className={cn(controlClass, 'min-h-28 resize-y leading-copy', className, '')} {...props} />;
});

export const FileInput = forwardRef(function FileInput({ className = '', ...props }, ref) {
    return <input ref={ref} type="file" className={cn(controlClass, 'cursor-pointer file:ms-3 file: file:border-0 file:bg-surface-muted file:px-3 file:py-2 file:font-semibold', className, '')} {...props} />;
});

const emptySelectValue = '__radix_empty_option__';

export function SelectField({
    className = '',
    children,
    value,
    defaultValue,
    onChange,
    name,
    required = false,
    disabled = false,
    placeholder,
    ...triggerProps
}) {
    const options = Children.toArray(children).filter((child) => isValidElement(child) && child.type === 'option');
    const emptyOption = options.find((option) => String(option.props.value ?? '') === '');
    const selectableOptions = options.filter((option) => String(option.props.value ?? '') !== '');

    const handleValueChange = (nextValue) => {
        const next = nextValue === emptySelectValue ? '' : nextValue;
        onChange?.({ target: { name, value: next } });
    };

    return (
        <SelectPrimitive.Root
            value={value === '' ? '' : value}
            defaultValue={defaultValue === '' ? '' : defaultValue}
            onValueChange={handleValueChange}
            name={name}
            required={required}
            disabled={disabled}
        >
            <SelectPrimitive.Trigger
                className={cn(controlClass, 'flex items-center justify-between gap-3 text-start', className, '')}
                {...triggerProps}
            >
                <SelectPrimitive.Value placeholder={placeholder ?? emptyOption?.props.children} />
                <SelectPrimitive.Icon asChild>
                    <ChevronDown size={16} aria-hidden="true" className="shrink-0 text-muted" />
                </SelectPrimitive.Icon>
            </SelectPrimitive.Trigger>
            <SelectPrimitive.Portal>
                <SelectPrimitive.Content
                    position="popper"
                    sideOffset={4}
                    className="z-[90] max-h-[var(--radix-select-content-available-height)] min-w-[var(--radix-select-trigger-width)] overflow-hidden  border border-border bg-paper text-ink shadow-raised"
                >
                    <SelectPrimitive.Viewport className="p-1.5">
                        {selectableOptions.map((option) => (
                            <SelectPrimitive.Item
                                key={option.key ?? String(option.props.value)}
                                value={String(option.props.value)}
                                disabled={option.props.disabled}
                                textValue={typeof option.props.children === 'string' ? option.props.children : undefined}
                                className="relative flex min-h-10 cursor-pointer select-none items-center  py-2 ps-3 pe-9 text-sm outline-none data-[highlighted]:bg-surface-muted data-[highlighted]:text-ink data-[disabled]:pointer-events-none data-[disabled]:opacity-40"
                            >
                                <SelectPrimitive.ItemText>{option.props.children}</SelectPrimitive.ItemText>
                                <SelectPrimitive.ItemIndicator className="absolute end-2 inline-flex items-center text-terracotta-strong">
                                    <Check size={15} aria-hidden="true" />
                                </SelectPrimitive.ItemIndicator>
                            </SelectPrimitive.Item>
                        ))}
                        {emptyOption && (
                            <SelectPrimitive.Item
                                value={emptySelectValue}
                                className="relative flex min-h-10 cursor-pointer select-none items-center  py-2 ps-3 pe-9 text-sm outline-none data-[highlighted]:bg-surface-muted data-[highlighted]:text-ink"
                            >
                                <SelectPrimitive.ItemText>{emptyOption.props.children}</SelectPrimitive.ItemText>
                            </SelectPrimitive.Item>
                        )}
                    </SelectPrimitive.Viewport>
                </SelectPrimitive.Content>
            </SelectPrimitive.Portal>
        </SelectPrimitive.Root>
    );
}

export function Checkbox({
    children,
    checked,
    defaultChecked,
    onChange,
    name,
    value = 'on',
    required = false,
    disabled = false,
    className = '',
    ...props
}) {
    const hasLabel = children !== undefined && children !== null;

    return (
        <CheckboxPrimitive.Root
            checked={checked}
            defaultChecked={defaultChecked}
            onCheckedChange={(nextChecked) => onChange?.({
                target: { name, value, type: 'checkbox', checked: nextChecked === true },
            })}
            name={name}
            value={value}
            required={required}
            disabled={disabled}
            className={cn(
                hasLabel
                    ? 'group inline-flex w-fit min-w-0 max-w-full min-h-11 items-center gap-3 text-start outline-none focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50'
                    : 'group inline-flex h-5 w-5 shrink-0 items-center justify-center  outline-none focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
                className,
            )}
            {...props}
        >
            <span
                aria-hidden="true"
                className="inline-flex h-5 w-5 shrink-0 items-center justify-center  border border-border-strong bg-paper text-inverse transition-colors group-focus-visible:ring-2 group-focus-visible:ring-focus group-data-[state=checked]:border-terracotta group-data-[state=checked]:bg-terracotta group-data-[state=indeterminate]:border-terracotta group-data-[state=indeterminate]:bg-terracotta"
            >
                <CheckboxPrimitive.Indicator className="flex items-center justify-center">
                    <Check size={14} strokeWidth={3} aria-hidden="true" />
                </CheckboxPrimitive.Indicator>
            </span>
            {children}
        </CheckboxPrimitive.Root>
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
        <form onSubmit={submit} role="search" className={cn('flex min-w-0 flex-col gap-2 sm:flex-row [&>input]:min-w-0 [&>input]:flex-1', className)}>
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
