import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from './AuthContext';
import ContactArtistForm from './ContactArtistForm';
import { ArtworkCard, ArtworkDetailSkeleton } from '../components/ui';
import { formatArtworkPrice } from '../utils/formatArtworkPrice';

function ArtworkImage({ artwork }) {
    const [failed, setFailed] = useState(false);
    useEffect(() => setFailed(false), [artwork?.slug]);

    return (
        <div className="flex aspect-[4/3] items-center justify-center overflow-hidden bg-white p-4 sm:p-8 lg:aspect-[4/5]">
            {failed ? (
                <div role="img" aria-label={`تصویر اثر ${artwork.title} در دسترس نیست`} className="grid h-full w-full place-items-center border border-border bg-surface-muted p-8 text-center text-sm leading-7 text-muted">تصویر این اثر در حال حاضر در دسترس نیست.</div>
            ) : (
                <img src={artwork.image_url} alt={artwork.title} onError={() => setFailed(true)} loading="eager" fetchpriority="high" decoding="async" className="h-full max-h-[78vh] w-full object-contain" />
            )}
        </div>
    );
}

function availabilityLabel(value) {
    if (value === 'available') return 'قابل استعلام از هنرمند';
    if (value === 'sold') return 'فروخته‌شده';
    if (value === 'not_for_sale') return 'برای فروش ارائه نشده';
    return 'وضعیت اعلام نشده';
}

export default function ArtworkDetailPage() {
    const { slug } = useParams();
    const { user } = useAuth();
    const [artwork, setArtwork] = useState(null);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState(0);

    useEffect(() => {
        let active = true;
        const controller = new AbortController();
        setLoading(true);
        setArtwork(null);
        setStatus(0);

        axios.get('/api/v1/artworks/' + encodeURIComponent(slug), { signal: controller.signal })
            .then(({ data }) => { if (active) setArtwork(data.data); })
            .catch((error) => { if (active && !axios.isCancel(error)) setStatus(error.response?.status ?? 0); })
            .finally(() => { if (active) setLoading(false); });

        return () => { active = false; controller.abort(); };
    }, [slug]);

    useEffect(() => {
        if (!artwork) return undefined;
        const previousTitle = document.title;
        const descriptionTag = document.querySelector('meta[name="description"]');
        const previousDescription = descriptionTag?.getAttribute('content');
        document.title = `${artwork.title} | راد آرت`;
        if (descriptionTag) descriptionTag.setAttribute('content', artwork.description || `اثر ${artwork.title} از ${artwork.artist?.display_name || 'هنرمندان راد آرت'}؛ جزئیات اثر و راه ارتباط با هنرمند.`);
        return () => {
            document.title = previousTitle;
            if (descriptionTag) {
                if (previousDescription === null) descriptionTag.removeAttribute('content');
                else descriptionTag.setAttribute('content', previousDescription);
            }
        };
    }, [artwork]);

    if (loading) return <ArtworkDetailSkeleton />;

    return (
        <main className="mx-auto min-h-[65vh] max-w-7xl px-5 py-12 sm:px-8 lg:px-10" dir="rtl">
            <nav aria-label="مسیر صفحه" className="text-sm text-muted">
                <Link to="/" className="hover:text-terracotta-strong">خانه</Link><span className="mx-2" aria-hidden="true">/</span>
                <Link to="/artworks" className="hover:text-terracotta-strong">گالری آثار</Link><span className="mx-2" aria-hidden="true">/</span>
                <span aria-current="page" className="text-ink">جزئیات اثر</span>
            </nav>
            {!artwork ? (
                <section className="mt-8 border border-border bg-white p-8">
                    <h1 className="text-2xl font-black">{status === 403 ? 'دسترسی به این اثر مجاز نیست' : 'اثر در دسترس نیست'}</h1>
                    <p className="mt-3 text-sm leading-7 text-muted">{status === 403 ? 'سرور اجازه مشاهده این اثر را صادر نکرد.' : 'این اثر وجود ندارد یا هنوز برای نمایش عمومی تأیید نشده است.'}</p>
                    <Link to="/artworks" className="mt-5 inline-block font-bold text-terracotta-strong underline">بازگشت به گالری</Link>
                </section>
            ) : (
                <>
                    <article className="mt-7 grid gap-8 lg:grid-cols-[1.15fr_.85fr]">
                        <ArtworkImage artwork={artwork} />
                        <div className="border border-border bg-white p-6 sm:p-9">
                            <p className="text-sm font-bold text-terracotta-strong">{artwork.category?.name}</p>
                            <h1 className="mt-3 text-3xl font-black leading-relaxed">{artwork.title}</h1>
                            <Link to={'/artists/' + artwork.artist.slug} className="mt-3 inline-block text-sm font-semibold text-terracotta-strong underline">{artwork.artist.display_name}</Link>
                            {artwork.description && <p className="mt-7 whitespace-pre-line text-sm leading-9 text-muted">{artwork.description}</p>}
                            <dl className="mt-7 grid grid-cols-2 gap-4 border-y border-border py-5 text-sm">
                                {artwork.medium && <div><dt className="text-xs text-muted">تکنیک / مواد</dt><dd className="mt-1 font-semibold">{artwork.medium}</dd></div>}
                                {artwork.dimensions && <div><dt className="text-xs text-muted">ابعاد</dt><dd className="mt-1 font-semibold">{artwork.dimensions}</dd></div>}
                                {artwork.year && <div><dt className="text-xs text-muted">سال خلق</dt><dd className="mt-1 font-semibold">{artwork.year.toLocaleString('fa-IR')}</dd></div>}
                                <div><dt className="text-xs text-muted">قیمت</dt><dd className="mt-1 font-semibold">{formatArtworkPrice(artwork.price)}</dd></div>
                            </dl>
                            <p className="mt-5 text-sm text-muted">وضعیت: {availabilityLabel(artwork.availability)}</p>
                            {user?.role === 'buyer' && <ContactArtistForm artistSlug={artwork.artist.slug} artworkId={artwork.id} />}
                            {!user && <Link to="/login" state={{ from: { pathname: '/artworks/' + slug } }} className="mt-7 inline-block text-sm font-bold text-terracotta-strong underline">برای ارتباط با هنرمند وارد شوید</Link>}
                            {user && user.role !== 'buyer' && <p className="mt-7 text-xs leading-6 text-muted">ارسال درخواست ارتباط از حساب خریدار امکان‌پذیر است.</p>}
                        </div>
                    </article>
                    {artwork.related_artworks?.length > 0 && (
                        <section className="mt-16 border-t border-border pt-10">
                            <div className="flex flex-wrap items-end justify-between gap-3">
                                <div><p className="text-xs font-bold text-terracotta-strong">ادامه مسیر کشف</p><h2 className="mt-2 text-2xl font-black">آثار مرتبط</h2><p className="mt-2 text-sm text-muted">آثاری از همین دسته یا همین هنرمند</p></div>
                                <Link to="/artworks" className="text-sm font-bold text-terracotta-strong underline">مشاهده همه آثار</Link>
                            </div>
                            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{artwork.related_artworks.map((item) => <ArtworkCard key={item.id} artwork={item} />)}</div>
                        </section>
                    )}
                </>
            )}
        </main>
    );
}
