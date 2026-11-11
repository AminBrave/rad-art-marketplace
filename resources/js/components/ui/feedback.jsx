import { Button } from './button';
import { Alert, AlertDescription, AlertTitle } from './alert';
import { Progress } from './misc';
import { Card } from './card';

export function Skeleton({ className = '', width, height = '1rem', rounded = 'md' }) {
    return <span aria-hidden="true" className={`block animate-pulse bg-muted ${rounded === 'full' ? 'rounded-full' : rounded === 'lg' ? 'rounded-lg' : 'rounded-md'} ${className}`} style={{ width, height }} />;
}
export function SkeletonLines({ lines = 3, className = '' }) {
    return <div aria-label="در حال بارگذاری" role="status" className={`grid gap-3 ${className}`}>{Array.from({ length: lines }, (_, index) => <Skeleton key={index} width={index === lines - 1 ? '68%' : '100%'} height="0.8rem" />)}<span className="sr-only">در حال بارگذاری…</span></div>;
}
export function EmptyState({ title, description, action, className = '' }) {
    return <Card className={`grid justify-items-center gap-3 px-6 py-12 text-center ${className}`} dir="rtl">
        <span aria-hidden="true" className="grid size-10 place-items-center rounded-full bg-muted text-lg text-muted-foreground">◇</span>
        <h2 className="text-base font-semibold text-card-foreground">{title}</h2>
        {description && <p className="max-w-lg text-sm leading-7 text-muted-foreground">{description}</p>}{action}
    </Card>;
}
export function ErrorState({ title = 'مشکلی پیش آمد', description, onRetry, retryLabel = 'تلاش دوباره', className = '' }) {
    return <Alert variant="destructive" className={`grid gap-2 p-5 ${className}`} dir="rtl"><AlertTitle>{title}</AlertTitle>{description && <AlertDescription>{description}</AlertDescription>}{onRetry && <div><Button variant="outline" size="sm" onClick={onRetry}>{retryLabel}</Button></div>}</Alert>;
}
export function SuccessState({ title, description, className = '' }) {
    return <Alert className={`border-emerald-600/30 bg-emerald-50 text-emerald-950 dark:bg-emerald-950/30 dark:text-emerald-100 ${className}`} dir="rtl"><AlertTitle>{title}</AlertTitle>{description && <AlertDescription>{description}</AlertDescription>}</Alert>;
}
export function PermissionState({ title = 'دسترسی مجاز نیست', description, className = '' }) {
    return <Alert className={className} dir="rtl"><AlertTitle>{title}</AlertTitle>{description && <AlertDescription>{description}</AlertDescription>}</Alert>;
}
export function UploadFeedback({ fileName, status = 'idle', progress = 0, message }) {
    if (status === 'idle' && !message) return null;
    const safeProgress = Math.max(0, Math.min(100, Number(progress) || 0));
    const labels = { uploading: 'در حال بارگذاری', success: 'بارگذاری انجام شد', error: 'بارگذاری ناموفق بود' };
    return <Card className="grid gap-3 p-4 text-sm" dir="rtl">
        <div className="flex flex-wrap items-center justify-between gap-2"><span className="font-medium text-card-foreground">{fileName || 'فایل انتخاب‌شده'}</span><span className={status === 'error' ? 'text-destructive' : status === 'success' ? 'text-emerald-700 dark:text-emerald-300' : 'text-muted-foreground'}>{labels[status] ?? message}</span></div>
        {status === 'uploading' && <Progress value={safeProgress} aria-label="پیشرفت بارگذاری" />}{message && <p className="text-xs leading-6 text-muted-foreground">{message}</p>}
    </Card>;
}
export function Toast({ open = true, title, description, variant = 'info', onDismiss }) {
    if (!open) return null;
    return <div role={variant === 'error' ? 'alert' : 'status'} aria-live={variant === 'error' ? 'assertive' : 'polite'} dir="rtl">
        <Alert variant={variant === 'error' ? 'destructive' : 'default'} className="flex items-start justify-between gap-4 shadow-md">
            <div><AlertTitle>{title}</AlertTitle>{description && <AlertDescription>{description}</AlertDescription>}</div>
            {onDismiss && <button type="button" onClick={onDismiss} aria-label="بستن اعلان" className="rounded-sm px-2 py-1 text-muted-foreground hover:bg-muted">×</button>}
        </Alert>
    </div>;
}
