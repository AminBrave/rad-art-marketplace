import { useState } from 'react';
import { AlertTriangle, ImageOff } from 'lucide-react';
import { Button } from './primitives';
import * as ToastPrimitive from '@radix-ui/react-toast';

const skeletonClasses = 'block bg-[linear-gradient(100deg,var(--color-skeleton-base)_25%,var(--color-skeleton-highlight)_42%,var(--color-skeleton-base)_62%)] [background-size:200%_100%] animate-skeleton-shimmer motion-reduce:animate-none';

export function Skeleton({ className = '', width, height = '1rem', rounded = 'md' }) {
    return (
        <span
            data-ui="skeleton"
            aria-hidden="true"
            className={`${skeletonClasses} ${rounded === 'full' ? 'rounded-full' : rounded === 'lg' ? 'rounded-lg' : 'rounded-md'} ${className}`}
            style={{ width, height }}
        />
    );
}

export function SkeletonLines({ lines = 3, className = '' }) {
    return (
        <div data-ui="skeleton-lines" aria-label="در حال بارگذاری" role="status" className={`grid gap-3 ${className}`}>
            {Array.from({ length: lines }, (_, index) => (
                <Skeleton key={index} width={index === lines - 1 ? '68%' : '100%'} height="0.8rem" />
            ))}
            <span className="sr-only">در حال بارگذاری…</span>
        </div>
    );
}

export function EmptyState({ title, description, action, className = '' }) {
    return (
        <section data-ui="empty-state" className={`grid justify-items-center gap-3 rounded-md border border-dashed border-border bg-surface px-5 py-10 text-center ${className}`} dir="rtl">
            <span aria-hidden="true" className="h-2 w-10 rounded-full bg-line" />
            <h2 className="text-base font-bold text-ink">{title}</h2>
            {description && <p className="max-w-lg text-sm leading-7 text-muted">{description}</p>}
            {action}
        </section>
    );
}

export function ErrorState({ title = 'مشکلی پیش آمد', description, onRetry, retryLabel = 'تلاش دوباره', className = '' }) {
    return (
        <section data-ui="error-state" role="alert" className={`grid justify-items-start gap-3 rounded-md border border-[color:color-mix(in_srgb,var(--color-danger)_30%,transparent)] bg-surface p-5 ${className}`} dir="rtl">
            <h2 className="font-bold text-danger">{title}</h2>
            {description && <p className="text-sm leading-7 text-muted">{description}</p>}
            {onRetry && <Button variant="outline" size="sm" onClick={onRetry}>{retryLabel}</Button>}
        </section>
    );
}

export function SuccessState({ title, description, className = '' }) {
    return (
        <div data-ui="success-state" role="status" className={`rounded-md border border-border border-s-2 border-s-success bg-surface px-4 py-3 ${className}`} dir="rtl">
            <p className="font-semibold text-success">{title}</p>
            {description && <p className="mt-1 text-sm leading-6 text-muted">{description}</p>}
        </div>
    );
}

export function PermissionState({ title = 'دسترسی مجاز نیست', description, className = '' }) {
    return (
        <section data-ui="permission-state" role="status" className={`rounded-md border border-border bg-surface-muted p-5 ${className}`} dir="rtl">
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
        <div data-ui="upload-feedback" className="grid gap-2 rounded-md border border-border bg-paper p-3 text-sm" dir="rtl">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold text-ink">{fileName || 'فایل انتخاب‌شده'}</span>
                <span className={status === 'error' ? 'text-danger' : status === 'success' ? 'text-success' : 'text-muted'}>
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
                    <span className="block h-full bg-accent transition-[width]" style={{ width: `${safeProgress}%` }} />
                </div>
            )}
            {message && <p className="text-xs leading-6 text-muted">{message}</p>}
        </div>
    );
}

export function Toast({ open, title, description, variant = 'info', onDismiss, duration = Infinity }) {
    const [internalOpen, setInternalOpen] = useState(true);
    const isOpen = open ?? internalOpen;
    const variants = {
        success: 'border-s-success',
        error: 'border-s-danger',
        info: 'border-s-accent',
    };

    const handleOpenChange = (nextOpen) => {
        if (open === undefined) setInternalOpen(nextOpen);
        if (!nextOpen) onDismiss?.();
    };

    if (!isOpen) return null;

    return (
        <ToastPrimitive.Provider duration={duration}>
            <ToastPrimitive.Root
                data-ui="toast"
                open={isOpen}
                onOpenChange={handleOpenChange}
                type={variant === 'error' ? 'foreground' : 'background'}
                dir="rtl"
                className={`flex w-full items-start justify-between gap-4 rounded-md border-s-4 border-border bg-paper p-4 text-ink shadow-soft ${variants[variant] ?? variants.info}`}
            >
                <div>
                    <ToastPrimitive.Title className="font-bold text-ink">{title}</ToastPrimitive.Title>
                    {description && <ToastPrimitive.Description className="mt-1 text-sm leading-6 text-muted">{description}</ToastPrimitive.Description>}
                </div>
                {onDismiss && (
                    <ToastPrimitive.Close asChild>
                        <button type="button" aria-label="بستن اعلان" className="rounded-sm px-2 py-1 text-muted hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus">
                            ×
                        </button>
                    </ToastPrimitive.Close>
                )}
            </ToastPrimitive.Root>
            <ToastPrimitive.Viewport
                data-ui="toast-viewport"
                label="اعلان‌ها"
                dir="rtl"
                className="fixed top-4 start-4 z-[100] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2 outline-none"
            />
        </ToastPrimitive.Provider>
    );
}


export function MediaImage({
    src,
    alt = '',
    className = '',
    imageClassName = '',
    loading = 'lazy',
    decoding = 'async',
    fetchPriority,
    width,
    height,
    variant,
}) {
    const imageSrc = src && variant
        ? `${src}${src.includes('?') ? '&' : '?'}variant=${encodeURIComponent(variant)}`
        : src;
    const [loadedSrc, setLoadedSrc] = useState(null);
    const [failedSrc, setFailedSrc] = useState(null);
    const loaded = Boolean(imageSrc) && loadedSrc === imageSrc;
    const failed = Boolean(imageSrc) && failedSrc === imageSrc;
    const unavailable = !imageSrc || failed;

    return (
        <span
            data-ui="media-image"
            className={`relative isolate block overflow-hidden bg-surface-muted ${unavailable ? 'min-h-32' : ''} ${className}`}
            aria-busy={!loaded && !unavailable}
        >
            {unavailable ? (
                <span
                    role={alt ? 'img' : 'status'}
                    aria-label={alt ? `${alt}: تصویر در دسترس نیست` : undefined}
                    className="absolute inset-0 grid min-h-32 place-items-center overflow-hidden bg-[radial-gradient(ellipse_at_18%_20%,color-mix(in_srgb,var(--color-line)_55%,transparent),transparent_42%),radial-gradient(ellipse_at_82%_78%,color-mix(in_srgb,var(--color-accent)_18%,transparent),transparent_45%),linear-gradient(135deg,var(--color-paper),var(--color-surface-muted))] text-center"
                >
                    <span aria-hidden="true" className="pointer-events-none absolute -end-8 -top-10 h-36 w-36 rounded-full border border-accent/20" />
                    <span aria-hidden="true" className="pointer-events-none absolute -start-10 -bottom-16 h-44 w-44 rounded-full border border-line/70" />
                    <span className="relative z-10 flex flex-col items-center gap-2 px-4 pb-10 text-sm font-semibold text-muted">
                        <span className="grid h-14 w-14 place-items-center rounded-full border border-accent/30 bg-paper/80 text-accent shadow-sm">
                            <ImageOff size={27} strokeWidth={1.5} aria-hidden="true" />
                        </span>
                        <span className="tracking-wide">تصویر در دسترس نیست</span>
                    </span>
                    <span
                        role="note"
                        className="absolute inset-x-0 bottom-0 z-20 flex items-start gap-2 border-t-2 border-danger bg-danger px-3 py-2 text-start text-[11px] font-medium leading-5 text-white shadow-lg"
                        dir="rtl"
                    >
                        <AlertTriangle size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
                        <span className="min-w-0">
                            <span className="block font-bold">خطا در نمایش تصویر</span>
                            <span className="block opacity-95">
                                {imageSrc
                                    ? 'فایل پیدا نشد یا دریافت آن ناموفق بود.'
                                    : 'نشانی تصویر ثبت نشده است.'}
                            </span>
                        </span>
                    </span>
                </span>
            ) : (
                <>
                    {!loaded && <span aria-hidden="true" className={`${skeletonClasses} absolute inset-0 h-full w-full rounded-none`} />}
                    <img
                        src={imageSrc}
                        alt={alt}
                        loading={loading}
                        decoding={decoding}
                        fetchpriority={fetchPriority}
                        width={width}
                        height={height}
                        onLoad={() => setLoadedSrc(imageSrc)}
                        onError={() => setFailedSrc(imageSrc)}
                        className={`absolute inset-0 block h-full w-full transition-opacity duration-200 ${loaded ? 'opacity-100' : 'opacity-0'} ${imageClassName}`}
                    />
                </>
            )}
        </span>
    );
}
