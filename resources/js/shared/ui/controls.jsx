import { Children, cloneElement, forwardRef, isValidElement, useId } from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import { Tooltip } from './Tooltip';
import { cn } from '../../lib/utils';

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
