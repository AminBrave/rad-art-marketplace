import { useEffect, useMemo, useState } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchArtistProfile, followArtist, unfollowArtist, artistKeys } from '../features/artists';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';
import { ArtworkCard, EmptyState, ErrorState, ArtistProfileSkeleton, SectionHeader, Button, Container } from '../components/ui';
import { localizedValue } from '../utils/localizedContent';

export default function ArtistProfilePage() {
    const { slug } = useParams();
    const { user } = useAuth();
    const { t, locale } = useLanguage();
    const queryClient = useQueryClient();
    const [categoryFilter, setCategoryFilter] = useState('');

    const profileQuery = useInfiniteQuery({
        queryKey: artistKeys.profile(slug, user?.id),
        queryFn: ({ pageParam, signal }) => fetchArtistProfile({ slug, pageParam, signal }),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => (
            lastPage.artworks_pagination?.has_more
                ? lastPage.artworks_pagination.next_page
                : undefined
        ),
        enabled: Boolean(slug),
        staleTime: 60_000,
    });

    const pages = useMemo(() => profileQuery.data?.pages ?? [], [profileQuery.data?.pages]);
    const profile = pages[0] ?? null;
    const pagination = pages[pages.length - 1]?.artworks_pagination;
    const allArtworks = useMemo(() => {
        const unique = new Map();
        pages.forEach((page) => (page.artworks ?? []).forEach((artwork) => unique.set(artwork.id, artwork)));
        return [...unique.values()];
    }, [pages]);

    useEffect(() => setCategoryFilter(''), [slug]);

    useEffect(() => {
        if (!profile) return undefined;
        const previousTitle = document.title;
        const descriptionTag = document.querySelector('meta[name="description"]');
        const previousDescription = descriptionTag?.getAttribute('content');
        document.title = localizedValue(profile, 'display_name', locale) + (locale === 'fa' ? ' | هنرمندان راد آرت' : ' | Rad Art Artists');
        if (descriptionTag) descriptionTag.setAttribute('content', localizedValue(profile, 'bio', locale) || (locale === 'en' ? 'Public portfolio of ' + localizedValue(profile, 'display_name', locale) + ' on Rad Art.' : 'پورتفولیوی عمومی ' + profile.display_name + ' در راد آرت؛ آثار تأییدشده و راه ارتباط با هنرمند.'));
        return () => {
            document.title = previousTitle;
            if (descriptionTag) {
                if (previousDescription === null) descriptionTag.removeAttribute('content');
                else descriptionTag.setAttribute('content', previousDescription);
            }
        };
    }, [profile, locale]);

    const portfolioCategories = useMemo(() => {
        const seen = new Map();
        allArtworks.forEach((artwork) => {
            if (artwork.category?.slug && !seen.has(artwork.category.slug)) seen.set(artwork.category.slug, artwork.category);
        });
        return [...seen.values()];
    }, [allArtworks]);
    const visibleArtworks = useMemo(
        () => categoryFilter ? allArtworks.filter((artwork) => artwork.category?.slug === categoryFilter) : allArtworks,
        [allArtworks, categoryFilter],
    );
    const followState = {
        followers_count: profile?.followers_count ?? null,
        is_following: profile?.is_following ?? false,
        is_own_profile: profile?.is_own_profile ?? false,
    };
    const canFollow = Boolean(profile) && ['buyer', 'artist'].includes(user?.role) && !followState.is_own_profile;
    const followMutation = useMutation({
        mutationFn: () => followState.is_following
            ? unfollowArtist({ slug })
            : followArtist({ slug }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: artistKeys.profilePrefix(slug) }),
    });

    if (profileQuery.isPending) return <ArtistProfileSkeleton />;

    const status = profileQuery.error?.response?.status ?? 0;
    const actionClass = 'inline-flex min-h-10 items-center justify-center rounded-control border border-border bg-transparent px-4 py-2 text-sm font-bold text-ink no-underline transition-colors hover:border-terracotta hover:text-terracotta-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus';
    const primaryActionClass = 'inline-flex min-h-11 items-center justify-center rounded-control border border-transparent bg-terracotta px-5 py-2.5 text-sm font-bold text-inverse no-underline transition-colors hover:bg-terracotta-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus';

    return (
        <Container as="div" width="wide" className="min-h-[65vh] overflow-x-clip pb-16 pt-8 sm:pt-12">
            <nav aria-label={t("مسیر صفحه")} className="flex min-w-0 max-w-full flex-wrap items-center break-words text-xs text-muted">
                <Link to="/" className="hover:text-terracotta-strong">{t("خانه")}</Link><span className="mx-2" aria-hidden="true">/</span>
                <Link to="/artists" className="hover:text-terracotta-strong">{t("هنرمندان")}</Link><span className="mx-2" aria-hidden="true">/</span>
                <span aria-current="page" className="text-ink">{t("پروفایل هنرمند")}</span>
            </nav>

            {profile ? (
                <>
                    <section aria-label={t("پروفایل هنرمند")} className="mt-7 grid min-w-0 gap-6 border-y border-border bg-paper p-5 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-8 sm:p-8 lg:grid-cols-[13rem_minmax(0,1fr)] lg:p-10">
                        <div className="flex items-start justify-center sm:justify-start">
                            <div className="aspect-square w-28 overflow-hidden border border-[color:var(--rd-hero-line)] bg-[color:var(--rd-hero-background)] text-5xl font-black text-[color:var(--rd-hero-accent)] sm:w-36 lg:w-44">
                                {profile.avatar_url ? <img src={profile.avatar_url} alt={t("تصویر نمایه هنرمند")} className="h-full w-full object-cover" /> : <div aria-hidden="true" className="grid h-full w-full place-items-center">{(localizedValue(profile, "display_name", locale) || (locale === "en" ? "A" : "ه")).trim().slice(0, 1)}</div>}
                            </div>
                        </div>
                        <div className="min-w-0">
                            <div className="flex min-w-0 flex-wrap items-center gap-3">
                                <h1 className="min-w-0 break-words text-2xl font-black tracking-tight text-ink sm:text-3xl [overflow-wrap:anywhere]">{localizedValue(profile, 'display_name', locale)}</h1>
                                {profile.is_own_profile && <span className="border border-border bg-surface-muted px-2 py-1 text-[10px] font-bold text-muted">{t("پروفایل شما")}</span>}
                            </div>
                            <div className="mt-5 flex flex-wrap items-center gap-x-8 gap-y-3 border-y border-divider-group py-3 text-sm">
                                <span><strong className="font-black tabular-nums">{allArtworks.length.toLocaleString(locale === 'fa' ? 'fa-IR' : 'en-US')}</strong><span className="ms-1.5 text-muted">{t("اثر")}</span></span>
                                {followState.followers_count !== undefined && followState.followers_count !== null && <span><strong className="font-black tabular-nums">{Number(followState.followers_count).toLocaleString(locale === 'fa' ? 'fa-IR' : 'en-US')}</strong><span className="ms-1.5 text-muted">{t("دنبال‌کننده")}</span></span>}
                                {localizedValue(profile, 'city', locale) && <span className="text-muted">{localizedValue(profile, 'city', locale)}</span>}
                            </div>
                            {localizedValue(profile, 'bio', locale) && <p className="mt-4 whitespace-pre-line break-words text-sm leading-8 text-muted [overflow-wrap:anywhere]">{localizedValue(profile, 'bio', locale)}</p>}
                            <div className="mt-5 flex min-w-0 flex-wrap items-center gap-2">
                                {canFollow && <Button variant="outline" type="button" disabled={followMutation.isPending} onClick={() => followMutation.mutate()} aria-pressed={Boolean(followState.is_following)} className={primaryActionClass}>{followMutation.isPending ? t('در حال به‌روزرسانی…') : followState.is_following ? t('دنبال می‌کنید') : t('دنبال کردن')}</Button>}
                                {!user && <Link to="/login" state={{ from: { pathname: '/artists/' + slug } }} className={primaryActionClass}>{t("دنبال کردن")}</Link>}
                                {profile.website_url && <a href={profile.website_url} target="_blank" rel="noreferrer" className={actionClass}>{t("وب‌سایت")} ↗</a>}
                                {profile.instagram_handle && <a href={'https://instagram.com/' + profile.instagram_handle} target="_blank" rel="noreferrer" className={actionClass}>{t("اینستاگرام")} ↗</a>}
                                {user?.role === 'buyer' && <Link to={'/dashboard/buyer/messages?artist=' + encodeURIComponent(profile.slug)} className={primaryActionClass}>{t("ارسال پیام")}</Link>}
                                {!user && <Link to="/login" state={{ from: { pathname: '/artists/' + slug } }} className={actionClass}>{t("ورود برای ارتباط")}</Link>}
                            </div>
                        </div>
                    </section>
                    {user && user.role !== 'buyer' && (
                        <p className="mt-4 text-xs leading-6 text-muted">{t("برای ارسال پیام مستقیم، از حساب خریدار استفاده کنید.")}</p>
                    )}
                    {followMutation.isError && <p role="alert" className="mt-3 text-xs text-danger">{t("به‌روزرسانی دنبال‌کردن هنرمند انجام نشد. دوباره تلاش کنید.")}</p>}
                    <div className="mt-5 flex min-w-0 max-w-full flex-wrap items-center gap-x-3 gap-y-2 break-words text-xs text-muted">
                            <span className="inline-flex items-center gap-2 border border-border bg-surface-muted px-3 py-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-olive" aria-hidden="true" />
                                {t('پورتفولیوی عمومی')}
                            </span>
                            <span className="font-semibold tabular-nums">{allArtworks.length.toLocaleString(locale === 'fa' ? 'fa-IR' : 'en-US')} {t('اثر بارگذاری‌شده')}</span>
                            {followState.followers_count !== undefined && followState.followers_count !== null && <span className="font-semibold tabular-nums">{Number(followState.followers_count).toLocaleString(locale === 'fa' ? 'fa-IR' : 'en-US')} {t('دنبال‌کننده')}</span>}
                    </div>

                    <section className="mt-12 min-w-0 max-w-full" aria-labelledby="artist-portfolio-heading">
                        <SectionHeader
                            id="artist-portfolio-heading"
                            eyebrow={t("منتخب آثار")}
                            title={t("آثار تأییدشده")}
                            description={t("نگاهی به آثار عمومی و تازه‌ترین تجربه‌های هنری این هنرمند.")}
                            actions={<span className="text-xs font-semibold tabular-nums text-muted">{allArtworks.length.toLocaleString(locale === 'fa' ? 'fa-IR' : 'en-US')} {t('اثر')}</span>}
                        />

                        {portfolioCategories.length > 1 && (
                            <div className="mt-6 flex flex-wrap gap-2" aria-label={t("فیلتر آثار بر اساس دسته")}>
                                <Button variant="outline" type="button" aria-pressed={!categoryFilter} onClick={() => setCategoryFilter('')} className={`min-h-10 rounded-full border px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus ${!categoryFilter ? 'border-ink bg-ink text-inverse' : 'border-border bg-paper text-ink hover:border-terracotta'}`}>{t("همه دسته‌ها")}</Button>
                                {portfolioCategories.map((category) => (
                                    <Button variant="outline" type="button" key={category.slug} aria-pressed={categoryFilter === category.slug} onClick={() => setCategoryFilter(category.slug)} className={`min-h-10 rounded-full border px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus ${categoryFilter === category.slug ? 'border-ink bg-ink text-inverse' : 'border-border bg-paper text-ink hover:border-terracotta'}`}>{localizedValue(category, 'name', locale)}</Button>
                                ))}
                            </div>
                        )}

                        {visibleArtworks.length ? (
                            <div className="mt-7 grid min-w-0 max-w-full grid-cols-1 gap-x-5 gap-y-9 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {visibleArtworks.map((item) => <ArtworkCard key={item.id} className="min-w-0 [overflow-wrap:anywhere]" artwork={{ ...item, artist: { display_name: profile.display_name, display_name_en: profile.display_name_en, slug: profile.slug } }} />)}
                            </div>
                        ) : (
                            <EmptyState className="mt-7" title={t(categoryFilter ? 'در این دسته اثری بارگذاری نشده' : 'هنوز اثری برای نمایش وجود ندارد')} description={t('آثار تأییدشده این هنرمند در این بخش نمایش داده می‌شوند.')} />
                        )}
                        {profileQuery.isFetchNextPageError && <ErrorState className="mt-7" title={t("دریافت آثار بیشتر ناموفق بود")} description={t("دریافت آثار بیشتر انجام نشد. دوباره تلاش کنید.")} onRetry={() => profileQuery.fetchNextPage()} />}
                        {pagination?.has_more && <div className="mt-9 flex justify-center"><Button variant="outline" type="button" onClick={() => profileQuery.fetchNextPage()} disabled={profileQuery.isFetchingNextPage} className="min-h-11 rounded-md border border-border bg-paper px-7 py-3 text-sm font-bold text-ink transition-colors hover:border-terracotta disabled:cursor-wait disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">{profileQuery.isFetchingNextPage ? t('در حال دریافت…') : t('نمایش آثار بیشتر')}</Button></div>}
                    </section>
                </>
            ) : (
                <section className="mt-8 border border-border bg-paper p-8">
                    <h1 className="text-2xl font-black">{t(status === 403 ? 'دسترسی به پروفایل مجاز نیست' : 'پروفایل در دسترس نیست')}</h1>
                    <p className="mt-3 text-sm leading-7 text-muted">{t("این پروفایل وجود ندارد یا نمایش عمومی آن غیرفعال شده است.")}</p>
                    {profileQuery.isError && status !== 403 && status !== 404 && <p role="alert" className="mt-3 text-sm text-danger">{t("ارتباط با سرور برقرار نشد.")} <Button variant="outline" type="button" onClick={() => profileQuery.refetch()} className="font-bold underline">{t("تلاش دوباره")}</Button></p>}
                </section>
            )}
        </Container>
    );
}
