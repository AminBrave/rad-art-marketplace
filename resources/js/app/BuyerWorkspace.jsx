import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Badge, Button, EmptyState, ErrorState, Pagination, SkeletonLines } from '../components/ui';

const statusLabels = { new: 'در انتظار بررسی', read: 'دیده‌شده', archived: 'بایگانی‌شده' };
const statusVariants = { new: 'accent', read: 'success', archived: 'neutral' };
const inquiriesUrl = '/dashboard/buyer/inquiries';
const apiUrl = '/api/v1/buyer/inquiries';

function formatDate(value, withTime = false) {
    if (!value) return '—';
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? '—'
        : date.toLocaleString('fa-IR', withTime ? {} : { dateStyle: 'medium' });
}

function InquiryStatus({ status }) {
    return <Badge variant={statusVariants[status] ?? 'neutral'}>{statusLabels[status] ?? 'وضعیت نامشخص'}</Badge>;
}

export function BuyerDashboardHome() {
    return (
        <section className="space-y-6" dir="rtl">
            <header className="border-b border-border pb-6">
                <p className="text-sm font-bold text-primary">فضای خریدار</p>
                <h1 className="mt-2 text-2xl font-semibold">ارتباط مستقیم با هنرمندان</h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">از صفحه هنرمند یا اثر هنری، گفت‌وگوی مستقیمی آغاز کنید و پیام‌های خود را در این بخش پیگیری کنید.</p>
            </header>
            <article className="border border-border bg-card p-6 sm:p-8">
                <h2 className="text-lg font-bold">صندوق پیام‌های شما</h2>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">گفت‌وگوهای فعال، پیوست‌ها و اعلان‌های پیام در بخش پیام‌های مستقیم در دسترس هستند.</p>
                <Link to="/dashboard/buyer/messages" className="mt-5 inline-flex min-h-11 items-center bg-brand-ink px-5 py-3 text-sm font-bold text-white hover:bg-primary">رفتن به پیام‌های مستقیم</Link>
            </article>
        </section>
    );
}

export function BuyerInquiryPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const page = Math.max(1, Number(searchParams.get('page')) || 1);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const load = useCallback(async (signal) => {
        setLoading(true);
        setError('');
        try {
            const { data } = await axios.get(apiUrl, { params: { page }, signal });
            setResult(data);
        } catch (requestError) {
            if (axios.isCancel(requestError)) return;
            setError(requestError.response?.status === 403
                ? 'این حساب اجازه مشاهده این فهرست را ندارد.'
                : 'دریافت فهرست درخواست‌ها انجام نشد. دوباره تلاش کنید.');
        } finally {
            if (!signal?.aborted) setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        const controller = new AbortController();
        load(controller.signal);
        return () => controller.abort();
    }, [load]);

    const changePage = (nextPage) => setSearchParams(nextPage > 1 ? { page: String(nextPage) } : {});

    return (
        <section className="space-y-6" dir="rtl">
            <header>
                <p className="text-sm font-bold text-primary">فضای خریدار</p>
                <h1 className="mt-2 text-2xl font-semibold">درخواست‌های ارسال‌شده</h1>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">فهرست درخواست‌های ارتباطی شما و وضعیت فعلی هرکدام.</p>
            </header>
            {error && <ErrorState title="دریافت درخواست‌ها انجام نشد" description={error} onRetry={() => load()} />}
            {loading ? <SkeletonLines lines={6} /> : !error && (
                <>
                    {!result?.data?.length ? (
                        <EmptyState
                            title="هنوز درخواستی ارسال نکرده‌اید"
                            description="پس از ارسال درخواست از صفحه یک هنرمند یا اثر، سوابق شما در اینجا نمایش داده می‌شود."
                            action={<Link to="/artists" className="mt-2 inline-flex min-h-11 items-center bg-brand-ink px-5 py-3 text-sm font-bold text-white">مشاهده هنرمندان</Link>}
                        />
                    ) : (
                        <div className="overflow-hidden border border-border bg-card">
                            <ul className="divide-y divide-border">
                                {result.data.map((item) => (
                                    <li key={item.id}>
                                        <Link to={inquiriesUrl + '/' + item.id + (page > 1 ? '?page=' + page : '')} className="block p-5 transition-colors hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus sm:p-6">
                                            <div className="flex flex-wrap items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <h2 className="truncate font-bold text-foreground">{item.subject}</h2>
                                                    <p className="mt-2 text-sm text-muted-foreground">هنرمند: {item.artist?.display_name ?? '—'}</p>
                                                    {item.artwork && <p className="mt-1 text-xs text-muted-foreground">اثر مرتبط: {item.artwork.title}</p>}
                                                </div>
                                                <InquiryStatus status={item.status} />
                                            </div>
                                            <p className="mt-3 text-xs text-muted-foreground">{formatDate(item.created_at)}</p>
                                            <span className="mt-3 inline-block text-sm font-bold text-primary underline underline-offset-4">مشاهده جزئیات</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    <Pagination currentPage={result?.current_page ?? page} lastPage={result?.last_page ?? 1} onPageChange={changePage} disabled={loading} />
                    <p className="text-center text-xs text-muted-foreground">{result?.total ?? 0} درخواست ثبت‌شده</p>
                </>
            )}
        </section>
    );
}

export function BuyerInquiryDetailPage() {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const page = Math.max(1, Number(searchParams.get('page')) || 1);
    const [inquiry, setInquiry] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const load = useCallback(async (signal) => {
        setLoading(true);
        setError('');
        setInquiry(null);
        try {
            const { data } = await axios.get(apiUrl + '/' + id, { signal });
            setInquiry(data.data);
        } catch (requestError) {
            if (axios.isCancel(requestError)) return;
            setError(requestError.response?.status === 404
                ? 'این درخواست در حساب شما پیدا نشد.'
                : requestError.response?.status === 403
                    ? 'دسترسی به این درخواست مجاز نیست.'
                    : 'دریافت جزئیات درخواست انجام نشد. دوباره تلاش کنید.');
        } finally {
            if (!signal?.aborted) setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        const controller = new AbortController();
        load(controller.signal);
        return () => controller.abort();
    }, [load]);

    return (
        <section className="space-y-6" dir="rtl">
            <Button variant="outline" size="sm" onClick={() => navigate(inquiriesUrl + (page > 1 ? '?page=' + page : ''))}>بازگشت به فهرست درخواست‌ها</Button>
            {loading ? <SkeletonLines lines={6} /> : error ? (
                <ErrorState title="جزئیات درخواست در دسترس نیست" description={error} onRetry={() => load()} />
            ) : inquiry && (
                <article className="border border-border bg-card p-5 sm:p-8">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div><p className="text-xs font-bold text-primary">جزئیات درخواست ارسالی</p><h1 className="mt-2 text-2xl font-semibold">{inquiry.subject}</h1></div>
                        <InquiryStatus status={inquiry.status} />
                    </div>
                    <dl className="mt-6 grid gap-4 border-y border-border py-5 text-sm sm:grid-cols-2">
                        <div><dt className="text-xs text-muted-foreground">هنرمند</dt><dd className="mt-1 font-semibold">{inquiry.artist?.display_name ?? '—'}</dd></div>
                        <div><dt className="text-xs text-muted-foreground">تاریخ ثبت</dt><dd className="mt-1 font-semibold">{formatDate(inquiry.created_at, true)}</dd></div>
                        {inquiry.artwork && <div className="sm:col-span-2"><dt className="text-xs text-muted-foreground">اثر مرتبط</dt><dd className="mt-1 font-semibold">{inquiry.artwork.title}</dd></div>}
                    </dl>
                    <h2 className="mt-6 text-sm font-bold">متن درخواست شما</h2>
                    <p className="whitespace-pre-wrap py-4 text-sm leading-9 text-foreground">{inquiry.message}</p>
                    {inquiry.artist?.slug && <Link to={'/artists/' + inquiry.artist.slug} className="inline-block text-sm font-bold text-primary underline underline-offset-4">مشاهده پروفایل هنرمند</Link>}
                    {inquiry.artwork?.slug && <Link to={'/artworks/' + inquiry.artwork.slug} className="mr-5 inline-block text-sm font-bold text-primary underline underline-offset-4">مشاهده اثر مرتبط</Link>}
                    <p className="mt-6 border-t border-border pt-4 text-xs leading-7 text-muted-foreground">این صفحه فقط درخواست اولیه و وضعیت ثبت‌شده آن را نمایش می‌دهد. امکان پاسخ‌گویی، گفت‌وگو یا ارسال ایمیل در سامانه وجود ندارد.</p>
                </article>
            )}
        </section>
    );
}
