import { useEffect, useMemo, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from './AuthContext';
import ContactArtistForm from './ContactArtistForm';
import { isFeatureEnabled } from './features';
import { ArtworkCard, EmptyState, ErrorState, ArtistProfileSkeleton } from '../components/ui';

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

    return (
        <main className="mx-auto min-h-[65vh] max-w-7xl px-5 pb-16 pt-8 sm:px-8 sm:pt-12 lg:px-10" dir="rtl">
            <nav aria-label="مسیر صفحه" className="text-xs text-muted">
                <Link to="/" className="hover:text-terracotta-strong">خانه</Link><span className="mx-2" aria-hidden="true">/</span>
                <Link to="/artists" className="hover:text-terracotta-strong">هنرمندان</Link><span className="mx-2" aria-hidden="true">/</span>
                <span aria-current="page" className="text-ink">پروفایل هنرمند</span>
            </nav>

            {profile ? (
                <>
                    <section className="relative mt-6 overflow-hidden border border-border bg-white">
                        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5 bg-terracotta" />
                        <div className="grid lg:grid-cols-[minmax(0,1fr)_18rem]">
                            <div className="relative px-6 pb-8 pt-9 sm:px-10 sm:pb-10 sm:pt-12 lg:px-12">
                                <p className="text-xs font-bold tracking-wide text-terracotta-strong">پرونده هنرمند</p>
                                <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight sm:text-5xl">{profile.display_name}</h1>
                                {profile.city && <p className="mt-4 flex items-center gap-2 text-sm font-medium text-muted"><span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-terracotta" />{profile.city}</p>}
                                {profile.bio && <p className="mt-7 max-w-3xl whitespace-pre-line border-r-2 border-sand pr-5 text-sm leading-9 text-muted sm:text-base">{profile.bio}</p>}
                                <div className="mt-7 flex flex-wrap gap-x-5 gap-y-3 text-sm font-semibold">
                                    {profile.website_url && <a href={profile.website_url} target="_blank" rel="noreferrer" className="text-terracotta-strong underline underline-offset-4">وب‌سایت هنرمند ↗</a>}
                                    {profile.instagram_handle && <a href={'https://instagram.com/' + profile.instagram_handle} target="_blank" rel="noreferrer" className="text-terracotta-strong underline underline-offset-4">اینستاگرام ↗</a>}
                                </div>
                            </div>
                            <aside className="flex flex-col justify-between gap-6 border-t border-border bg-surface-muted p-6 sm:p-8 lg:border-r lg:border-t-0">
                                <div>
                                    <p className="text-[11px] font-bold tracking-wide text-muted">پورتفولیوی عمومی</p>
                                    <p className="mt-3 text-3xl font-black tabular-nums text-ink">{allArtworks.length.toLocaleString('fa-IR')}</p>
                                    <p className="mt-1 text-xs text-muted">اثر دریافت‌شده در این صفحه</p>
                                </div>
                                <div className="grid gap-3">
                                    {user?.role === 'buyer' && <>
                                        <Link to={'/dashboard/buyer/messages?artist=' + encodeURIComponent(profile.slug)} className="flex min-h-12 items-center justify-center bg-ink px-5 py-3 text-center text-sm font-bold text-white transition-colors hover:bg-terracotta">ارسال پیام به هنرمند</Link>
                                        {isFeatureEnabled('inquiries') && <ContactArtistForm artistSlug={profile.slug} />}
                                    </>}
                                    {!user && isFeatureEnabled('inquiries') && <Link to="/login" state={{ from: { pathname: '/artists/' + slug } }} className="flex min-h-12 items-center justify-center bg-ink px-5 py-3 text-center text-sm font-bold text-white transition-colors hover:bg-terracotta">درخواست ارتباط با هنرمند</Link>}
                                    {user?.role !== 'buyer' && user && <p className="text-xs leading-6 text-muted">برای ارتباط با این هنرمند، از حساب خریدار استفاده کنید.</p>}
                                </div>
                            </aside>
                        </div>
                    </section>

                    <section className="mt-12" aria-labelledby="artist-portfolio-heading">
                        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5">
                            <div>
                                <p className="text-[11px] font-bold tracking-wide text-terracotta-strong">منتخب آثار</p>
                                <h2 id="artist-portfolio-heading" className="mt-2 text-2xl font-black sm:text-3xl">آثار تأییدشده</h2>
                                <p className="mt-2 text-sm leading-7 text-muted">نگاهی به آثار عمومی و تازه‌ترین تجربه‌های هنری این هنرمند.</p>
                            </div>
                            <span className="text-xs text-muted">{allArtworks.length.toLocaleString('fa-IR')} اثر بارگذاری‌شده</span>
                        </div>

                        {portfolioCategories.length > 1 && <div className="mt-6 flex flex-wrap gap-2" aria-label="فیلتر آثار بر اساس دسته">
                            <button type="button" aria-pressed={!categoryFilter} onClick={() => setCategoryFilter('')} className={`min-h-10 border px-4 py-2 text-sm font-semibold transition-colors ${!categoryFilter ? 'border-ink bg-ink text-white' : 'border-border bg-white text-ink hover:border-terracotta'}`}>همه دسته‌ها</button>
                            {portfolioCategories.map((category) => <button type="button" key={category.slug} aria-pressed={categoryFilter === category.slug} onClick={() => setCategoryFilter(category.slug)} className={`min-h-10 border px-4 py-2 text-sm font-semibold transition-colors ${categoryFilter === category.slug ? 'border-ink bg-ink text-white' : 'border-border bg-white text-ink hover:border-terracotta'}`}>{category.name}</button>)}
                        </div>}

                        {visibleArtworks.length ? (
                            <div className="mt-7 grid gap-x-5 gap-y-9 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {visibleArtworks.map((item) => <ArtworkCard key={item.id} artwork={{ ...item, artist: { display_name: profile.display_name, slug: profile.slug } }} />)}
                            </div>
                        ) : (
                            <EmptyState className="mt-7" title={categoryFilter ? 'در این دسته اثری بارگذاری نشده' : 'هنوز اثری برای نمایش وجود ندارد'} description="آثار تأییدشده این هنرمند در این بخش نمایش داده می‌شوند." />
                        )}
                        {profileQuery.isFetchNextPageError && <ErrorState className="mt-7" title="دریافت آثار بیشتر ناموفق بود" description="دریافت آثار بیشتر انجام نشد. دوباره تلاش کنید." onRetry={() => profileQuery.fetchNextPage()} />}
                        {pagination?.has_more && <div className="mt-9 flex justify-center"><button type="button" onClick={() => profileQuery.fetchNextPage()} disabled={profileQuery.isFetchingNextPage} className="min-h-12 border border-border px-7 py-3 text-sm font-bold text-ink transition-colors hover:border-terracotta disabled:cursor-wait disabled:opacity-60">{profileQuery.isFetchingNextPage ? 'در حال دریافت…' : 'نمایش آثار بیشتر'}</button></div>}
                    </section>
                </>
            ) : (
                <section className="mt-8 border border-border bg-white p-8">
                    <h1 className="text-2xl font-black">{status === 403 ? 'دسترسی به پروفایل مجاز نیست' : 'پروفایل در دسترس نیست'}</h1>
                    <p className="mt-3 text-sm leading-7 text-muted">این پروفایل وجود ندارد یا نمایش عمومی آن غیرفعال شده است.</p>
                    {profileQuery.isError && status !== 403 && status !== 404 && <p role="alert" className="mt-3 text-sm text-danger">ارتباط با سرور برقرار نشد. <button type="button" onClick={() => profileQuery.refetch()} className="font-bold underline">تلاش دوباره</button></p>}
                </section>
            )}
        </main>
    );
}
