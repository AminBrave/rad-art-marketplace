import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

const variants = {
    default: 'bg-background text-foreground',
    destructive: 'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive',
};
export const Alert = forwardRef(function Alert({ variant = 'default', className, ...props }, ref) {
    return <div ref={ref} role="alert" className={cn('relative w-full rounded-lg border px-4 py-3 text-sm [&>svg~*]:ps-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:start-4 [&>svg]:top-4', variants[variant] ?? variants.default, className)} {...props} />;
});
Alert.displayName = 'Alert';

export const AlertTitle = forwardRef(function AlertTitle({ className, ...props }, ref) {
    return <h5 ref={ref} className={cn('mb-1 font-medium leading-none tracking-tight', className)} {...props} />;
});
AlertTitle.displayName = 'AlertTitle';

export const AlertDescription = forwardRef(function AlertDescription({ className, ...props }, ref) {
    return <div ref={ref} className={cn('text-sm [&_p]:leading-relaxed', className)} {...props} />;
});
AlertDescription.displayName = 'AlertDescription';
