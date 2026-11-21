import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from './AuthContext';
import {
    Badge, Button, EmptyState, ErrorState, FormField, MediaImage,
    PageHeader, Pagination, SuccessState, TextareaField,
} from '../components/ui';

const api = '/api/v1/admin';
const moderationStatuses = [
    { value: 'pending_review', label: 'در انتظار بررسی', variant: 'warning' },
    { value: 'approved', label: 'تأییدشده', variant: 'success' },
    { value: 'changes_requested', label: 'نیازمند اصلاح', variant: 'info' },
    { value: 'rejected', label: 'ردشده', variant: 'danger' },
    { value: 'unavailable', label: 'فعلاً قابل بررسی نیست', variant: 'neutral' },
];
const statusByValue = Object.fromEntries(moderationStatuses.map((item) => [item.value, item]));
const sourceLabels = { native: 'ثبت‌شده در رادمن', instagram: 'منبع اینستاگرام' };
const publicationLabels = { draft: 'پیش‌نویس', published: 'منتشرشده', archived: 'بایگانی‌شده' };
const dateLabel = (value) => {
    if (!value) return '—';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('fa-IR', { dateStyle: 'medium' });
};

export default function AdminContentModeration() {
    const [params, setParams] = useSearchParams();
    const { user } = useAuth();
    const status = statusByValue[params.get('status')] ? params.get('status') : 'pending_review';
    const page = Math.max(1, Number(params.get('page')) || 1);
    const [notes, setNotes] = useState({});
    const [actionError, setActionError] = useState('');
    const [message, setMessage] = useState('');
    const queryClient = useQueryClient();
    const queryKey = ['admin', 'contents', user?.id, status, page];
    const contentsQuery = useQuery({
        queryKey,
        queryFn: async ({ signal }) => {
            const { data } = await axios.get(api + '/contents', {
                params: { moderation_status: status, page },
                signal,
            });
            return data;
        },
        enabled: user?.role === 'admin' && Boolean(user?.id),
    });
    const moderationMutation = useMutation({
        mutationKey: ['admin', 'contents', 'moderate', user?.id],
        mutationFn: ({ content, action, note }) => axios.patch(api + '/contents/' + content.id + '/moderation', {
            action,
            ...(action === 'approve' ? {} : { note }),
        }),
    });
    const busyId = moderationMutation.isPending ? moderationMutation.variables?.content?.id ?? null : null;
    const result = contentsQuery.data;
    const loading = contentsQuery.isPending;
    const load = () => {
        setActionError('');
        return contentsQuery.refetch();
    };
    const error = actionError || (contentsQuery.isError
        ? (contentsQuery.error.response?.status === 403
            ? 'این حساب اجازه مشاهده کتابخانه محتوای هنرمندان را ندارد.'
            : 'دریافت محتوای هنرمندان انجام نشد. دوباره تلاش کنید.')
        : '');

    const chooseStatus = (value) => {
        setActionError('');
        setMessage('');
        setParams(value === 'pending_review' ? {} : { status: value });
    };
    const changePage = (next) => setParams({
        ...(status !== 'pending_review' ? { status } : {}),
        ...(next > 1 ? { page: String(next) } : {}),
    });

    const moderate = async (content, action) => {
        const note = (notes[content.id] ?? '').trim();
        if (action !== 'approve' && !note) {
            setActionError('برای رد محتوا یا درخواست اصلاح، نوشتن توضیح الزامی است.');
            return;
        }

        setActionError('');
        setMessage('');
        try {
            const { data } = await moderationMutation.mutateAsync({ content, action, note });
            setMessage(data.message ?? 'تصمیم ثبت شد.');
            setNotes((current) => ({ ...current, [content.id]: '' }));
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['admin', 'contents', user?.id] }),
                queryClient.invalidateQueries({ queryKey: ['admin', 'artworks', user?.id] }),
                queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard', user?.id] }),
                queryClient.invalidateQueries({ queryKey: ['artist-workspace', 'artworks'] }),
                queryClient.invalidateQueries({ queryKey: ['artworks'] }),
            ]);
        } catch (e) {
            setActionError(e.response?.status === 403
                ? 'سرور اجازه انجام این عملیات را نداد.'
                : e.response?.data?.errors?.note?.[0] ?? e.response?.data?.message ?? 'ثبت تصمیم انجام نشد.');
        }
    };

    return (
        <section className="space-y-6" dir="rtl">
            <PageHeader
                eyebrow="حاکمیت محتوای رادمن"
                title="بررسی کتابخانه محتوا"
                description="محتوای ثبت‌شده در رادمن را از یک صف یکپارچه بررسی کنید. وضعیت تأیید هنرمند و انتشار، جدا از تصمیم نظارتی مدیر نمایش داده می‌شوند."
                actions={<Button variant="outline" size="sm" onClick={load} loading={loading}>به‌روزرسانی</Button>}
            />
            <div className="flex flex-wrap gap-2" aria-label="فیلتر وضعیت نظارت محتوا">
                {moderationStatuses.map((item) => (
                    <Button
                        key={item.value}
                        size="sm"
                        variant={status === item.value ? 'primary' : 'outline'}
                        aria-pressed={status === item.value}
                        onClick={() => chooseStatus(item.value)}
                    >
                        {item.label}
                    </Button>
                ))}
            </div>
            <p className="border-s-2 border-sand bg-surface-muted p-4 text-xs leading-7 text-muted">
                محتوای متصل به اثر از همان چرخه بررسی آثار استفاده می‌کند. محتوای بدون اثر قابل بررسی یا محتوای منبع خارجی تا زمان فراهم‌شدن مسیر مجاز، فقط با وضعیت «قابل بررسی نیست» نمایش داده می‌شود.
            </p>
            {message && <SuccessState title={message} />}
            {error && <ErrorState title="عملیات انجام نشد" description={error} onRetry={load} />}
            {loading ? (
                <div className="grid gap-4 xl:grid-cols-2" aria-label="در حال دریافت محتوا">
                    {[0, 1, 2, 3].map((item) => <div key={item} className="h-64 animate-pulse border border-border bg-surface-muted" />)}
                </div>
            ) : !result?.data?.length ? (
                <EmptyState title="محتوایی در این وضعیت وجود ندارد" description="با انتخاب وضعیت دیگر می‌توانید محتوای بیشتری را مرور کنید." />
            ) : (
                <>
                    <div className="grid gap-4 xl:grid-cols-2">
                        {result.data.map((content) => {
                            const statusInfo = statusByValue[content.moderation_status] ?? statusByValue.unavailable;
                            const actionable = content.moderation_status === 'pending_review' && content.source === 'native';
                            return (
                                <article key={content.id} className="overflow-hidden border border-border bg-paper">
                                    <div className="grid sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
                                        <div className="min-h-48 bg-surface-muted">
                                            {content.image_url ? (
                                                <MediaImage
                                                    src={content.image_url}
                                                    alt={'تصویر محتوای ' + (content.title ?? 'هنرمند')}
                                                    className="h-56 w-full sm:h-full sm:min-h-64"
                                                    imageClassName="object-cover"
                                                    loading="lazy"
                                                    decoding="async"
                                                />
                                            ) : (
                                                <div className="grid h-full min-h-48 place-items-center p-5 text-center text-xs leading-6 text-muted">
                                                    تصویر یا اثر قابل بررسی در دسترس نیست
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0 p-5">
                                            <div className="flex flex-wrap items-start justify-between gap-2">
                                                <h2 className="break-words font-bold">{content.title || 'بدون عنوان'}</h2>
                                                <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                                            </div>
                                            <p className="mt-2 text-xs text-muted">
                                                {content.artist?.display_name ?? 'هنرمند نامشخص'} · {sourceLabels[content.source] ?? 'منبع نامشخص'}
                                            </p>
                                            <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
                                                <div><dt className="text-muted">وضعیت انتشار</dt><dd className="mt-1 font-semibold">{publicationLabels[content.publication_status] ?? '—'}</dd></div>
                                                <div><dt className="text-muted">تأیید هنرمند</dt><dd className="mt-1 font-semibold">{content.artist_approved_at ? 'تأیید شده' : 'تأیید نشده'}</dd></div>
                                                {content.category?.name && <div><dt className="text-muted">دسته‌بندی</dt><dd className="mt-1 font-semibold">{content.category.name}</dd></div>}
                                                <div><dt className="text-muted">تاریخ ثبت</dt><dd className="mt-1 font-semibold">{dateLabel(content.created_at)}</dd></div>
                                            </dl>
                                            {content.description && <p className="mt-4 line-clamp-4 break-words text-sm leading-7 text-muted">{content.description}</p>}
                                            {content.rejection_note && <p className="mt-3 border-s-2 border-sand bg-surface-muted p-3 text-xs leading-6 text-muted">یادداشت ثبت‌شده: {content.rejection_note}</p>}
                                            {statusInfo.value === 'unavailable' && <p className="mt-3 text-xs leading-6 text-muted">این رکورد هنوز به محتوای بومی قابل بررسی متصل نیست؛ هیچ داده خصوصی منبع خارجی در این نما ارائه نمی‌شود.</p>}
                                        </div>
                                    </div>
                                    {actionable && (
                                        <div className="border-t border-border p-5">
                                            <FormField label="توضیح برای هنرمند" hint="برای رد محتوا یا درخواست اصلاح الزامی است؛ حداکثر ۲۰۰۰ نویسه.">
                                                <TextareaField
                                                    value={notes[content.id] ?? ''}
                                                    onChange={(event) => setNotes((current) => ({ ...current, [content.id]: event.target.value }))}
                                                    maxLength={2000}
                                                    rows={3}
                                                />
                                            </FormField>
                                            <div className="mt-4 flex flex-wrap gap-2">
                                                <Button size="sm" onClick={() => moderate(content, 'approve')} loading={busyId === content.id} disabled={busyId !== null}>تأیید</Button>
                                                <Button size="sm" variant="outline" onClick={() => moderate(content, 'request_changes')} disabled={busyId !== null}>درخواست اصلاح</Button>
                                                <Button size="sm" variant="danger" onClick={() => moderate(content, 'reject')} disabled={busyId !== null}>رد محتوا</Button>
                                            </div>
                                        </div>
                                    )}
                                </article>
                            );
                        })}
                    </div>
                    <Pagination currentPage={result.current_page ?? page} lastPage={result.last_page ?? 1} onPageChange={changePage} disabled={loading || busyId !== null} />
                    <p className="text-center text-xs text-muted">{result.total ?? result.data.length} رکورد در این فهرست</p>
                </>
            )}
        </section>
    );
}
