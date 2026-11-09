import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useOutletContext } from 'react-router-dom';
import { EmptyState, ErrorState, SkeletonLines } from '../components/ui';

const statusLabels = {
    pending_review: 'در انتظار بررسی', approved: 'منتشرشده', rejected: 'ردشده',
    changes_requested: 'نیازمند اصلاح', new: 'جدید', read: 'خوانده‌شده', archived: 'بایگانی‌شده',
};

function SummaryCard({ label, value, detail, to }) {
    return <Link to={to} className="block border border-border bg-paper p-5 transition-colors hover:border-terracotta focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus">
        <p className="text-sm text-muted">{label}</p><p className="mt-3 text-3xl font-black tabular-nums text-ink">{value}</p>
        <p className="mt-2 text-xs leading-6 text-muted">{detail}</p>
    </Link>;
}

export default function ArtistWorkspaceOverview() {
    const { user, profile, profileLoading, profileError } = useOutletContext();
    const [artworks, setArtworks] = useState([]);
    const [inquiries, setInquiries] = useState([]);
    const [counts, setCounts] = useState({ artworks: null, inquiries: null });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState([]);

    useEffect(() => {
        if (profileLoading || !profile?.slug) return undefined;
        let active = true;
        setLoading(true);
        Promise.allSettled([axios.get('/api/v1/artist/artworks'), axios.get('/api/v1/artist/inquiries')])
            .then((results) => {
                if (!active) return;
                const nextErrors = [];
                if (results[0].status === 'fulfilled') {
                    const response = results[0].value.data;
                    const rows = response.data ?? [];
                    setArtworks(rows);
                    setCounts((current) => ({ ...current, artworks: response.total ?? rows.length }));
                } else nextErrors.push('آمار آثار دریافت نشد.');
                if (results[1].status === 'fulfilled') {
                    const response = results[1].value.data;
                    setInquiries(response.data ?? []);
                    setCounts((current) => ({ ...current, inquiries: response.meta?.total ?? response.total ?? response.data?.length ?? 0 }));
                } else nextErrors.push('آمار درخواست‌های ارتباطی دریافت نشد.');
                setErrors(nextErrors);
            })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [profile?.slug, profileLoading]);

    const complete = Boolean(profile?.slug && profile?.display_name?.trim());
    const pending = artworks.filter((item) => item.status === 'pending_review').length;
    const newInquiries = inquiries.filter((item) => item.status === 'new').length;

    return <section className="space-y-7" dir="rtl">
        <header className="border-b border-border pb-6">
            <p className="text-sm font-bold text-terracotta-strong">استودیوی هنرمند</p>
            <h1 className="mt-2 text-2xl font-black sm:text-3xl">خوش آمدید، {user?.name}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">از اینجا پروفایل هنری، آثار ارسالی و درخواست‌های ارتباطی خود را مدیریت کنید.</p>
        </header>
        {profileError && <ErrorState title="پروفایل دریافت نشد" description={profileError} />}
        {profileLoading ? <SkeletonLines lines={3} /> : <div className="flex flex-wrap items-center justify-between gap-4 border border-border bg-paper p-5">
            <div><p className="text-sm font-bold text-ink">{complete ? 'پروفایل هنرمند شما ثبت شده است.' : 'برای شروع، پروفایل هنری خود را تکمیل کنید.'}</p>
                <p className="mt-1 text-xs leading-6 text-muted">{complete ? (profile.is_public ? 'پروفایل شما برای بازدیدکنندگان قابل مشاهده است.' : 'پروفایل شما خصوصی است و در فهرست عمومی نمایش داده نمی‌شود.') : 'با تکمیل نام نمایشی می‌توانید آثار و درخواست‌های ارتباطی را مدیریت کنید.'}</p></div>
            <Link to="/dashboard/artist/profile" className="shrink-0 bg-ink px-5 py-3 text-sm font-bold text-white hover:bg-terracotta">{complete ? 'ویرایش پروفایل' : 'تکمیل پروفایل'}</Link>
        </div>}
        {!profileLoading && complete && <>
            {loading ? <div className="grid gap-3 sm:grid-cols-3"><SkeletonLines lines={3} /><SkeletonLines lines={3} /><SkeletonLines lines={3} /></div> : <div className="grid gap-3 sm:grid-cols-3">
                <SummaryCard label="مجموع آثار" value={counts.artworks ?? '—'} detail={pending ? pending + ' اثر در این صفحه در انتظار بررسی' : 'فهرست آثار ثبت‌شده شما'} to="/dashboard/artist/artworks" />
                <SummaryCard label="درخواست‌های دریافتی" value={counts.inquiries ?? '—'} detail={newInquiries ? newInquiries + ' درخواست جدید در صفحه فعلی' : 'مجموع درخواست‌های دریافتی'} to="/dashboard/artist/inquiries" />
                <SummaryCard label="وضعیت پروفایل" value={profile.is_public ? 'عمومی' : 'خصوصی'} detail="تنظیم نمایش پروفایل هنری" to="/dashboard/artist/profile" />
            </div>}
            {errors.length > 0 && <ErrorState title="بخشی از اطلاعات بارگذاری نشد" description={errors.join(' ')} />}
            <div className="grid gap-6 lg:grid-cols-2">
                <section className="border border-border bg-paper p-5"><div className="flex items-center justify-between gap-3"><h2 className="font-bold">آخرین آثار</h2><Link to="/dashboard/artist/artworks" className="text-sm font-semibold text-terracotta-strong underline">همه آثار</Link></div>
                    {loading ? <SkeletonLines className="mt-5" /> : artworks.length === 0 ? <EmptyState className="mt-5" title="هنوز اثری ثبت نشده" description="اولین اثر خود را ثبت کنید تا برای بررسی ارسال شود." action={<Link to="/dashboard/artist/artworks" className="text-sm font-bold text-terracotta-strong underline">ثبت اثر</Link>} /> : <ul className="mt-4 divide-y divide-border">{artworks.slice(0, 3).map((item) => <li key={item.id} className="flex items-center justify-between gap-3 py-3"><span className="min-w-0 truncate text-sm font-semibold">{item.title}</span><span className="shrink-0 text-xs text-muted">{statusLabels[item.status] ?? item.status}</span></li>)}</ul>}
                </section>
                <section className="border border-border bg-paper p-5"><div className="flex items-center justify-between gap-3"><h2 className="font-bold">آخرین درخواست‌ها</h2><Link to="/dashboard/artist/inquiries" className="text-sm font-semibold text-terracotta-strong underline">صندوق پیام‌ها</Link></div>
                    {loading ? <SkeletonLines className="mt-5" /> : inquiries.length === 0 ? <EmptyState className="mt-5" title="درخواستی دریافت نشده" description="درخواست‌های ارسال‌شده از طریق پروفایل عمومی شما در اینجا نمایش داده می‌شوند." action={<Link to="/artists" className="text-sm font-bold text-terracotta-strong underline">مشاهده هنرمندان</Link>} /> : <ul className="mt-4 divide-y divide-border">{inquiries.slice(0, 3).map((item) => <li key={item.id} className="flex items-center justify-between gap-3 py-3"><span className="min-w-0 truncate text-sm font-semibold">{item.subject}</span><span className="shrink-0 text-xs text-muted">{statusLabels[item.status] ?? item.status}</span></li>)}</ul>}
                </section>
            </div>
        </>}
    </section>;
}
