import { LoaderCircle } from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { Button } from '../components/ui';

export default function MessagingStatusBanners
    const { t } = useLanguage();({
    notice,
    error,
    inboxError,
    directStartLoading,
    directStartError,
    onRetryInbox,
    onRetryDirectStart,
}) {
    return (
        <>
            {notice && <p role="status" className="rounded-md border border-border bg-surface-muted p-3 text-sm">{notice}</p>}
            {error && <p role="alert" className="rounded-md border border-[color:color-mix(in_srgb,var(--color-danger)_30%,transparent)] bg-danger-surface p-3 text-sm text-danger">{error}</p>}
            {inboxError && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-[color:color-mix(in_srgb,var(--color-danger)_30%,transparent)] bg-danger-surface p-3 text-sm text-danger"><span>{'دریافت گفتگوها انجام نشد. دوباره تلاش کنید.'}</span><Button variant="ghost" type="button" onClick={onRetryInbox} className="shrink-0 font-bold underline underline-offset-4">{t("تلاش دوباره")}</Button></div>}
            {directStartLoading && <div role="status" className="flex items-center gap-3 rounded-md border border-border bg-surface-muted p-3 text-sm text-muted"><LoaderCircle size={16} className="animate-spin" aria-hidden="true" />در حال آماده‌سازی گفتگوی مستقیم و اتصال آن به اثر…</div>}
            {directStartError && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-[color:color-mix(in_srgb,var(--color-danger)_30%,transparent)] bg-danger-surface p-3 text-sm text-ink"><span>{directStartError}</span><Button variant="ghost" type="button" onClick={onRetryDirectStart} className="shrink-0 font-bold text-terracotta-strong underline underline-offset-4">{t("تلاش دوباره")}</Button></div>}
        </>
    );
}
