import { useState } from 'react';
import { Button } from './primitives';
import * as ToastPrimitive from '@radix-ui/react-toast';

const skeletonClasses = 'block bg-[linear-gradient(100deg,var(--color-skeleton-base)_25%,var(--color-skeleton-highlight)_42%,var(--color-skeleton-base)_62%)] [background-size:200%_100%] animate-skeleton-shimmer motion-reduce:animate-none';

export function Skeleton({ className = '', width, height = '1rem', rounded = 'md' }) {
    return (
        <span
            aria-hidden="true"
            className={`${skeletonClasses} ${rounded === 'full' ? 'rounded-full' : rounded === 'lg' ? 'rounded-lg' : 'rounded-md'} ${className}`}
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
        <section className={`grid justify-items-center gap-3 rounded-md border border-dashed border-border bg-surface px-5 py-10 text-center ${className}`} dir="rtl">
            <span aria-hidden="true" className="h-2 w-10 rounded-full bg-sand" />
            <h2 className="text-base font-bold text-ink">{title}</h2>
            {description && <p className="max-w-lg text-sm leading-7 text-muted">{description}</p>}
            {action}
        </section>
    );
}

export function ErrorState({ title = 'مشکلی پیش آمد', description, onRetry, retryLabel = 'تلاش دوباره', className = '' }) {
    return (
        <section role="alert" className={`grid justify-items-start gap-3 rounded-md border border-[color:color-mix(in_srgb,var(--color-danger)_30%,transparent)] bg-surface p-5 ${className}`} dir="rtl">
            <h2 className="font-bold text-danger">{title}</h2>
            {description && <p className="text-sm leading-7 text-muted">{description}</p>}
            {onRetry && <Button variant="outline" size="sm" onClick={onRetry}>{retryLabel}</Button>}
        </section>
    );
}

export function SuccessState({ title, description, className = '' }) {
    return (
        <div role="status" className={`rounded-md border border-border border-s-2 border-s-success bg-surface px-4 py-3 ${className}`} dir="rtl">
            <p className="font-semibold text-olive">{title}</p>
            {description && <p className="mt-1 text-sm leading-6 text-muted">{description}</p>}
        </div>
    );
}

export function PermissionState({ title = 'دسترسی مجاز نیست', description, className = '' }) {
    return (
        <section role="status" className={`rounded-md border border-border bg-surface-muted p-5 ${className}`} dir="rtl">
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

export function Toast({ open, title, description, variant = 'info', onDismiss, duration = Infinity }) {
    const [internalOpen, setInternalOpen] = useState(true);
    const isOpen = open ?? internalOpen;
    const variants = {
        success: 'border-s-success',
        error: 'border-s-danger',
        info: 'border-s-terracotta',
    };

    const handleOpenChange = (nextOpen) => {
        if (open === undefined) setInternalOpen(nextOpen);
        if (!nextOpen) onDismiss?.();
    };

    if (!isOpen) return null;

    return (
        <ToastPrimitive.Provider duration={duration}>
            <ToastPrimitive.Root
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
    fallback,
    variant,
}) {
    const imageSrc = src && variant
        ? `${src}${src.includes('?') ? '&' : '?'}variant=${encodeURIComponent(variant)}`
        : src;
    const [loadedSrc, setLoadedSrc] = useState(null);
    const [failedSrc, setFailedSrc] = useState(null);
    const loaded = Boolean(imageSrc) && loadedSrc === imageSrc;
    const failed = Boolean(imageSrc) && failedSrc === imageSrc;

    if (!imageSrc || failed) {
        return fallback ?? (
            <span
                role={alt ? 'img' : undefined}
                aria-label={alt || undefined}
                aria-hidden={alt ? undefined : 'true'}
                className={`grid place-items-center bg-surface-muted px-4 text-center text-sm text-muted ${className}`}
            >
                تصویر در دسترس نیست
            </span>
        );
    }

    return (
        <span className={`relative isolate block overflow-hidden bg-surface-muted ${className}`} aria-busy={!loaded}>
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
        </span>
    );
}
