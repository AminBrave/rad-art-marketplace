import { cloneElement, forwardRef, isValidElement, useId } from 'react';
import { Slot, Slottable } from '@radix-ui/react-slot';
import { Input } from './input';
import { cn } from '../../lib/utils';

const buttonVariants = {
    default: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
    destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
    outline: 'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
    secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    link: 'text-primary underline-offset-4 hover:underline',
};
const buttonSizes = {
    default: 'h-9 px-4 py-2',
    sm: 'h-8 rounded-md px-3 text-xs',
    lg: 'h-10 rounded-md px-8',
    icon: 'h-9 w-9',
};

export const Button = forwardRef(function Button({ children, variant = 'default', size = 'default', asChild = false, loading = false, disabled = false, type = 'button', tabIndex, className = '', ...props }, ref) {
    const Comp = asChild ? Slot : 'button';
    const resolvedVariant = ({ primary: 'default', danger: 'destructive' })[variant] ?? variant;
    const resolvedSize = ({ md: 'default' })[size] ?? size;
    return (
        <Comp
            ref={ref}
            type={asChild ? undefined : type}
            disabled={asChild ? undefined : disabled || loading}
            aria-busy={loading || undefined}
            aria-disabled={asChild && (disabled || loading) ? true : undefined}
            data-disabled={asChild && (disabled || loading) ? '' : undefined}
            tabIndex={asChild && (disabled || loading) ? -1 : tabIndex}
            className={cn('inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50', buttonVariants[resolvedVariant] ?? buttonVariants.default, buttonSizes[resolvedSize] ?? buttonSizes.default, asChild && (disabled || loading) && 'pointer-events-none opacity-50', className)}
            {...props}
        >
            {loading && <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-current border-e-transparent" />}
            {asChild ? <Slottable>{children}</Slottable> : children}
        </Comp>
    );
});
Button.displayName = 'Button';

export function IconButton({ children, label, size = 'icon', className = '', ...props }) {
    const iconSize = size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'icon';
    return <Button type="button" variant="outline" size={iconSize} aria-label={label} title={label} className={cn('aspect-square shrink-0 p-0', className)} {...props}>{children}</Button>;
}

const badgeVariants = {
    default: 'border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/90',
    success: 'border-transparent bg-accent text-accent-foreground',
    warning: 'border-transparent bg-secondary text-secondary-foreground',
    info: 'border-transparent bg-muted text-muted-foreground',
    secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
    destructive: 'border-transparent bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
    outline: 'text-foreground',
};

export function Badge({ children, variant = 'default', className = '', ...props }) {
    const resolvedVariant = ({ danger: 'destructive', accent: 'default', neutral: 'secondary' })[variant] ?? variant;
    return <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2', badgeVariants[resolvedVariant] ?? badgeVariants.default, className)} {...props}>{children}</span>;
}

export function FormField({ id, label, hint, error, required = false, children, className = '' }) {
    const generatedId = useId();
    const fieldId = id ?? generatedId;
    const describedBy = [hint ? `${fieldId}-hint` : null, error ? `${fieldId}-error` : null].filter(Boolean).join(' ') || undefined;
    const control = isValidElement(children) ? cloneElement(children, {
        id: fieldId,
        'aria-invalid': error ? true : children.props['aria-invalid'],
        'aria-describedby': [children.props['aria-describedby'], describedBy].filter(Boolean).join(' ') || undefined,
    }) : children;
    return <div className={cn('grid gap-2', className)}>
        <label htmlFor={fieldId} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{label}{required && <span aria-hidden="true" className="ms-1 text-destructive">*</span>}</label>
        {control}
        {hint && <p id={`${fieldId}-hint`} className="text-sm text-muted-foreground">{hint}</p>}
        {error && <p id={`${fieldId}-error`} role="alert" className="text-sm font-medium text-destructive">{error}</p>}
    </div>;
}

export function SearchField({ value, onChange, onSearch, placeholder = 'جست‌وجو…', label = 'جست‌وجو', buttonLabel = 'جست‌وجو', disabled = false, className = '' }) {
    const searchId = useId();
    const submit = (event) => { event.preventDefault(); onSearch?.(value); };
    return <form onSubmit={submit} role="search" className={cn('flex min-w-0 flex-col gap-2 sm:flex-row', className)}>
        <label className="sr-only" htmlFor={searchId}>{label}</label>
        <Input id={searchId} type="search" value={value} onChange={onChange} placeholder={placeholder} disabled={disabled} />
        <Button type="submit" disabled={disabled}>{buttonLabel}</Button>
    </form>;
}
