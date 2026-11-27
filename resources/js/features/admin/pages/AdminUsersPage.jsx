import { useState } from 'react';
import { useLanguage } from '../../../shared/i18n';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from '../../../shared/api/httpClient';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../shared/auth';
import { Badge, Button, EmptyState, ErrorState, Pagination, SelectField, SuccessState, PageHeader } from '../../../shared/ui';
import { AdminUserCardsSkeleton } from '../components/skeletons';
import { api, roleLabels } from '../model/adminUtils';

export function AdminUsersPage() {
    const { t, locale } = useLanguage();
    const { user } = useAuth();
    const [params, setParams] = useSearchParams();
    const page = Math.max(1, Number(params.get('page')) || 1);
    const [drafts, setDrafts] = useState({});
    const [actionError, setActionError] = useState(''), [message, setMessage] = useState('');
    const [confirmAdminId, setConfirmAdminId] = useState(null);
    const queryClient = useQueryClient();
    const queryKey = ['admin', 'users', user?.id, page];
    const roleMutation = useMutation({
        mutationKey: ['admin', 'users', 'role', user?.id],
        mutationFn: ({ item, role }) => axios.patch(api + '/users/' + item.id + '/role', { role }),
    });
    const busyId = roleMutation.isPending ? roleMutation.variables?.item?.id ?? null : null;
    const usersQuery = useQuery({
        queryKey,
        queryFn: async ({ signal }) => {
            const { data } = await axios.get(api + '/users', { params: { page }, signal });
            return data;
        },
        enabled: user?.role === 'admin' && Boolean(user?.id),
    });
    const result = usersQuery.data;
    const loading = usersQuery.isPending;
    const load = () => { setActionError(''); return usersQuery.refetch(); };
    const error = actionError || (usersQuery.isError
        ? (usersQuery.error.response?.status === 403 ? t("این حساب اجازه مشاهده کاربران را ندارد.") : t("دریافت فهرست کاربران انجام نشد. دوباره تلاش کنید."))
        : '');
    const changePage = (next) => setParams(next > 1 ? { page: String(next) } : {});
    const updateRole = async (item) => {
        const role = drafts[item.id] ?? (item.role === 'buyer' ? '' : item.role);
        if (!['artist', 'admin'].includes(role)) { setActionError(t("یکی از نقش‌های پشتیبانی‌شده را انتخاب کنید.")); return; }
        if (role === 'admin' && item.role !== 'admin' && confirmAdminId !== item.id) {
            setConfirmAdminId(item.id);
            return;
        }
        setActionError(''); setMessage('');
        try {
            const { data } = await roleMutation.mutateAsync({ item, role });
            queryClient.setQueryData(queryKey, (current) => current ? { ...current, data: current.data.map((row) => row.id === item.id ? data.data : row) } : current);
            setDrafts((current) => { const next = { ...current }; delete next[item.id]; return next; });
            setConfirmAdminId(null);
            setMessage(t(data.message ?? "نقش کاربر به‌روزرسانی شد."));
        } catch (e) {
            setActionError(e.response?.status === 403 ? t("سرور اجازه تغییر نقش این حساب را نداد.") : t(e.response?.data?.errors?.role?.[0] ?? e.response?.data?.message ?? "تغییر نقش کاربر انجام نشد."));
        }
    };
    return <section className="min-w-0 mx-auto w-full max-w-content space-y-6">
        <PageHeader bleed={false} eyebrow={t("مدیریت حساب‌ها")} title={t("کاربران")} description={t("فهرست حساب‌ها و مدیریت نقش‌های مجاز. ارتقای هر حساب به مدیر، مرحله تأیید جداگانه دارد.")} actions={<Button variant="outline" size="sm" onClick={load} loading={loading}>{t("به‌روزرسانی")}</Button>} />
        <dl className="grid grid-cols-2 gap-4 border-y border-border py-4 sm:max-w-xl sm:gap-8"><div><dt className="text-xs text-muted">{t("حساب‌های این صفحه")}</dt><dd className="mt-1 text-2xl font-black tabular-nums">{result?.data?.length?.toLocaleString(locale === 'fa' ? 'fa-IR' : 'en-US') ?? '—'}</dd></div><div><dt className="text-xs text-muted">{t('کل حساب‌ها')}</dt><dd className="mt-1 text-2xl font-black tabular-nums">{result?.total?.toLocaleString(locale === 'fa' ? 'fa-IR' : 'en-US') ?? '—'}</dd></div></dl>
        <p className="border-s-2 border-sand py-2 pe-4 text-xs leading-7 text-muted">{t("نقش‌های قابل انتخاب «هنرمند» و «مدیر» هستند. ایجاد خریدار از مسیر ثبت‌نام انجام می‌شود و حذف یا تعلیق حساب پشتیبانی نمی‌شود. مدیر نمی‌تواند نقش مدیریتی حساب خودش را حذف کند.")}</p>
        {message && <SuccessState title={message} />}{error && <ErrorState title={t("عملیات انجام نشد")} description={error} onRetry={load} />}
        {loading ? <AdminUserCardsSkeleton count={4} /> : !result?.data?.length ? <EmptyState title={t("کاربری برای نمایش وجود ندارد")} /> : <>
            <div className="grid gap-x-6 gap-y-2 xl:grid-cols-2">{result.data.map((item) => {
                const selected = drafts[item.id] ?? (item.role === 'buyer' ? '' : item.role);
                const selfAdmin = item.id === user?.id && item.role === 'admin';
                const needsAdminConfirmation = confirmAdminId === item.id && selected === 'admin' && item.role !== 'admin';
                return <article key={item.id} className="min-w-0 border-t border-border bg-transparent py-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0"><p className="mb-1 text-[10px] font-bold tracking-wide text-muted">{t('حساب کاربری')} · {item.id}</p><h2 className="break-words font-bold">{item.name}</h2><p dir="ltr" className="mt-1 break-all text-start text-xs text-muted">{item.email}</p></div>
                        <Badge variant={item.role === 'admin' ? 'accent' : item.role === 'artist' ? 'info' : 'neutral'}>{t(roleLabels[item.role] ?? item.role)}</Badge>
                    </div>
                    <div className="mt-5 border-t border-border/70 pt-4">
                        {selfAdmin ? <p className="text-xs leading-6 text-muted">{t("این حساب مدیر فعلی است؛ تغییر نقش حساب خودتان از این صفحه امکان‌پذیر نیست.")}</p> : <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                            <SelectField aria-label={'نقش جدید برای ' + item.name} value={selected} disabled={busyId === item.id} onChange={(event) => { setDrafts((current) => ({ ...current, [item.id]: event.target.value })); setConfirmAdminId(null); }} className="w-full">
                                {item.role === 'buyer' && <option value="">{t("انتخاب نقش")}</option>}
                                <option value="artist">{t("هنرمند")}</option><option value="admin">{t("مدیر")}</option>
                            </SelectField>
                            <Button size="sm" variant="outline" disabled={busyId !== null || !selected || selected === item.role} loading={busyId === item.id} onClick={() => updateRole(item)}>{t("ثبت تغییر")}</Button>
                        </div>}
                        {needsAdminConfirmation && <div className="mt-4 border border-[color:color-mix(in_srgb,var(--color-warning)_30%,transparent)] bg-[color:color-mix(in_srgb,var(--color-warning)_5%,transparent)] p-3">
                            <p className="text-xs leading-6 text-ink">{t("این تغییر دسترسی مدیریتی می‌دهد و امکان مدیریت کاربران و محتوای سامانه را فعال می‌کند. آیا ارتقا را تأیید می‌کنید؟")}</p>
                            <div className="mt-3 flex flex-wrap gap-2"><Button size="sm" onClick={() => updateRole(item)} loading={busyId === item.id}>{t("تأیید ارتقا به مدیر")}</Button><Button size="sm" variant="ghost" onClick={() => setConfirmAdminId(null)} disabled={busyId !== null}>{t("انصراف")}</Button></div>
                        </div>}
                    </div>
                </article>;
            })}</div>
            <Pagination currentPage={result.current_page ?? page} lastPage={result.last_page ?? 1} onPageChange={changePage} disabled={loading || busyId !== null} />
        </>}
    </section>;
}
