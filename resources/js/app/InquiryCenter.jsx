import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { EmptyState, ErrorState, SkeletonLines, Badge, Button } from '../components/ui';

const statusLabels = { new: 'جدید', read: 'خوانده‌شده', archived: 'بایگانی‌شده' };

export default function InquiryCenter({ user, hasProfile }) {
    const isArtist = user?.role === 'artist';
    const endpoint = isArtist ? '/api/v1/artist/inquiries' : '/api/v1/buyer/inquiries';
    const [items, setItems] = useState([]);
    const [selected, setSelected] = useState(null);
    const [nextPage, setNextPage] = useState(null);
    const [previousPage, setPreviousPage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);
    const [busyId, setBusyId] = useState(null);
    const [error, setError] = useState('');
    const [detailError, setDetailError] = useState('');
    const listController = useRef(null);
    const detailController = useRef(null);

    const load = useCallback(async (url = endpoint) => {
        listController.current?.abort();
        const controller = new AbortController();
        listController.current = controller;
        setLoading(true);
        setError('');
        try {
            const { data } = await axios.get(url, { signal: controller.signal });
            const rows = data.data ?? [];
            setItems(rows);
            setNextPage(data.next_page_url ?? null);
            setPreviousPage(data.prev_page_url ?? null);
            setSelected((current) => rows.find((item) => item.id === current?.id) ?? rows[0] ?? null);
        } catch (requestError) {
            if (axios.isCancel(requestError)) return;
            setError(requestError.response?.status === 403
                ? 'این حساب اجازه مشاهده این صندوق را ندارد.'
                : 'دریافت درخواست‌ها انجام نشد. دوباره تلاش کنید.');
        } finally {
            if (listController.current === controller) {
                listController.current = null;
                setLoading(false);
            }
        }
    }, [endpoint]);

    const loadDetail = useCallback(async (item) => {
        detailController.current?.abort();
        const controller = new AbortController();
        detailController.current = controller;
        setSelected(item);
        setDetailLoading(true);
        setDetailError('');
        try {
            const { data } = await axios.get(endpoint + '/' + item.id, { signal: controller.signal });
            setSelected(data.data);
        } catch (requestError) {
            if (axios.isCancel(requestError)) return;
            setDetailError(requestError.response?.status === 403
                ? 'دسترسی به این درخواست مجاز نیست.'
                : 'جزئیات درخواست دریافت نشد.');
        } finally {
            if (detailController.current === controller) {
                detailController.current = null;
                setDetailLoading(false);
            }
        }
    }, [endpoint]);

    useEffect(() => {
        if (user?.role === 'buyer' || (isArtist && hasProfile)) load();
        return () => {
            listController.current?.abort();
            detailController.current?.abort();
        };
    }, [hasProfile, isArtist, load, user?.role]);

    const updateStatus = async (item, status) => {
        setBusyId(item.id);
        setError('');
        try {
            const { data } = await axios.patch('/api/v1/artist/inquiries/' + item.id, { status });
            setItems((current) => current.map((entry) => entry.id === item.id ? data.data : entry));
            setSelected(data.data);
        } catch (requestError) {
            setError(requestError.response?.status === 403
                ? 'سرور اجازه تغییر وضعیت این درخواست را نداد.'
                : 'به‌روزرسانی وضعیت درخواست انجام نشد.');
        } finally {
            setBusyId(null);
        }
    };

    if ((!isArtist && user?.role !== 'buyer') || (isArtist && !hasProfile)) return null;

    return (
        <section className="space-y-6" dir="rtl">
            <header>
                <p className="text-sm font-bold text-terracotta-strong">{isArtist ? 'ارتباط با مخاطبان' : 'پیام‌های ارسال‌شده'}</p>
                <h1 className="mt-2 text-2xl font-black">{isArtist ? 'صندوق درخواست‌ها' : 'پیگیری درخواست‌ها'}</h1>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{isArtist ? 'درخواست‌های دریافتی را بخوانید و وضعیت رسیدگی را ثبت کنید. اطلاعات تماس خصوصی در این بخش نمایش داده نمی‌شود.' : 'جزئیات و وضعیت درخواست‌هایی را که برای هنرمندان فرستاده‌اید مشاهده کنید.'}</p>
                {isArtist && <p className="mt-3 border-s-2 border-border bg-muted px-4 py-3 text-xs leading-6 text-muted-foreground">«جدید» یعنی هنوز وضعیت رسیدگی ثبت نشده؛ «خوانده‌شده» یعنی درخواست را بررسی کرده‌اید؛ «بایگانی‌شده» یعنی آن را از صندوق فعال خارج کرده‌اید. این وضعیت‌ها پاسخ یا اعلان برای فرستنده ارسال نمی‌کنند.</p>}
            </header>

            {error && <ErrorState title="عملیات انجام نشد" description={error} />}
            {loading ? <SkeletonLines lines={6} /> : items.length === 0 ? (
                <EmptyState
                    title={isArtist ? 'هنوز درخواستی دریافت نکرده‌اید' : 'هنوز درخواستی ارسال نکرده‌اید'}
                    description={isArtist ? 'درخواست‌های ارسال‌شده از طریق پروفایل عمومی شما در اینجا نمایش داده می‌شوند.' : 'از صفحه هنرمندان یا جزئیات یک اثر می‌توانید درخواست ارتباطی ارسال کنید.'}
                    action={isArtist
                        ? <Link to="/dashboard/artist/profile" className="text-sm font-bold text-terracotta-strong underline">بررسی و به‌روزرسانی پروفایل هنری</Link>
                        : <Link to="/artists" className="text-sm font-bold text-terracotta-strong underline">مشاهده هنرمندان</Link>}
                />
            ) : (
                <div className="grid gap-4 lg:grid-cols-[minmax(260px,0.85fr)_minmax(0,1.5fr)]">
                    <nav aria-label={isArtist ? 'فهرست درخواست‌های دریافتی' : 'فهرست درخواست‌های ارسالی'} className="min-w-0 border border-border bg-card">
                        <ul className="divide-y divide-border">
                            {items.map((item) => (
                                <li key={item.id}>
                                    <Button type="button" onClick={() => loadDetail(item)} aria-current={selected?.id === item.id ? 'true' : undefined} variant="ghost" size="default">
                                        <span className="flex items-start justify-between gap-2"><span className="min-w-0 truncate text-sm font-bold text-foreground">{item.subject}</span><Badge variant={item.status === 'new' ? 'accent' : item.status === 'archived' ? 'neutral' : 'success'}>{statusLabels[item.status] ?? item.status}</Badge></span>
                                        <span className="mt-2 block text-xs text-muted-foreground">{isArtist ? item.buyer?.name : item.artist?.display_name}</span>
                                        <span className="mt-1 block text-xs text-muted-foreground">{new Date(item.created_at).toLocaleDateString('fa-IR')}</span>
                                    </Button>
                                </li>
                            ))}
                        </ul>
                        <div className="flex items-center justify-between gap-2 border-t border-border p-3">
                            <Button size="sm" variant="outline" disabled={!previousPage || loading} onClick={() => load(previousPage)}>قبلی</Button>
                            <Button size="sm" variant="outline" disabled={!nextPage || loading} onClick={() => load(nextPage)}>بعدی</Button>
                        </div>
                    </nav>

                    <article className="min-w-0 border border-border bg-card p-5 sm:p-7">
                        {!selected ? <EmptyState title="یک درخواست را انتخاب کنید" /> : detailLoading ? <SkeletonLines lines={5} /> : detailError ? <ErrorState title="جزئیات در دسترس نیست" description={detailError} onRetry={() => loadDetail(selected)} /> : (
                            <>
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div><p className="text-xs font-bold text-terracotta-strong">{isArtist ? 'درخواست دریافتی' : 'درخواست ارسالی'}</p><h2 className="mt-2 text-xl font-black">{selected.subject}</h2></div>
                                    <Badge variant={selected.status === 'new' ? 'accent' : selected.status === 'archived' ? 'neutral' : 'success'}>{statusLabels[selected.status] ?? selected.status}</Badge>
                                </div>
                                <dl className="mt-5 grid gap-3 border-y border-border py-4 text-sm sm:grid-cols-2">
                                    <div><dt className="text-xs text-muted-foreground">{isArtist ? 'فرستنده' : 'هنرمند'}</dt><dd className="mt-1 font-semibold">{isArtist ? selected.buyer?.name : selected.artist?.display_name}</dd></div>
                                    <div><dt className="text-xs text-muted-foreground">تاریخ ثبت</dt><dd className="mt-1 font-semibold">{new Date(selected.created_at).toLocaleString('fa-IR')}</dd></div>
                                    {selected.artwork && <div className="sm:col-span-2"><dt className="text-xs text-muted-foreground">اثر مرتبط</dt><dd className="mt-1 font-semibold">{selected.artwork.title}</dd></div>}
                                </dl>
                                <p className="whitespace-pre-wrap py-6 text-sm leading-9 text-foreground">{selected.message}</p>
                                {isArtist && <p className="mb-3 text-xs leading-6 text-muted-foreground">{selected.status === 'new' ? 'هنوز رسیدگی به این درخواست را ثبت نکرده‌اید.' : selected.status === 'read' ? 'این درخواست به‌عنوان خوانده‌شده ثبت شده است؛ در صورت نیاز می‌توانید آن را بایگانی کنید.' : 'این درخواست بایگانی شده و از فهرست فعال خارج است.'}</p>}
                                {isArtist && <div className="flex flex-wrap gap-2 border-t border-border pt-4">
                                    {selected.status !== 'read' && <Button size="sm" variant="outline" disabled={busyId === selected.id} onClick={() => updateStatus(selected, 'read')}>علامت‌گذاری به‌عنوان خوانده‌شده</Button>}
                                    {selected.status !== 'archived' && <Button size="sm" variant="secondary" disabled={busyId === selected.id} onClick={() => updateStatus(selected, 'archived')}>بایگانی درخواست</Button>}
                                </div>}
                                <p className="mt-4 text-xs leading-6 text-muted-foreground">این بخش برای مشاهده و پیگیری وضعیت درخواست است؛ امکان پاسخ‌گویی، گفت‌وگو یا مشاهده ایمیل طرفین در سامانه وجود ندارد.</p>
                            </>
                        )}
                    </article>
                </div>
            )}
        </section>
    );
}
