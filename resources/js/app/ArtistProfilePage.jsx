import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from './AuthContext';
import ContactArtistForm from './ContactArtistForm';
import { ArtworkCard, EmptyState, ErrorState, ArtistProfileSkeleton } from '../components/ui';

export default function ArtistProfilePage() {
    const { slug } = useParams();
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [status, setStatus] = useState(0);
    const [moreError, setMoreError] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const loadMoreController = useRef(null);

    useEffect(() => {
        let active = true;
        const controller = new AbortController();
        setLoading(true);
        setProfile(null);
        setStatus(0);
        setMoreError('');
        setCategoryFilter('');

        axios.get('/api/v1/artists/' + encodeURIComponent(slug), { params: { artworks_page: 1 }, signal: controller.signal })
            .then(({ data }) => { if (active) setProfile(data.data); })
            .catch((error) => { if (active && !axios.isCancel(error)) setStatus(error.response?.status ?? 0); })
            .finally(() => { if (active) setLoading(false); });

        return () => { active = false; controller.abort(); loadMoreController.current?.abort(); };
    }, [slug]);

    const loadMore = useCallback(async () => {
        if (!profile?.artworks_pagination?.has_more || loadingMore) return;
        const controller = new AbortController();
        loadMoreController.current = controller;
        setLoadingMore(true);
        setMoreError('');
        try {
            const nextPage = profile.artworks_pagination.next_page;
            const { data } = await axios.get('/api/v1/artists/' + encodeURIComponent(slug), {
                params: { artworks_page: nextPage }, signal: controller.signal,
            });
            setProfile((current) => {
                if (!current || current.slug !== slug) return current;
                const existingIds = new Set(current.artworks.map((artwork) => artwork.id));
                const nextArtworks = data.data.artworks.filter((artwork) => !existingIds.has(artwork.id));
                return { ...current, artworks: [...current.artworks, ...nextArtworks], artworks_pagination: data.data.artworks_pagination };
            });
        } catch (error) {
            if (!axios.isCancel(error)) setMoreError('دریافت آثار بیشتر انجام نشد. دوباره تلاش کنید.');
        } finally {
            if (loadMoreController.current === controller) {
                loadMoreController.current = null;
                setLoadingMore(false);
            }
        }
    }, [loadingMore, profile, slug]);

    useEffect(() => {
        if (!profile) return undefined;
        const previousTitle = document.title;
        const descriptionTag = document.querySelector('meta[name="description"]');
        const previousDescription = descriptionTag?.getAttribute('content');
        document.title = `${profile.display_name} | هنرمندان راد آرت`;
        if (descriptionTag) descriptionTag.setAttribute('content', profile.bio || `پورتفولیوی عمومی ${profile.display_name} در راد آرت؛ آثار تأییدشده و راه ارتباط با هنرمند.`);
        return () => {
            document.title = previousTitle;
            if (descriptionTag && previousDescription !== null) descriptionTag.setAttribute('content', previousDescription);
        };
    }, [profile]);

    const portfolioCategories = useMemo(() => {
        const seen = new Map();
        (profile?.artworks ?? []).forEach((artwork) => {
            if (artwork.category?.slug && !seen.has(artwork.category.slug)) seen.set(artwork.category.slug, artwork.category);
        });
        return [...seen.values()];
    }, [profile?.artworks]);
    const visibleArtworks = useMemo(
        () => categoryFilter ? (profile?.artworks ?? []).filter((artwork) => artwork.category?.slug === categoryFilter) : (profile?.artworks ?? []),
        [categoryFilter, profile?.artworks],
    );

    if (loading) return <ArtistProfileSkeleton />;

    return (
        <main className="mx-auto min-h-[65vh] max-w-7xl px-5 py-12 sm:px-8 lg:px-10" dir="rtl">
            <nav aria-label="مسیر صفحه" className="text-sm text-muted"><Link to="/" className="hover:text-terracotta-strong">خانه</Link><span className="mx-2" aria-hidden="true">/</span><Link to="/artists" className="hover:text-terracotta-strong">هنرمندان</Link><span className="mx-2" aria-hidden="true">/</span><span aria-current="page" className="text-ink">پروفایل هنرمند</span></nav>
            {profile ? (
                <>
                    <section className="relative mt-7 overflow-hidden border border-border bg-white">
                        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-2 bg-terracotta" />
                        <div className="grid gap-7 p-7 pt-10 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-end">
                            <div>
                                <p className="text-xs font-bold tracking-wide text-terracotta-strong">پرونده هنرمند</p>
                                <h1 className="mt-3 text-4xl font-black leading-tight">{profile.display_name}</h1>
                                {profile.city && <p className="mt-3 text-sm text-muted">{profile.city}</p>}
                                {profile.bio && <p className="mt-7 max-w-3xl whitespace-pre-line text-sm leading-9 text-muted">{profile.bio}</p>}
                                <div className="mt-7 flex flex-wrap gap-4 text-sm font-semibold">
                                    {profile.website_url && <a href={profile.website_url} target="_blank" rel="noreferrer" className="text-terracotta-strong underline">وب‌سایت هنرمند</a>}
                                    {profile.instagram_handle && <a href={'https://instagram.com/' + profile.instagram_handle} target="_blank" rel="noreferrer" className="text-terracotta-strong underline">اینستاگرام</a>}
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 lg:flex-col lg:items-stretch">
                                {user?.role === 'buyer' && <ContactArtistForm artistSlug={profile.slug} />}
                                {!user && <Link to="/login" state={{ from: { pathname: '/artists/' + slug } }} className="bg-ink px-5 py-3 text-center text-sm font-bold text-white">درخواست ارتباط با هنرمند</Link>}
                            </div>
                        </div>
                    </section>
                    <section className="mt-12">
                        <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold text-terracotta-strong">پورتفولیو</p><h2 className="mt-2 text-2xl font-black">آثار تأییدشده این هنرمند</h2><p className="mt-2 text-sm text-muted">نمونه‌کارهای عمومی؛ تازه‌ترین آثار در ابتدای فهرست قرار دارند.</p></div><span className="text-xs text-muted">{profile.artworks?.length?.toLocaleString('fa-IR') ?? '۰'} اثر بارگذاری‌شده</span></div>
                        {portfolioCategories.length > 1 && <div className="mt-6 flex flex-wrap gap-2" aria-label="فیلتر آثار بر اساس دسته"><button type="button" aria-pressed={!categoryFilter} onClick={() => setCategoryFilter('')} className={`border px-4 py-2 text-sm font-semibold ${!categoryFilter ? 'border-ink bg-ink text-white' : 'border-border bg-white text-ink'}`}>همه دسته‌ها</button>{portfolioCategories.map((category) => <button type="button" key={category.slug} aria-pressed={categoryFilter === category.slug} onClick={() => setCategoryFilter(category.slug)} className={`border px-4 py-2 text-sm font-semibold ${categoryFilter === category.slug ? 'border-ink bg-ink text-white' : 'border-border bg-white text-ink'}`}>{category.name}</button>)}</div>}
                        {visibleArtworks.length ? <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{visibleArtworks.map((item) => <ArtworkCard key={item.id} artwork={{ ...item, artist: { display_name: profile.display_name, slug: profile.slug } }} />)}</div> : <EmptyState className="mt-6" title={categoryFilter ? 'در این دسته اثری بارگذاری نشده' : 'هنوز اثری برای نمایش وجود ندارد'} description="آثار تأییدشده این هنرمند در این بخش نمایش داده می‌شوند." />}
                        {moreError && <ErrorState className="mt-6" title="دریافت آثار بیشتر ناموفق بود" description={moreError} onRetry={loadMore} />}
                        {profile.artworks_pagination?.has_more && <div className="mt-8 flex justify-center"><button type="button" onClick={loadMore} disabled={loadingMore} className="border border-border px-6 py-3 text-sm font-bold text-ink transition-colors hover:border-terracotta disabled:cursor-wait disabled:opacity-60">{loadingMore ? 'در حال دریافت…' : 'نمایش آثار بیشتر'}</button></div>}
                    </section>
                </>
            ) : (
                <section className="mt-8 border border-border bg-white p-8"><h1 className="text-2xl font-black">{status === 403 ? 'دسترسی به پروفایل مجاز نیست' : 'پروفایل در دسترس نیست'}</h1><p className="mt-3 text-sm leading-7 text-muted">این پروفایل وجود ندارد یا نمایش عمومی آن غیرفعال شده است.</p></section>
            )}
        </main>
    );
}
