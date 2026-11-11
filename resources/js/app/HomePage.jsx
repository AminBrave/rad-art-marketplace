import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { ArtworkCard, ArtistCard, ArtworkCardSkeleton, ArtistCardSkeleton, EmptyState, ErrorState } from '../components/ui';

export default function HomePage() {
    const [heroImageFailed, setHeroImageFailed] = useState(false);

    const artworksQuery = useQuery({
        queryKey: ['home', 'artworks'],
        queryFn: async ({ signal }) => {
            const { data } = await axios.get('/api/v1/artworks', {
                params: { per_page: 7, sort: 'newest' },
                signal,
            });
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
            const { data } = await axios.get('/api/v1/artists', { params: { per_page: 3 }, signal });
            return data.data ?? [];
        },
        staleTime: 60_000,
    });
    const collectionsQuery = useQuery({
        queryKey: ['home', 'collections'],
        queryFn: async ({ signal }) => {
            const { data } = await axios.get('/api/v1/collections', { params: { per_page: 3 }, signal });
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
    const loading = artworksQuery.isPending || categoriesQuery.isPending || artistsQuery.isPending
        || (artworksQuery.isFetching && !artworksQuery.data);
    const error = artworksQuery.isError && !artworksQuery.data && !loading && !artworksQuery.isFetching;
    const hero = artworks[0];
    useEffect(() => setHeroImageFailed(false), [hero?.id]);
    const recentWorks = artworks.slice(1, 7);
    const spotlight = artists[0];

    return (
        <main className="overflow-hidden" dir="rtl">
            <section className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[1fr_.9fr] lg:gap-16 lg:px-10 lg:py-24">
                <div className="max-w-2xl">
                    <p className="mb-6 inline-flex items-center gap-3 text-xs font-bold tracking-wide text-primary"><span className="h-px w-10 bg-primary" />گالری هنر مستقل معاصر</p>
                    <h1 className="text-4xl font-black leading-[1.55] tracking-tight sm:text-5xl lg:text-6xl">هنر را کشف کنید؛ <span className="text-primary">فراتر از قاب.</span></h1>
                    <p className="mt-6 max-w-xl text-base leading-9 text-muted-foreground sm:text-lg">راد آرت فضایی برای دیدن آثار تأییدشده، شناخت جهان هنرمندان مستقل و آغاز ارتباطی مستقیم درباره هنر است.</p>
                    <div className="mt-9 flex flex-wrap gap-3">
                        <Link to="/artworks" className="bg-primary px-7 py-3.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary">ورود به گالری آثار</Link>
                        <Link to="/artists" className="border border-border px-7 py-3.5 text-sm font-bold transition-colors hover:border-ring">شناخت هنرمندان</Link>
                    </div>
                    <p className="mt-8 text-xs leading-6 text-muted-foreground">نمایش عمومی فقط برای آثار تأییدشده و پروفایل‌های عمومی فعال است.</p>
                </div>
                <div className="relative mx-auto w-full max-w-xl">
                    <div aria-hidden="true" className="absolute -left-4 -top-4 h-24 w-24 border border-border" />
                    {hero ? (
                        <Link to={'/artworks/' + hero.slug} className="group relative block bg-muted p-3">
                            <div className="aspect-[4/5] overflow-hidden bg-card">
                                {heroImageFailed ? <div role="img" aria-label={`تصویر اثر ${hero.title} در دسترس نیست`} className="grid h-full w-full place-items-center bg-muted p-8 text-center text-sm leading-7 text-muted-foreground">تصویر این اثر در حال حاضر در دسترس نیست.</div> : <img src={hero.image_url} alt={hero.title} onError={() => setHeroImageFailed(true)} loading="eager" fetchpriority="high" decoding="async" className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.02]" />}
                            </div>
                            <div className="flex items-center justify-between gap-4 px-2 py-4">
                                <div><p className="text-xs text-muted-foreground">تازه در گالری</p><p className="mt-1 font-bold">{hero.title}</p><p className="mt-1 text-xs text-muted-foreground">{hero.artist?.display_name}</p></div>
                                <span className="shrink-0 text-sm font-bold text-primary">مشاهده اثر ←</span>
                            </div>
                        </Link>
                    ) : (
                        <div className="relative aspect-[4/5] overflow-hidden bg-sand p-8"><div className="absolute inset-8 border border-white/70" /><div className="absolute left-[12%] top-[12%] h-[48%] w-[48%] rounded-full bg-primary" /><div className="absolute bottom-[12%] right-[10%] h-[58%] w-[48%] rounded-t-full bg-olive" /><div className="absolute bottom-8 left-8 text-xs font-bold tracking-[.25em] text-foreground">ART / PEOPLE / STORIES</div></div>
                    )}
                </div>
            </section>

            <section className="border-y border-border bg-muted">
                <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:grid-cols-3 sm:px-8 lg:px-10">
                    {[['۰۱ / کشف', 'دیدن با نگاه تازه', 'در میان آثار تأییدشده جست‌وجو کنید و دسته‌ها و تکنیک‌های گوناگون را بشناسید.'], ['۰۲ / شناخت', 'آشنایی با خالق اثر', 'پروفایل عمومی هنرمندان، معرفی و نمونه‌کارهای تأییدشده آن‌ها را ببینید.'], ['۰۳ / ارتباط', 'گفت‌وگو درباره هنر', 'خریداران ثبت‌نام‌شده می‌توانند درباره یک اثر یا هنرمند درخواست ارتباط بفرستند.']].map(([eyebrow, title, body]) => (
                        <div key={eyebrow}><span className="text-xs font-bold text-primary">{eyebrow}</span><h2 className="mt-3 text-xl font-extrabold">{title}</h2><p className="mt-2 text-sm leading-7 text-muted-foreground">{body}</p></div>
                    ))}
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10">
                <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold text-primary">تازه‌رسیده‌ها</p><h2 className="mt-2 text-3xl font-black">تازه در گالری</h2><p className="mt-2 text-sm text-muted-foreground">آخرین آثاری که برای نمایش عمومی تأیید شده‌اند.</p></div><Link to="/artworks" className="text-sm font-bold text-primary underline">همه آثار</Link></div>
                {error ? <ErrorState className="mt-8" title="دریافت محتوای گالری ممکن نشد" description="برای دریافت دوباره تلاش کنید." onRetry={() => artworksQuery.refetch()} /> : loading ? <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2, 3, 4, 5].map((item) => <ArtworkCardSkeleton key={item} />)}</div> : recentWorks.length ? <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{recentWorks.map((item) => <ArtworkCard key={item.id} artwork={item} />)}</div> : <EmptyState className="mt-8" title="هنوز اثر دیگری برای نمایش نیست" description="آثار تازه پس از تأیید در این بخش قرار می‌گیرند." />}
            </section>

            <section className="border-y border-border bg-card">
                <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10">
                    <div><p className="text-xs font-bold text-primary">مسیرهای موضوعی</p><h2 className="mt-2 text-2xl font-black">از کجا شروع کنیم؟</h2><p className="mt-2 text-sm leading-7 text-muted-foreground">دسته‌بندی‌های فعال گالری را مرور کنید و به جهان هر شاخه هنری وارد شوید.</p></div>
                    <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {loading ? [0, 1, 2, 3].map((item) => <span key={item} aria-hidden="true" className="app-skeleton h-24" />) : categories.length ? categories.slice(0, 8).map((category, index) => <Link key={category.id} to={'/artworks?category=' + encodeURIComponent(category.slug)} className="group flex min-h-24 items-end justify-between border border-border bg-background p-5 transition-colors hover:border-ring hover:bg-muted"><span><span className="block text-xs text-muted-foreground">۰{index + 1}</span><span className="mt-2 block font-bold text-foreground">{category.name}</span></span><span aria-hidden="true" className="text-xl text-primary transition-transform group-hover:-translate-x-1">←</span></Link>) : <p className="text-sm text-muted-foreground">دسته‌بندی فعالی برای نمایش وجود ندارد.</p>}
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10">
                <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold text-primary">چهره‌های گالری</p><h2 className="mt-2 text-3xl font-black">هنرمندان راد آرت</h2><p className="mt-2 text-sm text-muted-foreground">با هنرمندانی آشنا شوید که پروفایل عمومی خود را منتشر کرده‌اند.</p></div><Link to="/artists" className="text-sm font-bold text-primary underline">دیدن همه هنرمندان</Link></div>
                {loading ? <div className="mt-8 grid gap-4 sm:grid-cols-3">{[0, 1, 2].map((item) => <ArtistCardSkeleton key={item} />)}</div> : artists.length ? <div className="mt-8 grid gap-4 sm:grid-cols-3">{artists.map((artist) => <ArtistCard key={artist.id} artist={artist} />)}</div> : <p className="mt-6 text-sm text-muted-foreground">هنرمندان دارای پروفایل عمومی در این بخش معرفی می‌شوند.</p>}
                {spotlight && <div className="mt-8 flex flex-col gap-4 border border-border bg-muted p-6 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-bold text-primary">نقطه شروع پیشنهادی</p><h3 className="mt-2 text-xl font-black">{spotlight.display_name}</h3><p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">{spotlight.bio || 'پورتفولیوی عمومی این هنرمند را ببینید و با آثار تأییدشده او آشنا شوید.'}</p></div><Link to={'/artists/' + spotlight.slug} className="shrink-0 text-sm font-bold text-primary underline">ورود به پورتفولیو</Link></div>}
            </section>

            {(collections.length > 0 || featuredArtists.length > 0) && <section className="border-y border-border bg-muted"><div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10">
                {collections.length > 0 && <div><div className="flex items-end justify-between gap-4"><div><p className="text-xs font-bold text-primary">روایت‌های منتخب</p><h2 className="mt-2 text-2xl font-black">مجموعه‌های سردبیر</h2></div><Link to="/collections" className="text-sm font-bold text-primary underline">همه مجموعه‌ها</Link></div><div className="mt-6 grid gap-4 sm:grid-cols-3">{collections.slice(0, 3).map((item) => <Link key={item.id} to={'/collections/' + item.slug} className="border border-border bg-card p-5 hover:border-ring"><p className="text-xs text-primary">{item.artwork_count} اثر منتخب</p><h3 className="mt-2 font-black">{item.title}</h3><p className="mt-2 line-clamp-3 text-sm leading-7 text-muted-foreground">{item.intro || 'انتخابی از آثار تأییدشده راد آرت'}</p></Link>)}</div></div>}
                {featuredArtists.length > 0 && <div className="mt-10"><p className="text-xs font-bold text-primary">چهره‌های منتخب</p><div className="mt-4 grid gap-4 sm:grid-cols-3">{featuredArtists.slice(0, 3).map((item) => <Link key={item.id} to={'/artists/' + item.artist.slug} className="border border-border bg-card p-5"><h3 className="font-black">{item.artist.display_name}</h3><p className="mt-2 text-sm leading-7 text-muted-foreground">{item.editorial_intro || item.artist.bio || 'با پورتفولیوی این هنرمند آشنا شوید.'}</p></Link>)}</div></div>}
            </div></section>}

            <section className="bg-primary text-primary-foreground">
                <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-5 py-14 sm:px-8 md:flex-row md:items-center lg:px-10">
                    <div><p className="text-xs font-bold text-primary-foreground/70">دعوت به مشارکت</p><h2 className="mt-2 text-2xl font-black">جهان هنری خود را با دیگران به اشتراک بگذارید.</h2><p className="mt-3 max-w-2xl text-sm leading-7 text-primary-foreground/70">هنرمندان می‌توانند حساب بسازند، پروفایل خود را تکمیل کنند و آثارشان را برای بررسی ارسال کنند.</p></div>
                    <Link to="/register" className="shrink-0 bg-card px-6 py-3 font-bold text-foreground">شروع به‌عنوان هنرمند</Link>
                </div>
            </section>
        </main>
    );
}
