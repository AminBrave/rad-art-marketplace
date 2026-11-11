import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from './AuthContext';
import ContactArtistForm from './ContactArtistForm';
import { isFeatureEnabled } from './features';
import { ArtworkCard, ArtworkDetailSkeleton, Button } from '../components/ui';
import { formatArtworkPrice } from '../utils/formatArtworkPrice';

function ArtworkImage({ artwork }) {
    const [failed, setFailed] = useState(false);
    useEffect(() => setFailed(false), [artwork?.slug]);

    return (
        <div className="flex aspect-[4/3] items-center justify-center overflow-hidden bg-card p-4 sm:p-8 lg:aspect-[4/5]">
            {failed ? (
                <div role="img" aria-label={'تصویر اثر ' + artwork.title + ' در دسترس نیست'} className="grid h-full w-full place-items-center border border-border bg-muted p-8 text-center text-sm leading-7 text-muted-foreground">تصویر این اثر در حال حاضر در دسترس نیست.</div>
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
    const artworkQuery = useQuery({
        queryKey: ['artwork', slug, user?.id ?? 'guest'],
        queryFn: async ({ signal }) => {
            const { data } = await axios.get('/api/v1/artworks/' + encodeURIComponent(slug), { signal });
            return data.data;
        },
        enabled: Boolean(slug),
        staleTime: 60_000,
    });
    const artwork = artworkQuery.data ?? null;
    const loading = artworkQuery.isPending;
    const status = artworkQuery.error?.response?.status ?? 0;

    useEffect(() => {
        if (!artwork) return undefined;
        const previousTitle = document.title;
        const descriptionTag = document.querySelector('meta[name="description"]');
        const previousDescription = descriptionTag?.getAttribute('content');
        document.title = artwork.title + ' | راد آرت';
        if (descriptionTag) descriptionTag.setAttribute('content', artwork.description || ('اثر ' + artwork.title + ' از ' + (artwork.artist?.display_name || 'هنرمندان راد آرت') + '؛ جزئیات اثر و راه ارتباط با هنرمند.'));
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
            <nav aria-label="مسیر صفحه" className="text-sm text-muted-foreground">
                <Link to="/" className="hover:text-primary">خانه</Link><span className="mx-2" aria-hidden="true">/</span>
                <Link to="/artworks" className="hover:text-primary">گالری آثار</Link><span className="mx-2" aria-hidden="true">/</span>
                <span aria-current="page" className="text-foreground">جزئیات اثر</span>
            </nav>
            {!artwork ? (
                <section className="mt-8 border border-border bg-card p-8">
                    <h1 className="text-2xl font-semibold">{status === 403 ? 'دسترسی به این اثر مجاز نیست' : 'اثر در دسترس نیست'}</h1>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">{status === 403 ? 'سرور اجازه مشاهده این اثر را صادر نکرد.' : 'این اثر وجود ندارد یا هنوز برای نمایش عمومی تأیید نشده است.'}</p>
                    {artworkQuery.isError && status !== 403 && status !== 404 && <p role="alert" className="mt-3 text-sm text-destructive">ارتباط با سرور برقرار نشد. <Button type="button" onClick={() => artworkQuery.refetch()} variant="ghost" size="default">تلاش دوباره</Button></p>}
                    <Link to="/artworks" className="mt-5 inline-block font-bold text-primary underline">بازگشت به گالری</Link>
                </section>
            ) : (
                <>
                    <article className="mt-7 grid gap-8 lg:grid-cols-[1.15fr_.85fr]">
                        <ArtworkImage artwork={artwork} />
                        <div className="border border-border bg-card p-6 sm:p-9">
                            <p className="text-sm font-bold text-primary">{artwork.category?.name}</p>
                            <h1 className="mt-3 text-3xl font-semibold leading-relaxed">{artwork.title}</h1>
                            <Link to={'/artists/' + artwork.artist.slug} className="mt-3 inline-block text-sm font-semibold text-primary underline">{artwork.artist.display_name}</Link>
                            {artwork.description && <p className="mt-7 whitespace-pre-line text-sm leading-9 text-muted-foreground">{artwork.description}</p>}
                            <dl className="mt-7 grid grid-cols-2 gap-4 border-y border-border py-5 text-sm">
                                {artwork.medium && <div><dt className="text-xs text-muted-foreground">تکنیک / مواد</dt><dd className="mt-1 font-semibold">{artwork.medium}</dd></div>}
                                {artwork.dimensions && <div><dt className="text-xs text-muted-foreground">ابعاد</dt><dd className="mt-1 font-semibold">{artwork.dimensions}</dd></div>}
                                {artwork.year && <div><dt className="text-xs text-muted-foreground">سال خلق</dt><dd className="mt-1 font-semibold">{artwork.year.toLocaleString('fa-IR')}</dd></div>}
                                <div><dt className="text-xs text-muted-foreground">قیمت</dt><dd className="mt-1 font-semibold">{formatArtworkPrice(artwork.price)}</dd></div>
                            </dl>
                            <p className="mt-5 text-sm text-muted-foreground">وضعیت: {availabilityLabel(artwork.availability)}</p>
                            {user?.role === 'buyer' && <div className="mt-7 flex flex-wrap gap-3">
                                <Link to={'/dashboard/buyer/messages?artist=' + encodeURIComponent(artwork.artist.slug) + '&artwork=' + encodeURIComponent(artwork.slug)} className="inline-flex items-center bg-brand-ink px-5 py-3 text-sm font-bold text-white hover:bg-primary">پیام مستقیم درباره این اثر</Link>
                                {isFeatureEnabled('inquiries') && <ContactArtistForm artistSlug={artwork.artist.slug} artworkId={artwork.id} />}
                            </div>}
                            {!user && <Link to="/login" state={{ from: { pathname: '/artworks/' + slug } }} className="mt-7 inline-block text-sm font-bold text-primary underline">برای ارسال پیام مستقیم وارد شوید</Link>}
                            {user && user.role !== 'buyer' && <p className="mt-7 text-xs leading-6 text-muted-foreground">ارسال پیام مستقیم از حساب خریدار امکان‌پذیر است.</p>}
                        </div>
                    </article>
                    {artwork.related_artworks?.length > 0 && (
                        <section className="mt-16 border-t border-border pt-10">
                            <div className="flex flex-wrap items-end justify-between gap-3">
                                <div><p className="text-xs font-bold text-primary">ادامه مسیر کشف</p><h2 className="mt-2 text-2xl font-semibold">آثار مرتبط</h2><p className="mt-2 text-sm text-muted-foreground">آثاری از همین دسته یا همین هنرمند</p></div>
                                <Link to="/artworks" className="text-sm font-bold text-primary underline">مشاهده همه آثار</Link>
                            </div>
                            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{artwork.related_artworks.map((item) => <ArtworkCard key={item.id} artwork={item} />)}</div>
                        </section>
                    )}
                </>
            )}
        </main>
    );
}
