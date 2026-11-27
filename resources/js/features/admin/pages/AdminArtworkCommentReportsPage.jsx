import { useState } from 'react';
import { useLanguage } from '../../../shared/i18n';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from '../../../shared/api/httpClient';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../shared/auth';
import { Badge, Button, EmptyState, ErrorState, FormField, Pagination, SuccessState, TextareaField, PageHeader } from '../../../shared/ui';
import { MessageReportsSkeleton } from '../components/skeletons';
import { localizedValue } from '../../../utils/localizedContent';
import { api, dateLabel } from '../model/adminUtils';

export function AdminArtworkCommentReportsPage() {
    const { t, locale } = useLanguage();
    const { user } = useAuth();
    const [params, setParams] = useSearchParams();
    const page = Math.max(1, Number(params.get('page')) || 1);
    const [notes, setNotes] = useState({});
    const [confirmRemovalId, setConfirmRemovalId] = useState(null);
    const [actionError, setActionError] = useState('');
    const [message, setMessage] = useState('');
    const queryClient = useQueryClient();
    const queryKey = ['admin', 'artwork-comment-reports', user?.id, page];

    const reportsQuery = useQuery({
        queryKey,
        queryFn: async ({ signal }) => {
            const { data } = await axios.get(api + '/artwork-comment-reports', { params: { page }, signal });
            return data;
        },
        enabled: user?.role === 'admin' && Boolean(user?.id),
    });
    const reviewMutation = useMutation({
        mutationKey: ['admin', 'artwork-comment-reports', 'review', user?.id],
        mutationFn: ({ report, action, note }) => axios.patch(api + '/artwork-comment-reports/' + report.id, { action, note }),
    });

    const result = reportsQuery.data;
    const busyId = reviewMutation.isPending ? reviewMutation.variables?.report?.id ?? null : null;
    const loading = reportsQuery.isPending;
    const load = () => { setActionError(''); return reportsQuery.refetch(); };
    const error = actionError || (reportsQuery.isError
        ? (reportsQuery.error.response?.status === 403 ? t("دسترسی به گزارش‌های دیدگاه مجاز نیست.") : t("دریافت گزارش‌ها انجام نشد."))
        : '');

    const review = async (report, action) => {
        if (action === 'remove_comment' && confirmRemovalId !== report.id) {
            setConfirmRemovalId(report.id);
            return;
        }

        setActionError('');
        setMessage('');
        try {
            const { data } = await reviewMutation.mutateAsync({
                report,
                action,
                note: (notes[report.id] ?? '').trim() || null,
            });
            setMessage(data.message ?? t("تصمیم ثبت شد."));
            setConfirmRemovalId(null);
            setNotes((current) => {
                const next = { ...current };
                delete next[report.id];
                return next;
            });
            await queryClient.invalidateQueries({ queryKey: ['admin', 'artwork-comment-reports', user?.id] });
        } catch (e) {
            setActionError(t(e.response?.data?.message ?? "ثبت تصمیم انجام نشد."));
        }
    };

    return <section className="min-w-0 mx-auto w-full max-w-content space-y-6">
        <PageHeader bleed={false}
            eyebrow={t("اعتماد و ایمنی محتوا")}
            title={t("گزارش دیدگاه‌های آثار")}
            description={t("گزارش‌ها را با توجه به متن دیدگاه و زمینه اثر بررسی کنید. حذف دیدگاه پس از تأیید نهایی انجام می‌شود و سابقه رسیدگی ثبت خواهد شد.")}
            actions={<Button variant="outline" size="sm" onClick={load} loading={loading}>{t("به‌روزرسانی")}</Button>}
        />
        <div className="grid gap-3 sm:grid-cols-2">
            <div className="border border-border bg-paper p-4">
                <p className="text-xs text-muted">{t("گزارش‌های این صفحه")}</p>
                <p className="mt-2 text-2xl font-black tabular-nums">{result?.data?.length?.toLocaleString(locale === 'fa' ? 'fa-IR' : 'en-US') ?? '—'}</p>
            </div>
            <div className="border border-border bg-paper p-4">
                <p className="text-xs text-muted">{t("کل گزارش‌ها")}</p>
                <p className="mt-2 text-2xl font-black tabular-nums">{result?.total?.toLocaleString(locale === 'fa' ? 'fa-IR' : 'en-US') ?? '—'}</p>
            </div>
        </div>
        {message && <SuccessState title={message} />}
        {error && <ErrorState title={t("عملیات انجام نشد")} description={error} onRetry={load} />}
        {loading ? <MessageReportsSkeleton count={3} /> : !result?.data?.length ? (
            <EmptyState title={t("گزارشی برای نمایش وجود ندارد")} description={t("گزارش دیدگاه‌های آثار پس از ثبت در این بخش نمایش داده می‌شوند.")} />
        ) : <>
            <div className="space-y-4">
                {result.data.map((report) => {
                    const isOpen = report.status === 'open';
                    const confirmingRemoval = confirmRemovalId === report.id;
                    return <article key={report.id} className="overflow-hidden border-t border-border bg-transparent pt-1">
                        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border py-5">
                            <div>
                                <p className="text-xs font-bold text-terracotta-strong" >{t('گزارش شماره')} {report.id}</p>
                                <h2 className="mt-1 font-black">{report.reason}</h2>
                                <p className="mt-2 text-xs text-muted">گزارش‌دهنده: {report.reporter?.name ?? t("کاربر")} · {dateLabel(report.created_at, locale)}</p>
                            </div>
                            <Badge variant={isOpen ? 'warning' : report.status === 'dismissed' ? 'neutral' : 'success'}>
                                {isOpen ? t("در انتظار بررسی") : report.status === 'dismissed' ? t("رد گزارش") : t("بررسی‌شده")}
                            </Badge>
                        </div>
                        <div className="space-y-5 py-5">
                            {report.details && <div>
                                <p className="text-xs font-bold text-muted">{t("شرح گزارش")}</p>
                                <p className="mt-2 whitespace-pre-line break-words text-sm leading-7">{report.details}</p>
                            </div>}
                            <div className="border-s-2 border-terracotta bg-surface-muted/50 p-4 sm:p-5">
                                <p className="text-[11px] font-bold text-muted">{t("دیدگاه گزارش‌شده")}</p>
                                <blockquote className="mt-2 whitespace-pre-line break-words text-sm leading-7">{report.comment?.body ?? t("متن دیدگاه حذف شده است.")}</blockquote>
                                <p className="mt-2 text-xs text-muted" >{t('نویسنده:')} {report.comment?.author ?? t("کاربر")}</p>
                                {report.comment?.artwork?.slug && <Link to={'/artworks/' + report.comment.artwork.slug + '#comment-' + report.comment.id} className="mt-2 inline-block text-xs font-bold text-terracotta-strong underline">{localizedValue(report.comment.artwork, 'title', locale) || t("مشاهده اثر")}</Link>}
                            </div>
                            {isOpen && <>
                                <FormField label={t("یادداشت رسیدگی (اختیاری)")}><TextareaField value={notes[report.id] ?? ''} onChange={(event) => setNotes((current) => ({ ...current, [report.id]: event.target.value }))} maxLength={1000} rows={2} placeholder={t("خلاصه تصمیم یا زمینه بررسی…")} /></FormField>
                                <div className="flex flex-wrap gap-2">
                                    <Button size="sm" variant="primary" disabled={busyId !== null} loading={busyId === report.id} onClick={() => review(report, 'reviewed')}>{t("ثبت بررسی")}</Button>
                                    <Button size="sm" variant="outline" disabled={busyId !== null} onClick={() => review(report, 'dismissed')}>{t("رد گزارش")}</Button>
                                    <Button size="sm" variant="danger" disabled={busyId !== null} onClick={() => review(report, 'remove_comment')}>{t("حذف دیدگاه")}</Button>
                                </div>
                                {confirmingRemoval && <div className="border border-danger/30 bg-danger-surface p-4">
                                    <p className="text-sm font-bold text-ink">{t("حذف دیدگاه را تأیید می‌کنید؟")}</p>
                                    <p className="mt-1 text-xs leading-6 text-muted">{t("متن دیدگاه برای کاربران پنهان می‌شود و اقدام در سابقه رسیدگی ثبت خواهد شد.")}</p>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        <Button size="sm" variant="danger" disabled={busyId !== null} loading={busyId === report.id} onClick={() => review(report, 'remove_comment')}>{t("بله، حذف دیدگاه")}</Button>
                                        <Button size="sm" variant="ghost" disabled={busyId !== null} onClick={() => setConfirmRemovalId(null)}>{t("انصراف")}</Button>
                                    </div>
                                </div>}
                            </>}
                        </div>
                    </article>;
                })}
            </div>
            <Pagination
                currentPage={result.current_page ?? page}
                lastPage={result.last_page ?? 1}
                onPageChange={(next) => { setConfirmRemovalId(null); setParams(next > 1 ? { page: String(next) } : {}); }}
                disabled={loading || busyId !== null}
            />
        </>}
    </section>;
}
