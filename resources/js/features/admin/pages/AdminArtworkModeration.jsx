import { useState } from 'react';
import { useLanguage } from '../../../shared/i18n';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from '../../../shared/api/httpClient';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../shared/auth';
import { Badge, Button, EmptyState, ErrorState, FormField, Pagination, SuccessState, TextareaField, PageHeader, MediaImage } from '../../../shared/ui';
import { ArtworkModerationSkeleton } from '../components/skeletons';
import { localizedValue } from '../../../utils/localizedContent';
import { api, statuses, statusLabels, dateLabel } from '../model/adminUtils';

export function AdminArtworkModeration() {
    const { t, locale } = useLanguage();
    const [params, setParams] = useSearchParams();
    const { user } = useAuth();
    const status = statuses.some((item) => item.value === params.get('status')) ? params.get('status') : 'pending_review';
    const page = Math.max(1, Number(params.get('page')) || 1);
    const [notes, setNotes] = useState({});
    const [actionError, setActionError] = useState(''), [message, setMessage] = useState('');
    const queryClient = useQueryClient();
    const queryKey = ['admin', 'artworks', user?.id, status, page];
    const moderationMutation = useMutation({
        mutationKey: ['admin', 'artworks', 'moderate', user?.id],
        mutationFn: ({ artwork, action, note }) => axios.patch(api + '/artworks/' + artwork.id + '/moderation', { action, ...(action === 'approve' ? {} : { note }) }),
    });
    const busyId = moderationMutation.isPending ? moderationMutation.variables?.artwork?.id ?? null : null;
    const artworksQuery = useQuery({
        queryKey,
        queryFn: async ({ signal }) => {
            const { data } = await axios.get(api + '/artworks', { params: { status, page }, signal });
            return data;
        },
        enabled: user?.role === 'admin' && Boolean(user?.id),
    });
    const result = artworksQuery.data;
    const loading = artworksQuery.isPending;
    const load = () => { setActionError(''); return artworksQuery.refetch(); };
    const error = actionError || (artworksQuery.isError
        ? (artworksQuery.error.response?.status === 403 ? t("این حساب اجازه مشاهده صف بررسی آثار را ندارد.") : t("دریافت آثار انجام نشد. دوباره تلاش کنید."))
        : '');
    const chooseStatus = (value) => { setActionError(''); setMessage(''); setParams(value === 'pending_review' ? {} : { status: value }); };
    const changePage = (next) => setParams({ ...(status !== 'pending_review' ? { status } : {}), ...(next > 1 ? { page: String(next) } : {}) });
    const moderate = async (artwork, action) => {
        const note = (notes[artwork.id] ?? '').trim();
        if (action !== 'approve' && !note) { setActionError(t("برای رد اثر یا درخواست اصلاح، نوشتن توضیح الزامی است.")); return; }
        setActionError(''); setMessage('');
        try {
            const { data } = await moderationMutation.mutateAsync({ artwork, action, note });
            setMessage(t(data.message ?? "تصمیم ثبت شد.")); setNotes((current) => ({ ...current, [artwork.id]: '' })); await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['admin', 'artworks', user?.id] }),
                queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard', user?.id] }),
                queryClient.invalidateQueries({ queryKey: ['artist-workspace', 'artworks'] }),
                queryClient.invalidateQueries({ queryKey: ['home', 'artworks'] }),
                queryClient.invalidateQueries({ queryKey: ['artworks'] }),
            ]);
        } catch (e) { setActionError(e.response?.status === 403 ? t("سرور اجازه انجام این عملیات را نداد.") : t(e.response?.data?.errors?.note?.[0] ?? e.response?.data?.message ?? "ثبت تصمیم انجام نشد.")); }
    };
    return <section className="min-w-0 mx-auto w-full max-w-content space-y-6">
        <PageHeader bleed={false} eyebrow={t("مدیریت آثار")} title={t("صف بررسی و انتشار")} description={t("فقط آثار در انتظار بررسی قابل تصمیم‌گیری‌اند. رد اثر یا درخواست اصلاح به توضیح نیاز دارد.")} actions={<Button variant="outline" size="sm" onClick={load} loading={loading}>{t("به‌روزرسانی")}</Button>} />
        <nav className="flex flex-wrap gap-x-5 gap-y-2 border-b border-border" aria-label={t("فیلتر وضعیت آثار")}>{statuses.map((item) => <Button variant="ghost" key={item.value} type="button" aria-pressed={status === item.value} onClick={() => chooseStatus(item.value)} className={"min-h-11 border-b-2 px-1 text-sm font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus motion-reduce:transition-none " + (status === item.value ? 'border-terracotta text-terracotta-strong' : 'border-transparent text-muted hover:border-border-strong hover:text-ink')}>{t(item.label)}</Button>)}</nav>
        {message && <SuccessState title={message} />}{error && <ErrorState title={t("عملیات انجام نشد")} description={error} onRetry={load} />}
        {loading ? <ArtworkModerationSkeleton count={4} /> : !result?.data?.length ? <EmptyState title={t("اثری در این وضعیت وجود ندارد")} description={t("با انتخاب وضعیت دیگر می‌توانید سوابق تصمیم‌ها را مرور کنید.")} /> : <>
            <div className="grid gap-x-6 gap-y-8 xl:grid-cols-2">{result.data.map((artwork) => {
                const actionable = artwork.status === 'pending_review';
                return <article key={artwork.id} className="min-w-0 border-y border-ink bg-transparent py-4">
                    <div className="grid sm:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)]"><div className="aspect-artwork overflow-hidden bg-surface-muted p-3 sm:aspect-artwork"><MediaImage src={artwork.image_url} alt={t('تصویر اثر ') + localizedValue(artwork, 'title', locale)} className="h-56 w-full sm:h-full sm:min-h-64" imageClassName="object-contain" loading="lazy" decoding="async" /></div>
                        <div className="min-w-0 py-4 sm:px-1"><div className="flex flex-wrap items-start justify-between gap-2"><h2 className="font-bold">{localizedValue(artwork, 'title', locale)}</h2><Badge variant={artwork.status === 'approved' ? 'success' : artwork.status === 'rejected' ? 'danger' : artwork.status === 'pending_review' ? 'warning' : 'info'} >{t(statusLabels[artwork.status] ?? artwork.status)}</Badge></div>
                            <p className="mt-2 text-xs text-muted">{localizedValue(artwork.artist, 'display_name', locale) || '—'} · {localizedValue(artwork.category, 'name', locale) || '—'}</p>
                            <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">{artwork.medium && <div><dt className="text-muted">{t("تکنیک")}</dt><dd className="mt-1 font-semibold">{t(artwork.medium)}</dd></div>}{artwork.dimensions && <div><dt className="text-muted">{t("ابعاد")}</dt><dd className="mt-1 font-semibold">{artwork.dimensions}</dd></div>}{artwork.year && <div><dt className="text-muted">{t("سال")}</dt><dd className="mt-1 font-semibold">{artwork.year}</dd></div>}<div><dt className="text-muted">{t("تاریخ ثبت")}</dt><dd className="mt-1 font-semibold">{dateLabel(artwork.created_at, locale)}</dd></div></dl>
                            {localizedValue(artwork, 'description', locale) && <p className="mt-4 line-clamp-4 text-sm leading-7 text-muted">{localizedValue(artwork, 'description', locale)}</p>}{artwork.rejection_note && <p className="mt-3 border-s-2 border-sand bg-surface-muted p-3 text-xs leading-6 text-muted">{t('یادداشت ثبت‌شده:')} {t(artwork.rejection_note)}</p>}
                        </div>
                    </div>
                    {actionable && <div className="mt-4 border-t border-border py-5 sm:px-1"><FormField label={t("توضیح برای هنرمند")} hint={t("برای رد اثر یا درخواست اصلاح الزامی است؛ حداکثر ۲۰۰۰ نویسه.")}><TextareaField value={notes[artwork.id] ?? ''} onChange={(event) => setNotes((current) => ({ ...current, [artwork.id]: event.target.value }))} maxLength={2000} rows={3} /></FormField><div className="mt-4 flex flex-wrap gap-2"><Button size="sm" onClick={() => moderate(artwork, 'approve')} loading={busyId === artwork.id} disabled={busyId !== null}>{t('تأیید و انتشار')}</Button><Button size="sm" variant="outline" onClick={() => moderate(artwork, 'request_changes')} disabled={busyId !== null}>{t('درخواست اصلاح')}</Button><Button size="sm" variant="danger" onClick={() => moderate(artwork, 'reject')} disabled={busyId !== null}>{t('رد اثر')}</Button></div></div>}
                </article>;
            })}</div>
            <Pagination currentPage={result.current_page ?? page} lastPage={result.last_page ?? 1} onPageChange={changePage} disabled={loading || busyId !== null} /><p className="text-center text-xs text-muted">{result.total ?? result.data.length} {t('اثر در این فهرست')}</p>
        </>}
    </section>;
}
