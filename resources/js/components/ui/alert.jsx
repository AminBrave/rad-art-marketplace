import { cn } from '../../lib/utils';

const variants = {
    default: 'bg-background text-foreground',
    destructive: 'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive',
};
export function Alert({ variant = 'default', className, ...props }) {
    return <div role="alert" className={cn('relative w-full rounded-lg border px-4 py-3 text-sm [&>svg~*]:ps-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:start-4 [&>svg]:top-4', variants[variant] ?? variants.default, className)} {...props} />;
}
export function AlertTitle({ className, ...props }) {
    return <h5 className={cn('mb-1 font-medium leading-none tracking-tight', className)} {...props} />;
}
export function AlertDescription({ className, ...props }) {
    return <div className={cn('text-sm [&_p]:leading-relaxed', className)} {...props} />;
}
