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
        <section className="space-y-7" dir="rtl">
            <header className="relative overflow-hidden bg-ink px-6 py-8 text-white sm:px-9 sm:py-10">
                <div aria-hidden="true" className="pointer-events-none absolute -left-12 -top-20 h-64 w-64 rounded-full border border-white/10" />
                <div aria-hidden="true" className="pointer-events-none absolute -left-2 -top-10 h-44 w-44 rounded-full border border-white/10" />
                <div className="relative max-w-2xl">
                    <p className="text-xs font-bold tracking-wide text-sand">فضای اختصاصی خریدار</p>
                    <h1 className="mt-3 text-2xl font-black leading-relaxed sm:text-3xl">هنر مورد علاقه‌تان را پیدا کنید؛ گفت‌وگو را از همین‌جا ادامه دهید.</h1>
                    <p className="mt-3 max-w-xl text-sm leading-8 text-white/70">از میان آثار و هنرمندان مستقل جست‌وجو کنید، درباره جزئیات آثار سؤال بپرسید و مسیر ارتباط‌تان را در یک فضای منظم دنبال کنید.</p>
                    <div className="mt-6 flex flex-wrap gap-3">
                        <Link to="/artworks" className="inline-flex min-h-11 items-center bg-white px-5 py-3 text-sm font-bold text-ink transition-colors hover:bg-sand">کشف آثار هنری <span aria-hidden="true" className="mr-3">←</span></Link>
                        <Link to="/artists" className="inline-flex min-h-11 items-center border border-white/30 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10">آشنایی با هنرمندان</Link>
                    </div>
                </div>
            </header>

            <div className="grid gap-4 sm:grid-cols-2">
                <Link to="/dashboard/buyer/messages" className="group flex min-h-44 flex-col justify-between border border-border bg-paper p-5 transition-all hover:-translate-y-0.5 hover:border-terracotta hover:shadow-soft sm:p-6">
                    <div className="flex items-start justify-between gap-4"><span className="grid h-11 w-11 place-items-center bg-surface-muted text-lg text-terracotta-strong" aria-hidden="true">✉</span><span className="text-xs font-semibold text-subtle">ارتباط مستقیم</span></div>
                    <div><h2 className="text-lg font-black">پیام‌های مستقیم</h2><p className="mt-2 text-sm leading-7 text-muted">گفت‌وگوها، پاسخ‌ها و پیوست‌های خود را پیگیری کنید.</p><span className="mt-3 inline-block text-sm font-bold text-terracotta-strong">ورود به صندوق پیام <span aria-hidden="true">←</span></span></div>
                </Link>
                <Link to="/dashboard/buyer/inquiries" className="group flex min-h-44 flex-col justify-between border border-border bg-paper p-5 transition-all hover:-translate-y-0.5 hover:border-terracotta hover:shadow-soft sm:p-6">
                    <div className="flex items-start justify-between gap-4"><span className="grid h-11 w-11 place-items-center bg-surface-muted text-lg text-terracotta-strong" aria-hidden="true">☷</span><span className="text-xs font-semibold text-subtle">سوابق ارتباط</span></div>
                    <div><h2 className="text-lg font-black">درخواست‌های ارسال‌شده</h2><p className="mt-2 text-sm leading-7 text-muted">درخواست‌های ارتباطی قبلی و وضعیت ثبت‌شده آن‌ها را ببینید.</p><span className="mt-3 inline-block text-sm font-bold text-terracotta-strong">مشاهده درخواست‌ها <span aria-hidden="true">←</span></span></div>
                </Link>
            </div>

            <section className="border-t border-border pt-6">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div><p className="text-xs font-bold text-terracotta-strong">شروع یک تجربه تازه</p><h2 className="mt-2 text-xl font-black">از کجا شروع کنید؟</h2></div>
                    <Link to="/artworks" className="text-sm font-bold text-terracotta-strong underline underline-offset-4">رفتن به گالری</Link>
                </div>
                <ol className="mt-5 grid gap-4 md:grid-cols-3">
                    <li className="border-r-2 border-sand bg-surface-muted p-4"><span className="text-xs font-bold text-terracotta-strong">۰۱ / کشف</span><h3 className="mt-2 font-bold">آثار و سبک‌ها را ببینید</h3><p className="mt-2 text-sm leading-7 text-muted">در گالری جست‌وجو کنید و جزئیات هر اثر را بخوانید.</p></li>
                    <li className="border-r-2 border-sand bg-surface-muted p-4"><span className="text-xs font-bold text-terracotta-strong">۰۲ / ارتباط</span><h3 className="mt-2 font-bold">با هنرمند تماس بگیرید</h3><p className="mt-2 text-sm leading-7 text-muted">از صفحه اثر یا پروفایل هنرمند درخواست خود را بفرستید.</p></li>
                    <li className="border-r-2 border-sand bg-surface-muted p-4"><span className="text-xs font-bold text-terracotta-strong">۰۳ / پیگیری</span><h3 className="mt-2 font-bold">گفت‌وگو را ادامه دهید</h3><p className="mt-2 text-sm leading-7 text-muted">پاسخ‌ها و اعلان‌های جدید را در پیام‌های مستقیم دنبال کنید.</p></li>
                </ol>
            </section>
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
                <p className="text-sm font-bold text-terracotta-strong">فضای خریدار</p>
                <h1 className="mt-2 text-2xl font-black">درخواست‌های ارسال‌شده</h1>
                <p className="mt-2 text-sm leading-7 text-muted">فهرست درخواست‌های ارتباطی شما و وضعیت فعلی هرکدام.</p>
            </header>
            {error && <ErrorState title="دریافت درخواست‌ها انجام نشد" description={error} onRetry={() => load()} />}
            {loading ? <SkeletonLines lines={6} /> : !error && (
                <>
                    {!result?.data?.length ? (
                        <EmptyState
                            title="هنوز درخواستی ارسال نکرده‌اید"
                            description="پس از ارسال درخواست از صفحه یک هنرمند یا اثر، سوابق شما در اینجا نمایش داده می‌شود."
                            action={<Link to="/artists" className="mt-2 inline-flex min-h-11 items-center bg-ink px-5 py-3 text-sm font-bold text-white">مشاهده هنرمندان</Link>}
                        />
                    ) : (
                        <div className="grid gap-3">
                            {result.data.map((item) => (
                                <Link key={item.id} to={inquiriesUrl + '/' + item.id + (page > 1 ? '?page=' + page : '')} className="group block border border-border bg-paper p-5 transition-all hover:border-terracotta hover:shadow-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus sm:p-6">
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[11px] font-bold text-terracotta-strong">درخواست ارتباطی</p>
                                            <h2 className="mt-2 truncate text-base font-black text-ink transition-colors group-hover:text-terracotta-strong">{item.subject}</h2>
                                            <p className="mt-2 text-sm text-muted">هنرمند: {item.artist?.display_name ?? '—'}</p>
                                            {item.artwork && <p className="mt-1 text-xs text-muted">اثر مرتبط: {item.artwork.title}</p>}
                                        </div>
                                        <InquiryStatus status={item.status} />
                                    </div>
                                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                                        <span className="text-xs text-muted">ثبت‌شده در {formatDate(item.created_at)}</span>
                                        <span className="text-sm font-bold text-terracotta-strong">مشاهده جزئیات <span aria-hidden="true" className="inline-block transition-transform group-hover:-translate-x-1">←</span></span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                    <Pagination currentPage={result?.current_page ?? page} lastPage={result?.last_page ?? 1} onPageChange={changePage} disabled={loading} />
                    <p className="text-center text-xs text-muted">{result?.total ?? 0} درخواست ثبت‌شده</p>
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
                <article className="border border-border bg-paper p-5 sm:p-8">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div><p className="text-xs font-bold text-terracotta-strong">جزئیات درخواست ارسالی</p><h1 className="mt-2 text-2xl font-black">{inquiry.subject}</h1></div>
                        <InquiryStatus status={inquiry.status} />
                    </div>
                    <dl className="mt-6 grid gap-4 border-y border-border py-5 text-sm sm:grid-cols-2">
                        <div><dt className="text-xs text-muted">هنرمند</dt><dd className="mt-1 font-semibold">{inquiry.artist?.display_name ?? '—'}</dd></div>
                        <div><dt className="text-xs text-muted">تاریخ ثبت</dt><dd className="mt-1 font-semibold">{formatDate(inquiry.created_at, true)}</dd></div>
                        {inquiry.artwork && <div className="sm:col-span-2"><dt className="text-xs text-muted">اثر مرتبط</dt><dd className="mt-1 font-semibold">{inquiry.artwork.title}</dd></div>}
                    </dl>
                    <h2 className="mt-6 text-sm font-bold">متن درخواست شما</h2>
                    <p className="whitespace-pre-wrap py-4 text-sm leading-9 text-ink">{inquiry.message}</p>
                    {inquiry.artist?.slug && <Link to={'/artists/' + inquiry.artist.slug} className="inline-block text-sm font-bold text-terracotta-strong underline underline-offset-4">مشاهده پروفایل هنرمند</Link>}
                    {inquiry.artwork?.slug && <Link to={'/artworks/' + inquiry.artwork.slug} className="mr-5 inline-block text-sm font-bold text-terracotta-strong underline underline-offset-4">مشاهده اثر مرتبط</Link>}
                    <p className="mt-6 border-t border-border pt-4 text-xs leading-7 text-muted">این صفحه فقط درخواست اولیه و وضعیت ثبت‌شده آن را نمایش می‌دهد. امکان پاسخ‌گویی، گفت‌وگو یا ارسال ایمیل در سامانه وجود ندارد.</p>
                </article>
            )}
        </section>
    );
}
