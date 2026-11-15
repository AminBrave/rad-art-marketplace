import { useEffect, useMemo, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { ArtworkCard, EmptyState, ErrorState, ArtistProfileSkeleton, PageHeader, SectionHeader } from '../components/ui';

export default function ArtistProfilePage() {
    const { slug } = useParams();
    const { user } = useAuth();
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
        document.title = profile.display_name + ' | هنرمندان راد آرت';
        if (descriptionTag) descriptionTag.setAttribute('content', profile.bio || ('پورتفولیوی عمومی ' + profile.display_name + ' در راد آرت؛ آثار تأییدشده و راه ارتباط با هنرمند.'));
        return () => {
            document.title = previousTitle;
            if (descriptionTag) {
                if (previousDescription === null) descriptionTag.removeAttribute('content');
                else descriptionTag.setAttribute('content', previousDescription);
            }
        };
    }, [profile]);

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

    if (profileQuery.isPending) return <ArtistProfileSkeleton />;

    const status = profileQuery.error?.response?.status ?? 0;
    const actionClass = 'inline-flex min-h-10 items-center justify-center rounded-md border border-border bg-paper px-4 py-2 text-sm font-bold text-ink no-underline transition-colors hover:border-terracotta hover:text-terracotta-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus';
    const primaryActionClass = 'inline-flex min-h-11 items-center justify-center rounded-md border border-transparent bg-terracotta px-5 py-2.5 text-sm font-bold text-inverse no-underline transition-colors hover:bg-terracotta-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus';

    return (
        <main className="mx-auto min-h-[65vh] max-w-7xl px-5 pb-16 pt-8 sm:px-8 sm:pt-12 lg:px-10" dir="rtl">
            <nav aria-label="مسیر صفحه" className="text-xs text-muted">
                <Link to="/" className="hover:text-terracotta-strong">خانه</Link><span className="mx-2" aria-hidden="true">/</span>
                <Link to="/artists" className="hover:text-terracotta-strong">هنرمندان</Link><span className="mx-2" aria-hidden="true">/</span>
                <span aria-current="page" className="text-ink">پروفایل هنرمند</span>
            </nav>

            {profile ? (
                <>
                    <section className="mt-7">
                        <PageHeader
                            eyebrow="پرونده هنرمند"
                            title={profile.display_name}
                            description={(
                                <span className="block">
                                    {profile.city && <span className="mb-2 inline-flex items-center gap-2 font-semibold text-ink"><span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-terracotta" />{profile.city}</span>}
                                    {profile.bio && <span className="block whitespace-pre-line">{profile.bio}</span>}
                                </span>
                            )}
                            actions={(
                                <>
                                    {profile.website_url && <a href={profile.website_url} target="_blank" rel="noreferrer" className={actionClass}>وب‌سایت هنرمند ↗</a>}
                                    {profile.instagram_handle && <a href={'https://instagram.com/' + profile.instagram_handle} target="_blank" rel="noreferrer" className={actionClass}>اینستاگرام ↗</a>}
                                    {user?.role === 'buyer' && <Link to={'/dashboard/buyer/messages?artist=' + encodeURIComponent(profile.slug)} className={primaryActionClass}>ارسال پیام به هنرمند</Link>}
                                    {!user && <Link to="/login" state={{ from: { pathname: '/artists/' + slug } }} className={primaryActionClass}>ورود برای ارتباط با هنرمند</Link>}
                                </>
                            )}
                        />
                        {user && user.role !== 'buyer' && (
                            <p className="mt-4 text-xs leading-6 text-muted">برای ارسال پیام مستقیم، از حساب خریدار استفاده کنید.</p>
                        )}
                        <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted">
                            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-muted px-3 py-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-olive" aria-hidden="true" />
                                پورتفولیوی عمومی
                            </span>
                            <span className="font-semibold tabular-nums">{allArtworks.length.toLocaleString('fa-IR')} اثر بارگذاری‌شده</span>
                        </div>
                    </section>

                    <section className="mt-12" aria-labelledby="artist-portfolio-heading">
                        <SectionHeader
                            id="artist-portfolio-heading"
                            eyebrow="منتخب آثار"
                            title="آثار تأییدشده"
                            description="نگاهی به آثار عمومی و تازه‌ترین تجربه‌های هنری این هنرمند."
                            actions={<span className="text-xs font-semibold tabular-nums text-muted">{allArtworks.length.toLocaleString('fa-IR')} اثر</span>}
                        />

                        {portfolioCategories.length > 1 && (
                            <div className="mt-6 flex flex-wrap gap-2" aria-label="فیلتر آثار بر اساس دسته">
                                <button type="button" aria-pressed={!categoryFilter} onClick={() => setCategoryFilter('')} className={`min-h-10 rounded-full border px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus ${!categoryFilter ? 'border-ink bg-ink text-inverse' : 'border-border bg-paper text-ink hover:border-terracotta'}`}>همه دسته‌ها</button>
                                {portfolioCategories.map((category) => (
                                    <button type="button" key={category.slug} aria-pressed={categoryFilter === category.slug} onClick={() => setCategoryFilter(category.slug)} className={`min-h-10 rounded-full border px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus ${categoryFilter === category.slug ? 'border-ink bg-ink text-inverse' : 'border-border bg-paper text-ink hover:border-terracotta'}`}>{category.name}</button>
                                ))}
                            </div>
                        )}

                        {visibleArtworks.length ? (
                            <div className="mt-7 grid gap-x-5 gap-y-9 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {visibleArtworks.map((item) => <ArtworkCard key={item.id} artwork={{ ...item, artist: { display_name: profile.display_name, slug: profile.slug } }} />)}
                            </div>
                        ) : (
                            <EmptyState className="mt-7" title={categoryFilter ? 'در این دسته اثری بارگذاری نشده' : 'هنوز اثری برای نمایش وجود ندارد'} description="آثار تأییدشده این هنرمند در این بخش نمایش داده می‌شوند." />
                        )}
                        {profileQuery.isFetchNextPageError && <ErrorState className="mt-7" title="دریافت آثار بیشتر ناموفق بود" description="دریافت آثار بیشتر انجام نشد. دوباره تلاش کنید." onRetry={() => profileQuery.fetchNextPage()} />}
                        {pagination?.has_more && <div className="mt-9 flex justify-center"><button type="button" onClick={() => profileQuery.fetchNextPage()} disabled={profileQuery.isFetchingNextPage} className="min-h-11 rounded-md border border-border bg-paper px-7 py-3 text-sm font-bold text-ink transition-colors hover:border-terracotta disabled:cursor-wait disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">{profileQuery.isFetchingNextPage ? 'در حال دریافت…' : 'نمایش آثار بیشتر'}</button></div>}
                    </section>
                </>
            ) : (
                <section className="mt-8 border border-border bg-paper p-8">
                    <h1 className="text-2xl font-black">{status === 403 ? 'دسترسی به پروفایل مجاز نیست' : 'پروفایل در دسترس نیست'}</h1>
                    <p className="mt-3 text-sm leading-7 text-muted">این پروفایل وجود ندارد یا نمایش عمومی آن غیرفعال شده است.</p>
                    {profileQuery.isError && status !== 403 && status !== 404 && <p role="alert" className="mt-3 text-sm text-danger">ارتباط با سرور برقرار نشد. <button type="button" onClick={() => profileQuery.refetch()} className="font-bold underline">تلاش دوباره</button></p>}
                </section>
            )}
        </main>
    );
}
