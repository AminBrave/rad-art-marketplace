import { useEffect, useMemo, useState } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';
import { ArtworkCard, EmptyState, ErrorState, ArtistProfileSkeleton, SectionHeader, Button, Container, DiscoveryHero, Breadcrumbs } from '../components/ui';
import { localizedValue } from '../utils/localizedContent';

export default function ArtistProfilePage() {
    const { slug } = useParams();
    const { user } = useAuth();
    const { t, locale } = useLanguage();
    const queryClient = useQueryClient();
    const [categoryFilter, setCategoryFilter] = useState('');

    const profileQuery = useInfiniteQuery({
        queryKey: ['artist-profile', slug, user?.id ?? 'guest'],
        queryFn: async ({ pageParam, signal }) => {
            const { data } = await axios.get('/api/v1/artists/' + encodeURIComponent(slug), {
                params: { artworks_page: pageParam },
                signal,
            });

            return data.data;
        },
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
            ? axios.delete('/api/v1/artists/' + encodeURIComponent(slug) + '/follow')
            : axios.post('/api/v1/artists/' + encodeURIComponent(slug) + '/follow'),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['artist-profile', slug] }),
    });

    if (profileQuery.isPending) return <ArtistProfileSkeleton />;

    const status = profileQuery.error?.response?.status ?? 0;
    const actionClass = 'inline-flex min-h-10 items-center justify-center rounded-control border border-border bg-transparent px-4 py-2 text-sm font-bold text-ink no-underline transition-colors hover:border-terracotta hover:text-terracotta-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus';
    const primaryActionClass = 'inline-flex min-h-11 items-center justify-center rounded-control border border-transparent bg-terracotta px-5 py-2.5 text-sm font-bold text-inverse no-underline transition-colors hover:bg-terracotta-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus';

    return (
        <div className="min-h-[65vh] overflow-x-clip pb-section">
            {profile ? (
                <>
                    <DiscoveryHero
                        eyebrow={t("جامعه هنرمندان")}
                        title={<>{localizedValue(profile, 'display_name', locale)} {profile.is_own_profile && <span className="ms-2 align-middle text-xs font-semibold text-[color:var(--rd-hero-accent)]">{t("پروفایل شما")}</span>}</>}
                        description={localizedValue(profile, 'bio', locale)}
                        breadcrumbs={<Breadcrumbs label={t("مسیر صفحه")} items={[{ label: t("خانه"), to: "/" }, { label: t("هنرمندان"), to: "/artists" }, { label: localizedValue(profile, 'display_name', locale) }]} />}
                        media={<div className="mx-auto aspect-square w-40 overflow-hidden border border-[color:var(--rd-hero-line)] bg-[color:var(--rd-hero-background)] text-6xl font-black text-[color:var(--rd-hero-accent)] sm:w-52">
                            {profile.avatar_url ? <img src={profile.avatar_url} alt={t("تصویر نمایه هنرمند")} className="h-full w-full object-cover" /> : <div aria-hidden="true" className="grid h-full w-full place-items-center">{(localizedValue(profile, "display_name", locale) || (locale === "en" ? "A" : "ه")).trim().slice(0, 1)}</div>}
                        </div>}
                        actions={<>
                            {canFollow && <Button variant="outline" type="button" disabled={followMutation.isPending} onClick={() => followMutation.mutate()} aria-pressed={Boolean(followState.is_following)} className={primaryActionClass}>{followMutation.isPending ? t('در حال به‌روزرسانی…') : followState.is_following ? t('دنبال می‌کنید') : t('دنبال کردن')}</Button>}
                            {!user && <Link to="/login" state={{ from: { pathname: '/artists/' + slug } }} className={primaryActionClass}>{t("دنبال کردن")}</Link>}
                            {profile.website_url && <a href={profile.website_url} target="_blank" rel="noreferrer" className={actionClass}>{t("وب‌سایت")} ↗</a>}
                            {profile.instagram_handle && <a href={'https://instagram.com/' + profile.instagram_handle} target="_blank" rel="noreferrer" className={actionClass}>{t("اینستاگرام")} ↗</a>}
                            {user?.role === 'buyer' && <Link to={'/dashboard/buyer/messages?artist=' + encodeURIComponent(profile.slug)} className={primaryActionClass}>{t("ارسال پیام")}</Link>}
                            {!user && <Link to="/login" state={{ from: { pathname: '/artists/' + slug } }} className={actionClass}>{t("ورود برای ارتباط")}</Link>}
                        </>}
                    >
                        <div className="flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-[color:var(--rd-hero-line)] pt-4 text-xs text-[color:var(--rd-hero-muted)]">
                            <span><strong className="font-black tabular-nums text-[color:var(--rd-hero-foreground)]">{allArtworks.length.toLocaleString(locale === 'fa' ? 'fa-IR' : 'en-US')}</strong><span className="ms-1.5">{t("اثر")}</span></span>
                            {followState.followers_count !== undefined && followState.followers_count !== null && <span><strong className="font-black tabular-nums text-[color:var(--rd-hero-foreground)]">{Number(followState.followers_count).toLocaleString(locale === 'fa' ? 'fa-IR' : 'en-US')}</strong><span className="ms-1.5">{t("دنبال‌کننده")}</span></span>}
                            {localizedValue(profile, 'city', locale) && <span>{localizedValue(profile, 'city', locale)}</span>}
                        </div>
                    </DiscoveryHero>
                    <Container width="wide">
                    {followMutation.isError && <p role="alert" className="mt-3 text-xs text-danger">{t("به‌روزرسانی دنبال‌کردن هنرمند انجام نشد. دوباره تلاش کنید.")}</p>}

                    <section className="mt-10 min-w-0 max-w-full" aria-labelledby="artist-portfolio-heading">
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
                    </Container>
                </>
            ) : (
                <>
                <DiscoveryHero
                    shape="arch"
                    eyebrow={t("جامعه هنرمندان")}
                    title={t("پروفایل هنرمند")}
                    description={t("این پروفایل وجود ندارد یا نمایش عمومی آن غیرفعال شده است.")}
                    breadcrumbs={<Breadcrumbs label={t("مسیر صفحه")} items={[{ label: t("خانه"), to: "/" }, { label: t("هنرمندان"), to: "/artists" }, { label: t("پروفایل هنرمند") }]} />}
                />
                <Container width="wide">
                <section className="mt-8 border border-border bg-paper p-8">
                    <h2 className="text-2xl font-black">{t(status === 403 ? 'دسترسی به پروفایل مجاز نیست' : 'پروفایل در دسترس نیست')}</h2>
                    <p className="mt-3 text-sm leading-7 text-muted">{t("این پروفایل وجود ندارد یا نمایش عمومی آن غیرفعال شده است.")}</p>
                    {profileQuery.isError && status !== 403 && status !== 404 && <p role="alert" className="mt-3 text-sm text-danger">{t("ارتباط با سرور برقرار نشد.")} <Button variant="outline" type="button" onClick={() => profileQuery.refetch()} className="font-bold underline">{t("تلاش دوباره")}</Button></p>}
                </section>
                </Container>
                </>
            )}
        </div>
    );
}
