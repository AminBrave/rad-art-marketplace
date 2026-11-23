import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from './AuthContext';
import ArtworkEngagement from './ArtworkEngagement';
import { ArtworkCard, ArtworkDetailSkeleton, MediaImage, PageContainer } from '../components/ui';
import { formatArtworkPrice } from '../utils/formatArtworkPrice';

function ArtworkImage({ artwork }) {
    return (
        <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-surface-muted p-3 sm:p-6 lg:aspect-[4/5] lg:p-8">
            <span aria-hidden="true" className="absolute inset-3 border border-border/70 sm:inset-5" />
            <MediaImage
                src={artwork.image_url}
                alt={artwork.title}
                variant="detail"
                className="h-full max-h-[78vh] w-full"
                imageClassName="object-contain"
                loading="eager"
                fetchPriority="high"
                decoding="async"
            />
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
        <PageContainer as="main" className="min-h-[65vh] py-10 lg:py-14" dir="rtl">
            <nav aria-label="مسیر صفحه" className="text-sm text-muted">
                <Link to="/" className="hover:text-terracotta-strong">خانه</Link><span className="mx-2" aria-hidden="true">/</span>
                <Link to="/artworks" className="hover:text-terracotta-strong">گالری آثار</Link><span className="mx-2" aria-hidden="true">/</span>
                <span aria-current="page" className="text-ink">جزئیات اثر</span>
            </nav>
            {!artwork ? (
                <section className="mt-8 border border-border bg-paper p-8">
                    <h1 className="text-2xl font-black">{status === 403 ? 'دسترسی به این اثر مجاز نیست' : 'اثر در دسترس نیست'}</h1>
                    <p className="mt-3 text-sm leading-7 text-muted">{status === 403 ? 'سرور اجازه مشاهده این اثر را صادر نکرد.' : 'این اثر وجود ندارد یا هنوز برای نمایش عمومی تأیید نشده است.'}</p>
                    {artworkQuery.isError && status !== 403 && status !== 404 && <p role="alert" className="mt-3 text-sm text-danger">ارتباط با سرور برقرار نشد. <button type="button" onClick={() => artworkQuery.refetch()} className="font-bold underline">تلاش دوباره</button></p>}
                    <Link to="/artworks" className="mt-5 inline-block font-bold text-terracotta-strong underline">بازگشت به گالری</Link>
                </section>
            ) : (
                <>
                    <article className="mt-8 grid items-start gap-8 lg:grid-cols-[1.15fr_.85fr] lg:gap-12">
                        <div className="min-w-0">
                            <ArtworkImage artwork={artwork} />
                            <p className="mt-3 text-xs leading-6 text-muted">تصویر اثر با حفظ نسبت و جزئیات اصلی نمایش داده شده است.</p>
                        </div>
                        <div className="border-y border-border bg-transparent py-6 sm:py-9 lg:sticky lg:top-28 lg:border-y-0 lg:py-2">
                            <p className="text-[11px] font-extrabold tracking-[.14em] text-terracotta-strong">پرونده اثر <span className="mx-1 text-subtle">/</span> {artwork.category?.name}</p>
                            <h1 className="mt-3 text-3xl font-black leading-relaxed tracking-tight sm:text-4xl">{artwork.title}</h1>
                            <Link to={'/artists/' + artwork.artist.slug} className="mt-3 inline-block text-sm font-semibold text-terracotta-strong underline">{artwork.artist.display_name}</Link>
                            {artwork.description && <p className="mt-7 whitespace-pre-line text-sm leading-9 text-muted">{artwork.description}</p>}
                            <dl className="mt-8 grid grid-cols-2 gap-x-5 gap-y-6 border-y border-border py-7 text-sm">
                                {artwork.medium && <div><dt className="text-xs text-muted">تکنیک / مواد</dt><dd className="mt-1 font-semibold">{artwork.medium}</dd></div>}
                                {artwork.dimensions && <div><dt className="text-xs text-muted">ابعاد</dt><dd className="mt-1 font-semibold">{artwork.dimensions}</dd></div>}
                                {artwork.year && <div><dt className="text-xs text-muted">سال خلق</dt><dd className="mt-1 font-semibold">{artwork.year.toLocaleString('fa-IR')}</dd></div>}
                                <div><dt className="text-xs text-muted">قیمت</dt><dd className="mt-1 font-semibold">{formatArtworkPrice(artwork.price)}</dd></div>
                            </dl>
                            <p className="mt-5 inline-flex items-center gap-2 text-sm text-muted"><span aria-hidden="true" className="h-2 w-2 rounded-full bg-olive" />وضعیت: {availabilityLabel(artwork.availability)}</p>
                            {user?.role === 'buyer' && <div className="mt-8 flex flex-wrap gap-3">
                                <Link to={'/dashboard/buyer/messages?artist=' + encodeURIComponent(artwork.artist.slug) + '&artwork=' + encodeURIComponent(artwork.slug)} className="inline-flex items-center bg-ink px-5 py-3 text-sm font-bold text-inverse hover:bg-terracotta">پیام مستقیم درباره این اثر</Link>
                            </div>}
                            {!user && <Link to="/login" state={{ from: { pathname: '/artworks/' + slug } }} className="mt-7 inline-block text-sm font-bold text-terracotta-strong underline">برای ارسال پیام مستقیم وارد شوید</Link>}
                            {user && user.role !== 'buyer' && <p className="mt-7 text-xs leading-6 text-muted">ارسال پیام مستقیم از حساب خریدار امکان‌پذیر است.</p>}
                        </div>
                    </article>
                    {typeof artwork.likes_count === 'number' && typeof artwork.comments_count === 'number' && (
                        <ArtworkEngagement artwork={artwork} slug={slug} />
                    )}
                    {artwork.related_artworks?.length > 0 && (
                        <section className="mt-16 border-t border-border pt-10 lg:mt-20 lg:pt-14">
                            <div className="flex flex-wrap items-end justify-between gap-3">
                                <div><p className="text-xs font-bold text-terracotta-strong">ادامه مسیر کشف</p><h2 className="mt-2 text-2xl font-black">آثار مرتبط</h2><p className="mt-2 text-sm text-muted">آثاری از همین دسته یا همین هنرمند</p></div>
                                <Link to="/artworks" className="text-sm font-bold text-terracotta-strong underline">مشاهده همه آثار</Link>
                            </div>
                            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{artwork.related_artworks.map((item) => <ArtworkCard key={item.id} artwork={item} />)}</div>
                        </section>
                    )}
                </>
            )}
        </PageContainer>
    );
}
