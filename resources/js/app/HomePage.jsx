import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ArrowLeft, Compass, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ArtworkCard, ArtistCard, ArtworkCardSkeleton, ArtistCardSkeleton, EmptyState, ErrorState, MediaImage, Skeleton } from '../components/ui';

export default function HomePage() {
    const artworksQuery = useQuery({
        queryKey: ['home', 'artworks'],
        queryFn: async ({ signal }) => {
            const { data } = await axios.get('/api/v1/artworks', { params: { per_page: 9, sort: 'newest' }, signal });
            return data.data ?? [];
        },
        staleTime: 60_000,
    });
    const categoriesQuery = useQuery({
        queryKey: ['home', 'categories'],
        queryFn: async ({ signal }) => {
            const { data } = await axios.get('/api/v1/categories', { signal });
            return data.data ?? [];
        },
        staleTime: 5 * 60_000,
    });
    const artistsQuery = useQuery({
        queryKey: ['home', 'artists'],
        queryFn: async ({ signal }) => {
            const { data } = await axios.get('/api/v1/artists', { params: { per_page: 6 }, signal });
            return data.data ?? [];
        },
        staleTime: 60_000,
    });
    const collectionsQuery = useQuery({
        queryKey: ['home', 'collections'],
        queryFn: async ({ signal }) => {
            const { data } = await axios.get('/api/v1/collections', { params: { per_page: 4 }, signal });
            return data.data ?? [];
        },
        staleTime: 60_000,
    });
    const featuredArtistsQuery = useQuery({
        queryKey: ['home', 'featured-artists'],
        queryFn: async ({ signal }) => {
            const { data } = await axios.get('/api/v1/featured-artists', { signal });
            return data.data ?? [];
        },
        staleTime: 60_000,
    });

    const artworks = artworksQuery.data ?? [];
    const categories = categoriesQuery.data ?? [];
    const artists = artistsQuery.data ?? [];
    const collections = collectionsQuery.data ?? [];
    const featuredArtists = featuredArtistsQuery.data ?? [];
    const loading = artworksQuery.isPending || categoriesQuery.isPending || artistsQuery.isPending;
    const error = artworksQuery.isError && !artworksQuery.data;
    const hero = artworks[0];
    const recentWorks = artworks.slice(1, 9);
    const spotlightArtists = featuredArtists.length ? featuredArtists.map((item) => item.artist).filter(Boolean).slice(0, 6) : artists.slice(0, 6);

    return (
        <main data-page="home" className="min-w-0 overflow-x-clip" dir="rtl">
            <section className="home-intro grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(300px,.82fr)]">
                <div className="min-w-0">
                    <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-accent-surface px-3 py-1.5 text-xs font-bold text-terracotta-strong">
                        <Compass size={15} aria-hidden="true" />
                        کشف هنر مستقل
                    </div>
                    <h1 className="max-w-[15ch] text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                        هنر تازه را از نگاه خالقانش ببینید.
                    </h1>
                    <p className="mt-5 max-w-xl text-sm leading-8 text-muted sm:text-base">
                        آثار، هنرمندان و مجموعه‌های منتخب را مرور کنید؛ مسیر کشف خود را با دیدن کارهای تازه آغاز کنید.
                    </p>
                    <div className="mt-7 flex flex-wrap gap-3">
                        <Link to="/artworks" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-terracotta px-5 py-2.5 text-sm font-bold text-inverse no-underline transition-colors hover:bg-terracotta-strong">
                            ورود به گالری <ArrowLeft size={16} aria-hidden="true" />
                        </Link>
                        <Link to="/artists" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-paper px-5 py-2.5 text-sm font-bold text-ink no-underline hover:border-border-strong">
                            <Users size={16} aria-hidden="true" /> هنرمندان
                        </Link>
                    </div>
                </div>
                {hero ? (
                    <Link to={'/artworks/' + hero.slug} className="home-feature group relative block min-w-0 overflow-hidden rounded-2xl border border-border bg-paper p-2 text-ink no-underline">
                        <div className="aspect-[4/5] overflow-hidden rounded-xl bg-surface-muted">
                            <MediaImage src={hero.image_url} alt={hero.title} className="h-full w-full" imageClassName="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" loading="eager" fetchPriority="high" decoding="async" />
                        </div>
                        <div className="flex items-center justify-between gap-3 px-3 py-3">
                            <span className="min-w-0">
                                <span className="block text-[10px] font-bold text-muted">تازه در گالری</span>
                                <span className="mt-1 block truncate text-sm font-bold">{hero.title}</span>
                                <span className="mt-0.5 block truncate text-xs text-muted">{hero.artist?.display_name}</span>
                            </span>
                            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-surface-2 text-ink"><ArrowLeft size={17}/></span>
                        </div>
                    </Link>
                ) : (
                    <div className="home-feature overflow-hidden rounded-2xl border border-border bg-surface-2 p-3">
                        <Skeleton className="aspect-[4/5] w-full rounded-xl" />
                    </div>
                )}
            </section>

            <section className="home-categories" aria-label="دسته‌بندی‌های آثار">
                <div className="mb-4 flex items-center justify-between gap-3">
                    <h2 className="text-sm font-extrabold">کاوش بر اساس دسته</h2>
                    <Link to="/artworks" className="text-xs font-bold text-terracotta-strong no-underline">همه دسته‌ها</Link>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {categoriesQuery.isPending ? [0,1,2,3,4].map((item) => <Skeleton key={item} className="h-10 w-24 shrink-0 rounded-full"/>)
                        : categories.slice(0, 12).map((category) => (
                            <Link key={category.id} to={'/artworks?category=' + encodeURIComponent(category.slug)} className="inline-flex min-h-10 shrink-0 items-center rounded-full border border-border bg-paper px-4 text-xs font-semibold text-ink no-underline transition-colors hover:border-terracotta hover:bg-accent-surface">
                                {category.name}
                            </Link>
                        ))}
                </div>
            </section>

            <section className="home-feed" aria-labelledby="home-recent-heading">
                <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <p className="text-xs font-bold text-terracotta-strong">تازه‌منتشرشده‌ها</p>
                        <h2 id="home-recent-heading" className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">تازه در گالری</h2>
                        <p className="mt-2 text-xs leading-6 text-muted">آثار تأییدشده‌ای که به‌تازگی به مجموعه راد آرت پیوسته‌اند.</p>
                    </div>
                    <Link to="/artworks" className="inline-flex min-h-10 items-center gap-1 text-xs font-bold text-terracotta-strong no-underline">دیدن همه آثار <ArrowLeft size={14}/></Link>
                </div>
                {error ? <ErrorState title="دریافت محتوای گالری ممکن نشد" description="برای دریافت دوباره تلاش کنید." onRetry={() => artworksQuery.refetch()} />
                    : loading ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[0,1,2,3,4,5].map((item) => <ArtworkCardSkeleton key={item}/>)}</div>
                    : recentWorks.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{recentWorks.map((item) => <ArtworkCard key={item.id} artwork={item}/>)}</div>
                    : <EmptyState title="هنوز اثر تازه‌ای برای نمایش نیست" description="آثار پس از تأیید در این بخش قرار می‌گیرند."/>}
            </section>

            <section className="home-creators" aria-labelledby="home-artists-heading">
                <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <p className="text-xs font-bold text-terracotta-strong">جامعه خلاق</p>
                        <h2 id="home-artists-heading" className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">هنرمندان راد آرت</h2>
                        <p className="mt-2 text-xs leading-6 text-muted">با خالق آثار آشنا شوید و پورتفولیوی عمومی او را ببینید.</p>
                    </div>
                    <Link to="/artists" className="inline-flex min-h-10 items-center gap-1 text-xs font-bold text-terracotta-strong no-underline">همه هنرمندان <ArrowLeft size={14}/></Link>
                </div>
                {artistsQuery.isPending ? <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{[0,1,2].map((item) => <ArtistCardSkeleton key={item}/>)}</div>
                    : artists.length ? <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{spotlightArtists.map((artist) => <ArtistCard key={artist.id} artist={artist}/>)}</div>
                    : <EmptyState title="هنرمندی برای نمایش وجود ندارد" description="پروفایل‌های عمومی هنرمندان در این بخش نمایش داده می‌شوند."/>}
            </section>

            {(collections.length > 0 || featuredArtists.length > 0) && (
                <section className="home-collections" aria-labelledby="home-collections-heading">
                    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                        <div>
                            <p className="text-xs font-bold text-terracotta-strong">انتخاب سردبیر</p>
                            <h2 id="home-collections-heading" className="mt-1 text-2xl font-black tracking-tight">مجموعه‌های منتخب</h2>
                        </div>
                        <Link to="/collections" className="text-xs font-bold text-terracotta-strong no-underline">همه مجموعه‌ها</Link>
                    </div>
                    {collections.length > 0 && <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {collections.slice(0,3).map((item) => <Link key={item.id} to={'/collections/' + item.slug} className="group rounded-2xl border border-border bg-paper p-5 text-ink no-underline transition-colors hover:border-terracotta">
                            <span className="text-[11px] font-bold text-terracotta-strong">{Number(item.artwork_count ?? 0).toLocaleString('fa-IR')} اثر منتخب</span>
                            <h3 className="mt-3 text-lg font-extrabold">{item.title}</h3>
                            <p className="mt-2 line-clamp-3 text-xs leading-7 text-muted">{item.intro || 'انتخابی از آثار تأییدشده هنرمندان راد آرت.'}</p>
                            <span className="mt-5 inline-flex items-center gap-1 text-xs font-bold text-terracotta-strong">مشاهده مجموعه <ArrowLeft size={14}/></span>
                        </Link>)}
                    </div>}
                    {featuredArtists.length > 0 && <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {featuredArtists.slice(0,3).filter((item) => item.artist?.slug).map((item) => <Link key={item.id} to={'/artists/' + item.artist.slug} className="rounded-2xl border border-border bg-paper p-5 text-ink no-underline hover:border-terracotta">
                            <span className="text-[11px] font-bold text-terracotta-strong">هنرمند منتخب</span>
                            <h3 className="mt-2 text-base font-extrabold">{item.artist.display_name}</h3>
                            <p className="mt-2 line-clamp-3 text-xs leading-7 text-muted">{item.editorial_intro || item.artist.bio || 'پورتفولیوی عمومی این هنرمند را ببینید.'}</p>
                        </Link>)}
                    </div>}
                </section>
            )}
        </main>
    );
}
