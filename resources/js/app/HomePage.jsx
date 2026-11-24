import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ArrowLeft, ArrowUpLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ArtworkCard, ArtistCard, ArtworkCardSkeleton, ArtistCardSkeleton, EmptyState, ErrorState, MediaImage, Skeleton, Container, Card } from '../components/ui';

const editorialSteps = [
    { number: '01', title: 'کشف', description: 'در میان آثار تأییدشده جست‌وجو کنید و مسیرهای تازه‌ای برای دیدن پیدا کنید.' },
    { number: '02', title: 'شناخت', description: 'با هنرمندان مستقل، نگاه شخصی و جهان تصویری آن‌ها آشنا شوید.' },
    { number: '03', title: 'ارتباط', description: 'برای گفت‌وگو درباره یک اثر یا هنرمند، مسیر ارتباط را آغاز کنید.' },
];

function SectionHeading({ id, eyebrow, title, description, to, linkLabel }) {
    return (
        <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
                <p className="text-[11px] font-extrabold tracking-[.12em] text-terracotta-strong">{eyebrow}</p>
                <h2 id={id} className="mt-2 text-2xl font-black leading-tight tracking-tight sm:text-3xl">{title}</h2>
                {description && <p className="mt-2 max-w-2xl text-sm leading-7 text-muted">{description}</p>}
            </div>
            {to && (
                <Link to={to} className="inline-flex min-h-11 shrink-0 items-center gap-2 self-start text-sm font-bold text-terracotta-strong underline-offset-4 transition-colors hover:text-ink hover:underline sm:self-auto">
                    {linkLabel}
                    <ArrowLeft size={16} aria-hidden="true" />
                </Link>
            )}
        </div>
    );
}

export default function HomePage() {
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
    const recentWorks = artworks.slice(1, 7);
    const spotlight = artists[0];

    return (
        <div className="w-full min-w-0" dir="rtl">
            <section aria-labelledby="home-hero-title" className="relative isolate border-b border-[color:var(--rd-hero-line)] rd-hero-surface">
                <Container className="pb-16 pt-10 sm:pb-20 sm:pt-16 lg:pb-24 lg:pt-20">
                    <div className="mb-8 flex items-center justify-between border-y border-[color:var(--rd-hero-line)] py-3.5 text-[10px] font-extrabold tracking-[.18em] text-[color:var(--rd-hero-muted)] sm:text-xs">
                        <span>گالری هنر مستقل معاصر</span>
                        <span dir="ltr" className="font-latin">RAD ART / DISCOVER &amp; CONNECT</span>
                    </div>
                    <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(20rem,.9fr)] lg:gap-20">
                        <div className="relative z-10 order-2 max-w-2xl py-2 lg:order-1 lg:py-10">
                            <p className="mb-5 flex items-center gap-3 text-xs font-extrabold text-[color:var(--rd-hero-accent)]">
                                <span className="h-px w-9 bg-[color:var(--rd-hero-accent)]" />
                                هنر معاصر، از نگاه مستقل
                            </p>
                            <h1 id="home-hero-title" className="max-w-2xl text-[2.55rem] font-black leading-[1.38] tracking-[-.055em] text-[color:var(--rd-hero-foreground)] sm:text-6xl sm:leading-[1.24] lg:text-[5rem]">
                                هر اثر،
                                <span className="block text-[color:var(--rd-hero-accent)]">آغاز یک نگاه تازه.</span>
                            </h1>
                            <p className="mt-7 max-w-xl text-base leading-9 text-[color:var(--rd-hero-muted)] sm:text-lg">
                                راد آرت جایی برای مکث، کشف آثار هنری مستقل، شناخت هنرمندان و شکل‌گرفتن گفت‌وگوهایی تازه درباره هنر است.
                            </p>
                            <div className="mt-8 flex flex-wrap items-center gap-3">
                                <Link to="/artworks" className="inline-flex min-h-12 items-center justify-center gap-3 bg-[color:var(--rd-hero-foreground)] px-6 text-sm font-bold text-[color:var(--rd-hero-background)] no-underline transition-colors hover:bg-[color:var(--rd-hero-accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">
                                    ورود به گالری آثار
                                    <ArrowLeft size={17} aria-hidden="true" />
                                </Link>
                                <Link to="/artists" className="inline-flex min-h-12 items-center justify-center border border-[color:var(--rd-hero-line)] bg-transparent px-6 text-sm font-bold text-[color:var(--rd-hero-foreground)] no-underline transition-colors hover:border-[color:var(--rd-hero-accent)] hover:text-[color:var(--rd-hero-accent)]">
                                    آشنایی با هنرمندان
                                </Link>
                            </div>
                            <p className="mt-7 text-xs leading-6 text-[color:var(--rd-hero-muted)]">نمایش عمومی به آثار تأییدشده و پروفایل‌های عمومی محدود است.</p>
                        </div>

                        <div className="relative order-1 mx-auto w-full max-w-2xl lg:order-2 lg:max-w-[28rem] lg:justify-self-center">
                            <div aria-hidden="true" className="rd-shine absolute -left-3 -top-3 hidden h-24 w-24 border border-sand sm:block lg:-left-5 lg:-top-5 lg:h-32 lg:w-32" style={{ '--rd-shine-index': 0 }} />
                            <div aria-hidden="true" className="rd-shine absolute -bottom-4 -right-4 hidden h-28 w-28 bg-surface-muted sm:block lg:-bottom-6 lg:-right-6 lg:h-40 lg:w-40" style={{ '--rd-shine-index': 1 }} />
                            {hero ? (
                                <Link to={'/artworks/' + hero.slug} className="group relative block border border-[color:var(--rd-hero-line)] bg-paper p-2 shadow-soft sm:p-3">
                                    <div className="rd-shine relative aspect-[3/4] w-full overflow-hidden bg-[linear-gradient(145deg,var(--color-surface-muted),var(--color-paper))]" style={{ '--rd-shine-index': 0 }}>
                                        <MediaImage
                                            src={hero.image_url}
                                            alt={hero.title}
                                            className="h-full w-full"
                                            imageClassName="object-cover transition-transform duration-700 group-hover:scale-[1.025]"
                                            loading="eager"
                                            fetchPriority="high"
                                            decoding="async"
                                        />
                                        <span className="absolute right-4 top-4 bg-[color:var(--rd-hero-background)] px-3 py-2 text-[10px] font-bold text-[color:var(--rd-hero-foreground)] backdrop-blur sm:right-5 sm:top-5 sm:text-xs">در گالری راد آرت</span>
                                    </div>
                                    <div className="flex flex-wrap items-center justify-between gap-3 px-2 pb-1 pt-4 sm:px-3">
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-bold text-terracotta-strong">تازه در گالری</p>
                                            <p className="mt-1 truncate text-sm font-extrabold text-ink sm:text-base">{hero.title}</p>
                                            <p className="mt-1 truncate text-xs text-muted">{hero.artist?.display_name || 'هنرمند راد آرت'}</p>
                                        </div>
                                        <span className="inline-flex min-h-10 shrink-0 items-center gap-2 text-xs font-bold text-terracotta-strong">
                                            مشاهده اثر
                                            <ArrowUpLeft size={16} aria-hidden="true" />
                                        </span>
                                    </div>
                                </Link>
                            ) : (
                                <div className="relative aspect-[3/4] w-full overflow-hidden bg-[linear-gradient(135deg,var(--rd-hero-background-alt),var(--rd-surface-muted))]">
                                    <div aria-hidden="true" className="absolute inset-5 border border-[color:var(--rd-hero-line)] sm:inset-8" />
                                    <div aria-hidden="true" className="rd-shine absolute left-[12%] top-[12%] h-[48%] w-[48%] bg-[color:var(--rd-hero-accent)]" style={{ '--rd-shine-index': 2 }} />
                                    <div aria-hidden="true" className="rd-shine absolute bottom-[12%] right-[10%] h-[58%] w-[48%] bg-[color:var(--rd-hero-background)]" style={{ '--rd-shine-index': 3 }} />
                                    <span className="absolute bottom-8 left-8 font-latin text-[10px] font-bold tracking-[.25em] text-[color:var(--rd-hero-foreground)]">ART / PEOPLE / STORIES</span>
                                </div>
                            )}
                        </div>
                    </div>
                </Container>
            </section>

            <section aria-label="چطور در راد آرت کشف کنیم" className="bg-surface-muted py-16 sm:py-24">
                <Container width="wide" className="grid gap-4 sm:grid-cols-3" dir="rtl">
                    {editorialSteps.map((step) => (
                        <Card
                            as="article"
                            key={step.number}
                            className="grid min-w-0 grid-cols-[3rem_minmax(0,1fr)] items-start gap-4 bg-paper p-5 sm:p-6"
                        >
                            <span dir="ltr" className="pt-1 font-latin text-xs font-bold tracking-widest text-terracotta-strong">{step.number}</span>
                            <div className="min-w-0">
                                <h2 className="text-lg font-extrabold text-ink">{step.title}</h2>
                                <p className="mt-2 text-sm leading-7 text-muted">{step.description}</p>
                            </div>
                        </Card>
                    ))}
                </Container>
            </section>

            <Container as="section" width="wide" aria-labelledby="recent-works-title" className="py-16 sm:py-24">
                <SectionHeading
                    id="recent-works-title"
                    eyebrow="THE GALLERY / 01"
                    title="تازه در گالری"
                    description="آثاری که به‌تازگی برای نمایش عمومی تأیید شده‌اند."
                    to="/artworks"
                    linkLabel="دیدن همه آثار"
                />
                {error ? (
                    <ErrorState className="mt-8" title="دریافت محتوای گالری ممکن نشد" description="برای دریافت دوباره تلاش کنید." onRetry={() => artworksQuery.refetch()} />
                ) : loading ? (
                    <div className="mt-8 grid gap-x-5 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2, 3, 4, 5].map((item) => <ArtworkCardSkeleton key={item} />)}</div>
                ) : recentWorks.length ? (
                    <div className="mt-8 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">{recentWorks.map((item) => <ArtworkCard key={item.id} artwork={item} />)}</div>
                ) : (
                    <EmptyState className="mt-8" title="هنوز اثر دیگری برای نمایش نیست" description="آثار تازه پس از تأیید در این بخش قرار می‌گیرند." />
                )}
            </Container>

            <section aria-labelledby="categories-title" className="border-y border-border bg-paper">
                <Container className="py-16 sm:py-24">
                    <SectionHeading
                        id="categories-title"
                        eyebrow="FIND YOUR PERSPECTIVE / 02"
                        title="از کجا شروع کنیم؟"
                        description="دسته‌بندی‌های فعال گالری را مرور کنید و به جهان هر شاخه هنری وارد شوید."
                    />
                    <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {loading ? [0, 1, 2, 3].map((item) => <Skeleton key={item} height={null} className="h-28 w-full " />) : categories.length ? categories.slice(0, 8).map((category, index) => (
                            <Link key={category.id} to={'/artworks?category=' + encodeURIComponent(category.slug)} dir="rtl" className="group flex min-h-32 items-center gap-4 border border-border bg-canvas p-5 text-right no-underline transition-colors hover:border-terracotta hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">
                                <span className="min-w-0 flex-1">
                                    <span dir="ltr" className="block font-latin text-[10px] font-bold tracking-widest text-terracotta-strong">0{index + 1}</span>
                                    <span className="mt-2 block break-words font-bold text-ink">{category.name}</span>
                                </span>
                                <ArrowUpLeft size={18} className="shrink-0 text-muted transition-transform group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-terracotta-strong" aria-hidden="true" />
                            </Link>
                        )) : <p className="text-sm text-muted">دسته‌بندی فعالی برای نمایش وجود ندارد.</p>}
                    </div>
                </Container>
            </section>

            <Container as="section" width="wide" aria-labelledby="artists-title" className="py-16 sm:py-24">
                <SectionHeading
                    id="artists-title"
                    eyebrow="THE PEOPLE / 03"
                    title="هنرمندان، فراتر از آثار"
                    description="با هنرمندانی آشنا شوید که پروفایل عمومی خود را در راد آرت منتشر کرده‌اند."
                    to="/artists"
                    linkLabel="دیدن همه هنرمندان"
                />
                {loading ? (
                    <div className="mt-8 grid gap-4 sm:grid-cols-3">{[0, 1, 2].map((item) => <ArtistCardSkeleton key={item} />)}</div>
                ) : artists.length ? (
                    <div className="mt-8 grid gap-4 sm:grid-cols-3">{artists.map((artist) => <ArtistCard key={artist.id} artist={artist} />)}</div>
                ) : (
                    <p className="mt-6 text-sm text-muted">هنرمندان دارای پروفایل عمومی در این بخش معرفی می‌شوند.</p>
                )}
                {spotlight && (
                    <Card
                        as="article"
                        className="rd-hero-surface mt-8 grid min-w-0 overflow-hidden border border-[color:var(--rd-hero-line)] sm:grid-cols-[minmax(0,1fr)_15rem]"
                        dir="rtl"
                    >
                        <div className="flex min-w-0 flex-col justify-center p-6 sm:p-8 lg:p-10">
                            <p className="text-[10px] font-extrabold tracking-[.14em] text-[color:var(--rd-hero-accent)]">ARTIST SPOTLIGHT / هنرمند منتخب</p>
                            <h3 className="mt-3 break-words text-2xl font-black leading-heading text-[color:var(--rd-hero-foreground)] sm:text-3xl">{spotlight.display_name}</h3>
                            {spotlight.city && <p className="mt-2 text-xs font-semibold text-[color:var(--rd-hero-muted)]">{spotlight.city}</p>}
                            <p className="mt-4 max-w-3xl text-sm leading-8 text-[color:var(--rd-hero-muted)]">{spotlight.bio || 'پورتفولیوی عمومی این هنرمند را ببینید و با آثار تأییدشده او آشنا شوید.'}</p>
                            <Link to={'/artists/' + spotlight.slug} className="mt-6 inline-flex min-h-11 w-fit items-center gap-2 border border-[color:var(--rd-hero-line)] px-4 py-2 text-sm font-bold text-[color:var(--rd-hero-foreground)] no-underline transition-colors hover:border-[color:var(--rd-hero-accent)] hover:bg-[color:var(--rd-hero-foreground)] hover:text-[color:var(--rd-hero-background)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">
                                ورود به پورتفولیو
                                <ArrowLeft size={16} aria-hidden="true" />
                            </Link>
                        </div>
                        <div className="relative grid min-h-48 place-items-center border-t border-[color:var(--rd-hero-line)] bg-[color:var(--rd-hero-background-alt)] p-8 text-[color:var(--rd-hero-foreground)] sm:border-t-0 sm:border-s">
                            <span aria-hidden="true" className="absolute start-5 top-4 font-latin text-[10px] font-bold tracking-[.2em] text-[color:var(--rd-hero-muted)]">RAD / PEOPLE</span>
                            <span aria-hidden="true" className="grid h-28 w-28 place-items-center border border-[color:var(--rd-hero-line)] bg-[color:var(--rd-hero-background)] text-5xl font-black text-[color:var(--rd-hero-accent)] sm:h-36 sm:w-36">
                                {(spotlight.display_name || 'ه').trim().slice(0, 1)}
                            </span>
                            <span aria-hidden="true" className="absolute bottom-4 end-5 font-latin text-[10px] font-bold tracking-widest text-[color:var(--rd-hero-muted)]">FEATURED ARTIST</span>
                        </div>
                    </Card>
                )}
            </Container>

            {(collections.length > 0 || featuredArtists.length > 0) && (
                <section aria-label="مجموعه‌ها و هنرمندان منتخب" className="border-y border-border bg-surface-muted">
                    <Container className="py-16 sm:py-24">
                        {collections.length > 0 && (
                            <div>
                                <SectionHeading
                                    id="collections-title"
                                    eyebrow="CURATED STORIES / 04"
                                    title="روایت‌هایی از نگاه سردبیر"
                                    description="مجموعه‌هایی برای دیدن آثار در کنار یکدیگر و کشف ارتباط‌های تازه."
                                    to="/collections"
                                    linkLabel="همه مجموعه‌ها"
                                />
                                <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {collections.slice(0, 3).map((item, index) => (
                                        <Link key={item.id} to={'/collections/' + item.slug} className="group flex min-h-56 flex-col border border-border bg-paper p-6 no-underline transition-colors hover:border-terracotta">
                                            <span dir="ltr" className="font-latin text-[10px] font-bold tracking-widest text-terracotta-strong">SELECTION / 0{index + 1}</span>
                                            <div className="mt-auto pt-10">
                                                <p className="text-xs text-muted">{item.artwork_count} اثر منتخب</p>
                                                <h3 className="mt-2 text-xl font-black text-ink">{item.title}</h3>
                                                <p className="mt-2 line-clamp-3 text-sm leading-7 text-muted">{item.intro || 'انتخابی از آثار تأییدشده راد آرت'}</p>
                                                <span className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-terracotta-strong">مشاهده مجموعه <ArrowLeft size={14} aria-hidden="true" /></span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                        {featuredArtists.length > 0 && (
                            <div className={collections.length > 0 ? 'mt-14 border-t border-border pt-10' : ''}>
                                <p className="text-[10px] font-extrabold tracking-[.14em] text-terracotta-strong">SELECTED VOICES</p>
                                <h2 className="mt-2 text-2xl font-black">صداهای منتخب</h2>
                                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                                    {featuredArtists.slice(0, 3).map((item) => (
                                        <Link key={item.id} to={'/artists/' + item.artist.slug} className="border-s-2 border-sand bg-paper p-5 no-underline transition-colors hover:border-terracotta">
                                            <h3 className="font-black text-ink">{item.artist.display_name}</h3>
                                            <p className="mt-2 text-sm leading-7 text-muted">{item.editorial_intro || item.artist.bio || 'با پورتفولیوی این هنرمند آشنا شوید.'}</p>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </Container>
                </section>
            )}

            <section className="rd-hero-surface border-y border-[color:var(--rd-hero-line)]">
                <Container className="grid gap-8 py-16 sm:py-24 md:grid-cols-[1fr_auto] md:items-center">
                    <div>
                        <p className="text-[10px] font-extrabold tracking-[.16em] text-[color:var(--rd-hero-accent)]">BECOME PART OF THE STORY</p>
                        <h2 className="mt-3 max-w-3xl text-2xl font-black leading-relaxed text-[color:var(--rd-hero-foreground)] sm:text-3xl">جهان هنری خود را با دیگران به اشتراک بگذارید.</h2>
                        <p className="mt-3 max-w-2xl text-sm leading-8 text-[color:var(--rd-hero-muted)]">هنرمندان می‌توانند حساب بسازند، پروفایل خود را تکمیل کنند و آثارشان را برای بررسی ارسال کنند.</p>
                    </div>
                    <Link to="/register" className="inline-flex min-h-12 items-center justify-center gap-3 bg-[color:var(--rd-hero-foreground)] px-6 text-sm font-bold text-[color:var(--rd-hero-background)] no-underline transition-colors hover:bg-[color:var(--rd-hero-accent)]">
                        شروع به‌عنوان هنرمند
                        <ArrowUpLeft size={17} aria-hidden="true" />
                    </Link>
                </Container>
            </section>
        </div>
    );
}
