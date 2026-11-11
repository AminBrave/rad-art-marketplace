import { useEffect, useMemo, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from './AuthContext';
import ContactArtistForm from './ContactArtistForm';
import { isFeatureEnabled } from './features';
import { ArtworkCard, EmptyState, ErrorState, ArtistProfileSkeleton, Button } from '../components/ui';

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
        <main className="mx-auto min-h-[65vh] max-w-7xl px-5 py-12 sm:px-8 lg:px-10" dir="rtl">
            <nav aria-label="مسیر صفحه" className="text-sm text-muted-foreground">
                <Link to="/" className="hover:text-primary">خانه</Link><span className="mx-2" aria-hidden="true">/</span>
                <Link to="/artists" className="hover:text-primary">هنرمندان</Link><span className="mx-2" aria-hidden="true">/</span>
                <span aria-current="page" className="text-foreground">پروفایل هنرمند</span>
            </nav>
            {profile ? (
                <>
                    <section className="relative mt-7 overflow-hidden border border-border bg-card">
                        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-2 bg-primary" />
                        <div className="grid gap-7 p-7 pt-10 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-end">
                            <div>
                                <p className="text-xs font-bold tracking-wide text-primary">پرونده هنرمند</p>
                                <h1 className="mt-3 text-4xl font-semibold leading-tight">{profile.display_name}</h1>
                                {profile.city && <p className="mt-3 text-sm text-muted-foreground">{profile.city}</p>}
                                {profile.bio && <p className="mt-7 max-w-3xl whitespace-pre-line text-sm leading-9 text-muted-foreground">{profile.bio}</p>}
                                <div className="mt-7 flex flex-wrap gap-4 text-sm font-semibold">
                                    {profile.website_url && <a href={profile.website_url} target="_blank" rel="noreferrer" className="text-primary underline">وب‌سایت هنرمند</a>}
                                    {profile.instagram_handle && <a href={'https://instagram.com/' + profile.instagram_handle} target="_blank" rel="noreferrer" className="text-primary underline">اینستاگرام</a>}
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 lg:flex-col lg:items-stretch">
                                {user?.role === 'buyer' && <>
                                    <Link to={'/dashboard/buyer/messages?artist=' + encodeURIComponent(profile.slug)} className="bg-brand-ink px-5 py-3 text-center text-sm font-bold text-white hover:bg-primary">پیام مستقیم</Link>
                                    {isFeatureEnabled('inquiries') && <ContactArtistForm artistSlug={profile.slug} />}
                                </>}
                                {!user && isFeatureEnabled('inquiries') && <Link to="/login" state={{ from: { pathname: '/artists/' + slug } }} className="bg-brand-ink px-5 py-3 text-center text-sm font-bold text-white">درخواست ارتباط با هنرمند</Link>}
                            </div>
                        </div>
                    </section>
                    <section className="mt-12">
                        <div className="flex flex-wrap items-end justify-between gap-3">
                            <div><p className="text-xs font-bold text-primary">پورتفولیو</p><h2 className="mt-2 text-2xl font-semibold">آثار تأییدشده این هنرمند</h2><p className="mt-2 text-sm text-muted-foreground">نمونه‌کارهای عمومی؛ تازه‌ترین آثار در ابتدای فهرست قرار دارند.</p></div>
                            <span className="text-xs text-muted-foreground">{allArtworks.length.toLocaleString('fa-IR')} اثر بارگذاری‌شده</span>
                        </div>
                        {portfolioCategories.length > 1 && <div className="mt-6 flex flex-wrap gap-2" aria-label="فیلتر آثار بر اساس دسته">
                            <Button type="button" aria-pressed={!categoryFilter} onClick={() => setCategoryFilter('')} variant="ghost" size="default">همه دسته‌ها</Button>
                            {portfolioCategories.map((category) => <Button type="button" key={category.slug} aria-pressed={categoryFilter === category.slug} onClick={() => setCategoryFilter(category.slug)} variant="ghost" size="default">{category.name}</Button>)}
                        </div>}
                        {visibleArtworks.length ? <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{visibleArtworks.map((item) => <ArtworkCard key={item.id} artwork={{ ...item, artist: { display_name: profile.display_name, slug: profile.slug } }} />)}</div> : <EmptyState className="mt-6" title={categoryFilter ? 'در این دسته اثری بارگذاری نشده' : 'هنوز اثری برای نمایش وجود ندارد'} description="آثار تأییدشده این هنرمند در این بخش نمایش داده می‌شوند." />}
                        {profileQuery.isFetchNextPageError && <ErrorState className="mt-6" title="دریافت آثار بیشتر ناموفق بود" description="دریافت آثار بیشتر انجام نشد. دوباره تلاش کنید." onRetry={() => profileQuery.fetchNextPage()} />}
                        {pagination?.has_more && <div className="mt-8 flex justify-center"><Button type="button" onClick={() => profileQuery.fetchNextPage()} disabled={profileQuery.isFetchingNextPage} variant="outline" size="default">{profileQuery.isFetchingNextPage ? 'در حال دریافت…' : 'نمایش آثار بیشتر'}</Button></div>}
                    </section>
                </>
            ) : (
                <section className="mt-8 border border-border bg-card p-8">
                    <h1 className="text-2xl font-semibold">{status === 403 ? 'دسترسی به پروفایل مجاز نیست' : 'پروفایل در دسترس نیست'}</h1>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">این پروفایل وجود ندارد یا نمایش عمومی آن غیرفعال شده است.</p>
                    {profileQuery.isError && status !== 403 && status !== 404 && <p role="alert" className="mt-3 text-sm text-destructive">ارتباط با سرور برقرار نشد. <Button type="button" onClick={() => profileQuery.refetch()} variant="ghost" size="default">تلاش دوباره</Button></p>}
                </section>
            )}
        </main>
    );
}
