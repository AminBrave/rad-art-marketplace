import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export const Label = forwardRef(({ className, ...props }, ref) => (
    <label ref={ref} className={cn('text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70', className)} {...props} />
));
Label.displayName = 'Label';

export const NativeSelect = forwardRef(({ className, children, ...props }, ref) => (
    <select ref={ref} data-slot="native-select" className={cn(
        'flex h-9 w-full min-w-0 appearance-none rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        'aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive',
        className,
    )} {...props}>{children}</select>
));
NativeSelect.displayName = 'NativeSelect';

export const Checkbox = forwardRef(({ className, ...props }, ref) => (
    <input ref={ref} type="checkbox" data-slot="checkbox" className={cn(
        'size-4 shrink-0 cursor-pointer rounded-sm border border-primary accent-primary',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive',
        className,
    )} {...props} />
));
Checkbox.displayName = 'Checkbox';

export const Radio = forwardRef(({ className, ...props }, ref) => (
    <input ref={ref} type="radio" data-slot="radio" className={cn(
        'size-4 shrink-0 cursor-pointer accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
    )} {...props} />
));
Radio.displayName = 'Radio';

export const Switch = forwardRef(({ className, checked = false, onCheckedChange, disabled = false, ...props }, ref) => (
    <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={checked}
        data-state={checked ? 'checked' : 'unchecked'}
        disabled={disabled}
        onClick={() => onCheckedChange?.(!checked)}
        className={cn(
            'peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            checked ? 'bg-primary' : 'bg-input',
            className,
        )}
        {...props}
    >
        <span className={cn('pointer-events-none block size-4 rounded-full bg-background shadow-lg ring-0 transition-transform', checked ? '-translate-x-4' : 'translate-x-0')} />
    </button>
));
Switch.displayName = 'Switch';

export function RadioGroup({ value, onValueChange, name, children, className, 'aria-label': ariaLabel, ...props }) {
    return <div role="radiogroup" aria-label={ariaLabel} className={cn('grid gap-3', className)} {...props}>
        {typeof children === 'function' ? children({ value, onValueChange, name }) : children}
    </div>;
}

export function RadioGroupItem({ value, selected, onSelect, name, className, ...props }) {
    return <Radio name={name} value={value} checked={selected === undefined ? undefined : selected === value} onChange={() => onSelect?.(value)} className={className} {...props} />;
}
