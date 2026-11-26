import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';
import ArtworkEngagement from './ArtworkEngagement';
import { ArtworkCard, ArtworkDetailSkeleton, MediaImage, Container, Button } from '../components/ui';
import { formatArtworkPrice } from '../utils/formatArtworkPrice';
import { localizedValue } from '../utils/localizedContent';

function ArtworkImage({ artwork }) {
    const { locale } = useLanguage();
    return (
        <div className="relative flex aspect-[3/4] items-center justify-center overflow-hidden border border-ink bg-[linear-gradient(145deg,var(--color-surface-muted),var(--color-paper))] p-3 sm:p-6 lg:aspect-[3/4] lg:p-8">
            <span aria-hidden="true" className="absolute inset-3 border border-ink/15 sm:inset-5" />
            <MediaImage
                src={artwork.image_url}
                alt={localizedValue(artwork, 'title', locale)}
                variant="detail"
                className="h-full max-h-[78vh] w-full"
                imageClassName="object-cover"
                loading="eager"
                fetchPriority="high"
                decoding="async"
            />
        </div>
    );
}

function availabilityLabel(value, t) {
    if (value === 'available') return t('قابل استعلام از هنرمند');
    if (value === 'sold') return t('فروخته‌شده');
    if (value === 'not_for_sale') return t('برای فروش ارائه نشده');
    return t('وضعیت اعلام نشده');
}

export default function ArtworkDetailPage() {
    const { slug } = useParams();
    const { user } = useAuth();
    const { t, locale } = useLanguage();
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
        document.title = localizedValue(artwork, 'title', locale) + (locale === 'en' ? ' | Rad Art' : ' | راد آرت');
        if (descriptionTag) descriptionTag.setAttribute('content', localizedValue(artwork, 'description', locale) || (locale === 'en' ? localizedValue(artwork, 'title', locale) + ' by ' + localizedValue(artwork.artist, 'display_name', locale) : 'اثر ' + artwork.title + ' از ' + (artwork.artist?.display_name || 'هنرمندان راد آرت') + '؛ جزئیات اثر و راه ارتباط با هنرمند.'));
        return () => {
            document.title = previousTitle;
            if (descriptionTag) {
                if (previousDescription === null) descriptionTag.removeAttribute('content');
                else descriptionTag.setAttribute('content', previousDescription);
            }
        };
    }, [artwork, locale]);

    if (loading) return <ArtworkDetailSkeleton />;

    return (
        <Container as="div" width="wide" className="min-h-[65vh] py-section-compact lg:py-section-regular">
            <nav aria-label={t("مسیر صفحه")} className="text-sm text-muted">
                <Link to="/" className="hover:text-terracotta-strong">{t("خانه")}</Link><span className="mx-2" aria-hidden="true">/</span>
                <Link to="/artworks" className="hover:text-terracotta-strong">{t("گالری آثار")}</Link><span className="mx-2" aria-hidden="true">/</span>
                <span aria-current="page" className="text-ink">{t("جزئیات اثر")}</span>
            </nav>
            {!artwork ? (
                <section className="mt-8 border-y border-ink bg-transparent px-5 py-8 sm:px-8">
                    <h1 className="text-2xl font-black">{t(status === 403 ? 'دسترسی به این اثر مجاز نیست' : 'اثر در دسترس نیست')}</h1>
                    <p className="mt-3 text-sm leading-7 text-muted">{t(status === 403 ? 'سرور اجازه مشاهده این اثر را صادر نکرد.' : 'این اثر وجود ندارد یا هنوز برای نمایش عمومی تأیید نشده است.')}</p>
                    {artworkQuery.isError && status !== 403 && status !== 404 && <p role="alert" className="mt-3 text-sm text-danger">{t("ارتباط با سرور برقرار نشد.")} <Button variant="ghost" type="button" onClick={() => artworkQuery.refetch()} className="inline p-0 font-bold underline">{t("تلاش دوباره")}</Button></p>}
                    <Link to="/artworks" className="mt-5 inline-block font-bold text-terracotta-strong underline">{t("بازگشت به گالری")}</Link>
                </section>
            ) : (
                <>
                    <article className="mt-8 grid items-start gap-8 lg:grid-cols-[1.15fr_.85fr] lg:gap-12">
                        <div className="min-w-0">
                            <ArtworkImage artwork={artwork} />
                            <p className="mt-3 text-xs leading-6 text-muted">{t("تصویر اثر با حفظ نسبت و جزئیات اصلی نمایش داده شده است.")}</p>
                        </div>
                        <div className="border-y border-ink bg-transparent py-6 sm:py-9 lg:sticky lg:top-28 lg:border-y-0 lg:py-2">
                            <p className="text-[11px] font-extrabold tracking-[.14em] text-terracotta-strong">{t("پرونده اثر")} <span className="mx-1 text-subtle">/</span> {localizedValue(artwork.category, 'name', locale)}</p>
                            <h1 className="mt-3 text-3xl font-black leading-relaxed tracking-tight sm:text-4xl">{localizedValue(artwork, 'title', locale)}</h1>
                            <Link to={'/artists/' + artwork.artist.slug} className="mt-3 inline-block text-sm font-semibold text-terracotta-strong underline">{localizedValue(artwork.artist, 'display_name', locale)}</Link>
                            {localizedValue(artwork, 'description', locale) && <p className="mt-7 whitespace-pre-line text-sm leading-9 text-muted">{localizedValue(artwork, 'description', locale)}</p>}
                            <dl className="mt-8 grid grid-cols-2 gap-x-5 gap-y-6 border-y border-border py-7 text-sm">
                                {localizedValue(artwork, 'city', locale) && <div><dt className="text-xs text-muted">{t("شهر محل اثر")}</dt><dd className="mt-1 font-semibold">{localizedValue(artwork, 'city', locale)}</dd></div>}
                                {artwork.medium && <div><dt className="text-xs text-muted">{t("تکنیک / مواد")}</dt><dd className="mt-1 font-semibold">{t(artwork.medium)}</dd></div>}
                                {artwork.dimensions && <div><dt className="text-xs text-muted">{t("ابعاد")}</dt><dd className="mt-1 font-semibold">{artwork.dimensions}</dd></div>}
                                {artwork.year && <div><dt className="text-xs text-muted">{t("سال خلق")}</dt><dd className="mt-1 font-semibold">{artwork.year.toLocaleString(locale === "fa" ? "fa-IR" : "en-US")}</dd></div>}
                                <div><dt className="text-xs text-muted">{t("قیمت")}</dt><dd className="mt-1 font-semibold">{formatArtworkPrice(artwork.price, locale)}</dd></div>
                            </dl>
                            <p className="mt-5 inline-flex items-center gap-2 text-sm text-muted"><span aria-hidden="true" className="h-2 w-2 rounded-full bg-olive" />{t('وضعیت')}: {availabilityLabel(artwork.availability, t)}</p>
                            {user?.role === 'buyer' && <div className="mt-8 flex flex-wrap gap-3">
                                <Link to={'/dashboard/buyer/messages?artist=' + encodeURIComponent(artwork.artist.slug) + '&artwork=' + encodeURIComponent(artwork.slug)} className="inline-flex items-center bg-ink px-5 py-3 text-sm font-bold text-inverse hover:bg-terracotta">{t("پیام مستقیم درباره این اثر")}</Link>
                            </div>}
                            {!user && <Link to="/login" state={{ from: { pathname: '/artworks/' + slug } }} className="mt-7 inline-block text-sm font-bold text-terracotta-strong underline">{t("برای ارسال پیام مستقیم وارد شوید")}</Link>}
                            {user && user.role !== 'buyer' && <p className="mt-7 text-xs leading-6 text-muted">{t("ارسال پیام مستقیم از حساب خریدار امکان‌پذیر است.")}</p>}
                        </div>
                    </article>
                    {typeof artwork.likes_count === 'number' && typeof artwork.comments_count === 'number' && (
                        <ArtworkEngagement artwork={artwork} slug={slug} />
                    )}
                    {artwork.related_artworks?.length > 0 && (
                        <section className="mt-16 border-t border-border pt-10 lg:mt-20 lg:pt-14">
                            <div className="flex flex-wrap items-end justify-between gap-3">
                                <div><p className="text-xs font-bold text-terracotta-strong">{t("ادامه مسیر کشف")}</p><h2 className="mt-2 text-2xl font-black">{t("آثار مرتبط")}</h2><p className="mt-2 text-sm text-muted">{t("آثاری از همین دسته یا همین هنرمند")}</p></div>
                                <Link to="/artworks" className="text-sm font-bold text-terracotta-strong underline">{t("مشاهده همه آثار")}</Link>
                            </div>
                            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{artwork.related_artworks.map((item) => <ArtworkCard key={item.id} artwork={item} />)}</div>
                        </section>
                    )}
                </>
            )}
        </Container>
    );
}
