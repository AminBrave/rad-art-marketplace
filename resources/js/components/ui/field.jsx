import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export const FieldSet = forwardRef(({ className, ...props }, ref) => (
    <fieldset ref={ref} className={cn('flex min-w-0 flex-col gap-6', className)} {...props} />
));
FieldSet.displayName = 'FieldSet';

export const FieldLegend = forwardRef(({ className, ...props }, ref) => (
    <legend ref={ref} className={cn('mb-3 text-base font-semibold', className)} {...props} />
));
FieldLegend.displayName = 'FieldLegend';

export const FieldGroup = forwardRef(({ className, ...props }, ref) => (
    <div ref={ref} className={cn('grid gap-5', className)} {...props} />
));
FieldGroup.displayName = 'FieldGroup';

export const Field = forwardRef(({ className, orientation = 'vertical', ...props }, ref) => (
    <div
        ref={ref}
        data-slot="field"
        data-orientation={orientation}
        className={cn(
            'grid min-w-0 gap-2',
            orientation === 'horizontal' && 'grid-cols-[auto_1fr] items-start gap-x-3',
            className,
        )}
        {...props}
    />
));
Field.displayName = 'Field';

export const FieldLabel = forwardRef(({ className, ...props }, ref) => (
    <label ref={ref} className={cn('text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70', className)} {...props} />
));
FieldLabel.displayName = 'FieldLabel';

export const FieldDescription = forwardRef(({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-sm leading-relaxed text-muted-foreground', className)} {...props} />
));
FieldDescription.displayName = 'FieldDescription';

export function FieldError({ className, errors, children, ...props }) {
    const messages = errors?.map((error) => error?.message).filter(Boolean) ?? [];
    const content = children ?? messages.join('، ');
    if (!content) return null;
    return <p role="alert" className={cn('text-sm font-medium text-destructive', className)} {...props}>{content}</p>;
}

export const FieldSeparator = forwardRef(({ children, className, ...props }, ref) => (
    <div ref={ref} role="separator" className={cn('relative my-1 h-px w-full bg-border', className)} {...props}>
        {children && <span className="absolute start-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">{children}</span>}
    </div>
));
FieldSeparator.displayName = 'FieldSeparator';
