import { Button } from './primitives';

export function Skeleton({ className = '', width, height = '1rem', rounded = 'md' }) {
    return (
        <span
            aria-hidden="true"
            className={`app-skeleton ${rounded === 'full' ? 'rounded-full' : rounded === 'lg' ? 'rounded-lg' : 'rounded-md'} ${className}`}
            style={{ width, height }}
        />
    );
}

export function SkeletonLines({ lines = 3, className = '' }) {
    return (
        <div aria-label="در حال بارگذاری" role="status" className={`grid gap-3 ${className}`}>
            {Array.from({ length: lines }, (_, index) => (
                <Skeleton key={index} width={index === lines - 1 ? '68%' : '100%'} height="0.8rem" />
            ))}
            <span className="sr-only">در حال بارگذاری…</span>
        </div>
    );
}

export function EmptyState({ title, description, action, className = '' }) {
    return (
        <section className={`ra-state ra-state--empty grid justify-items-center gap-3 px-5 py-10 text-center ${className}`} dir="rtl">
            <span aria-hidden="true" className="h-2 w-10 rounded-full bg-sand" />
            <h2 className="text-base font-bold text-ink">{title}</h2>
            {description && <p className="max-w-lg text-sm leading-7 text-muted">{description}</p>}
            {action}
        </section>
    );
}

export function ErrorState({ title = 'مشکلی پیش آمد', description, onRetry, retryLabel = 'تلاش دوباره', className = '' }) {
    return (
        <section role="alert" className={`ra-state ra-state--error grid justify-items-start gap-3 p-5 ${className}`} dir="rtl">
            <h2 className="font-bold text-danger">{title}</h2>
            {description && <p className="text-sm leading-7 text-muted">{description}</p>}
            {onRetry && <Button variant="outline" size="sm" onClick={onRetry}>{retryLabel}</Button>}
        </section>
    );
}

export function SuccessState({ title, description, className = '' }) {
    return (
        <div role="status" className={`ra-state ra-state--success px-4 py-3 ${className}`} dir="rtl">
            <p className="font-semibold text-olive">{title}</p>
            {description && <p className="mt-1 text-sm leading-6 text-muted">{description}</p>}
        </div>
    );
}

export function PermissionState({ title = 'دسترسی مجاز نیست', description, className = '' }) {
    return (
        <section role="status" className={`ra-state bg-surface-muted p-5 ${className}`} dir="rtl">
            <h2 className="font-bold text-ink">{title}</h2>
            {description && <p className="mt-2 text-sm leading-7 text-muted">{description}</p>}
        </section>
    );
}

export function UploadFeedback({ fileName, status = 'idle', progress = 0, message }) {
    if (status === 'idle' && !message) return null;
    const safeProgress = Math.max(0, Math.min(100, Number(progress) || 0));
    const labels = {
        uploading: 'در حال بارگذاری',
        success: 'بارگذاری انجام شد',
        error: 'بارگذاری ناموفق بود',
    };

    return (
        <div className="grid gap-2 rounded-md border border-border bg-paper p-3 text-sm" dir="rtl">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold text-ink">{fileName || 'فایل انتخاب‌شده'}</span>
                <span className={status === 'error' ? 'text-danger' : status === 'success' ? 'text-olive' : 'text-muted'}>
                    {labels[status] ?? message}
                </span>
            </div>
            {status === 'uploading' && (
                <div
                    role="progressbar"
                    aria-label="پیشرفت بارگذاری"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={safeProgress}
                    className="h-2 overflow-hidden rounded-full bg-surface-muted"
                >
                    <span className="block h-full bg-terracotta transition-[width]" style={{ width: `${safeProgress}%` }} />
                </div>
            )}
            {message && <p className="text-xs leading-6 text-muted">{message}</p>}
        </div>
    );
}

export function Toast({ open = true, title, description, variant = 'info', onDismiss }) {
    if (!open) return null;
    const variants = {
        success: 'ra-toast--success',
        error: 'ra-toast--danger',
        info: 'ra-toast--info',
    };
    return (
        <div
            role={variant === 'error' ? 'alert' : 'status'}
            aria-live={variant === 'error' ? 'assertive' : 'polite'}
            className={`ra-toast flex items-start justify-between gap-4 ${variants[variant] ?? variants.info}`}
            dir="rtl"
        >
            <div>
                <p className="font-bold text-ink">{title}</p>
                {description && <p className="mt-1 text-sm leading-6 text-muted">{description}</p>}
            </div>
            {onDismiss && (
                <button type="button" onClick={onDismiss} aria-label="بستن اعلان" className="rounded-sm px-2 py-1 text-muted hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus">
                    ×
                </button>
            )}
        </div>
    );
}
