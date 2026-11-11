import { Button } from './primitives';
import { cn } from '../../lib/utils';

export function Skeleton({ className = '', width, height = '1rem', rounded = 'md' }) {
    return <span aria-hidden="true" className={cn('block animate-pulse bg-muted', rounded === 'full' ? 'rounded-full' : rounded === 'lg' ? 'rounded-lg' : 'rounded-md', className)} style={{ width, height }} />;
}
export function SkeletonLines({ lines = 3, className = '' }) {
    return <div aria-label="در حال بارگذاری" role="status" className={cn('grid gap-3', className)}>
        {Array.from({ length: lines }, (_, index) => <Skeleton key={index} width={index === lines - 1 ? '68%' : '100%'} height="0.8rem" />)}
        <span className="sr-only">در حال بارگذاری…</span>
    </div>;
}
export function EmptyState({ title, description, action, className = '' }) {
    return <section className={cn('grid justify-items-center gap-3 rounded-lg border border-dashed bg-card px-5 py-10 text-center', className)} dir="rtl">
        <h2 className="text-base font-semibold">{title}</h2>{description && <p className="max-w-lg text-sm text-muted-foreground">{description}</p>}{action}
    </section>;
}
export function ErrorState({ title = 'مشکلی پیش آمد', description, onRetry, retryLabel = 'تلاش دوباره', className = '' }) {
    return <section role="alert" className={cn('grid justify-items-start gap-3 rounded-lg border border-destructive/40 bg-card p-5', className)} dir="rtl">
        <h2 className="font-semibold text-destructive">{title}</h2>{description && <p className="text-sm text-muted-foreground">{description}</p>}
        {onRetry && <Button variant="outline" size="sm" onClick={onRetry}>{retryLabel}</Button>}
    </section>;
}
export function SuccessState({ title, description, className = '' }) {
    return <div role="status" className={cn('rounded-lg border border-accent/40 bg-card px-4 py-3', className)} dir="rtl">
        <p className="font-medium text-accent">{title}</p>{description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
    </div>;
}
export function PermissionState({ title = 'دسترسی مجاز نیست', description, className = '' }) {
    return <section role="status" className={cn('rounded-lg border bg-muted p-5', className)} dir="rtl">
        <h2 className="font-semibold">{title}</h2>{description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}
    </section>;
}
export function UploadFeedback({ fileName, status = 'idle', progress = 0, message }) {
    if (status === 'idle' && !message) return null;
    const safeProgress = Math.max(0, Math.min(100, Number(progress) || 0));
    const labels = { uploading: 'در حال بارگذاری', success: 'بارگذاری انجام شد', error: 'بارگذاری ناموفق بود' };
    return <div className="grid gap-2 rounded-md border bg-card p-3 text-sm" dir="rtl">
        <div className="flex flex-wrap items-center justify-between gap-2"><span className="font-medium">{fileName || 'فایل انتخاب‌شده'}</span><span className={status === 'error' ? 'text-destructive' : status === 'success' ? 'text-accent' : 'text-muted-foreground'}>{labels[status] ?? message}</span></div>
        {status === 'uploading' && <div role="progressbar" aria-label="پیشرفت بارگذاری" aria-valuemin={0} aria-valuemax={100} aria-valuenow={safeProgress} className="h-2 overflow-hidden rounded-full bg-muted"><span className="block h-full bg-primary transition-[width]" style={{ width: `${safeProgress}%` }} /></div>}
        {message && <p className="text-xs text-muted-foreground">{message}</p>}
    </div>;
}
export function Toast({ open = true, title, description, variant = 'info', onDismiss }) {
    if (!open) return null;
    const variants = { success: 'border-accent', error: 'border-destructive', info: 'border-primary' };
    return <div role={variant === 'error' ? 'alert' : 'status'} aria-live={variant === 'error' ? 'assertive' : 'polite'} className={cn('flex items-start justify-between gap-4 rounded-lg border bg-card p-4 shadow-lg', variants[variant] ?? variants.info)} dir="rtl">
        <div><p className="font-semibold">{title}</p>{description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}</div>
        {onDismiss && <Button type="button" variant="ghost" size="icon" onClick={onDismiss} aria-label="بستن اعلان">×</Button>}
    </div>;
}
