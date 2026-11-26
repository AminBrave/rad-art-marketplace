import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ArrowLeft, ArrowUpLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from './LanguageContext';
import { ArtworkCard, ArtistCard, ArtworkCardSkeleton, ArtistCardSkeleton, EmptyState, ErrorState, MediaImage, Skeleton, Container, Card, DiscoveryHero } from '../components/ui';
import { localizedValue } from '../utils/localizedContent';

const editorialSteps = [
    { number: '01', title: 'کشف', description: 'در میان آثار تأییدشده جست‌وجو کنید و مسیرهای تازه‌ای برای دیدن پیدا کنید.' },
    { number: '02', title: 'شناخت', description: 'با هنرمندان مستقل، نگاه شخصی و جهان تصویری آن‌ها آشنا شوید.' },
    { number: '03', title: 'ارتباط', description: 'برای گفت‌وگو درباره یک اثر یا هنرمند، مسیر ارتباط را آغاز کنید.' },
];

function SectionHeading({ id, eyebrow, title, description, to, linkLabel }) {
    const { t } = useLanguage();
    return (
        <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
                <p className="text-[11px] font-extrabold tracking-[.12em] text-terracotta-strong">{t(eyebrow)}</p>
                <h2 id={id} className="mt-2 text-2xl font-black leading-tight tracking-tight sm:text-3xl">{t(title)}</h2>
                {description && <p className="mt-2 max-w-2xl text-sm leading-7 text-muted">{t(description)}</p>}
            </div>
            {to && (
                <Link to={to} className="inline-flex min-h-11 shrink-0 items-center gap-2 self-start text-sm font-bold text-terracotta-strong underline-offset-4 transition-colors hover:text-ink hover:underline sm:self-auto">
                    {t(linkLabel)}
                    <ArrowLeft size={16} aria-hidden="true" />
                </Link>
            )}
        </div>
    );
}

export default function HomePage() {
    const { t, locale } = useLanguage();
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
        <div className="w-full min-w-0">
            <DiscoveryHero
                className="rd-home-hero"
                eyebrow={t('هنر معاصر، از نگاه مستقل')}
                title={<>{t('هر اثر،')} <span className="block text-[color:var(--rd-hero-accent)]">{t('آغاز یک نگاه تازه.')}</span></>}
                description={t('راد آرت جایی برای مکث، کشف آثار هنری مستقل، شناخت هنرمندان و شکل‌گرفتن گفت‌وگوهایی تازه درباره هنر است.')}
                actions={<>
                    <Link to="/artworks" className="inline-flex min-h-12 items-center justify-center gap-3 bg-[color:var(--rd-hero-foreground)] px-6 text-sm font-bold text-[color:var(--rd-hero-background)] no-underline transition-colors hover:bg-[color:var(--rd-hero-accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">
                        {t('ورود به گالری آثار')} <ArrowLeft size={17} aria-hidden="true" />
                    </Link>
                    <Link to="/artists" className="inline-flex min-h-12 items-center justify-center border border-[color:var(--rd-hero-line)] bg-transparent px-6 text-sm font-bold text-[color:var(--rd-hero-foreground)] no-underline transition-colors hover:border-[color:var(--rd-hero-accent)] hover:text-[color:var(--rd-hero-accent)]">
                        {t('آشنایی با هنرمندان')}
                    </Link>
                </>}
                media={hero ? (
                    <Link to={'/artworks/' + hero.slug} className="group relative block border border-[color:var(--rd-hero-line)] bg-paper p-2 shadow-soft sm:p-3">
                        <div className="relative aspect-[3/4] w-full overflow-hidden bg-[linear-gradient(145deg,var(--rd-surface-muted),var(--rd-surface))]">
                            <MediaImage src={hero.image_url} alt={localizedValue(hero, 'title', locale)} className="h-full w-full" imageClassName="object-cover transition-transform duration-700 group-hover:scale-[1.025]" loading="eager" fetchPriority="high" decoding="async" />
                            <span className="absolute end-4 top-4 bg-[color:var(--rd-hero-background)] px-3 py-2 text-[10px] font-bold text-[color:var(--rd-hero-foreground)] backdrop-blur sm:end-5 sm:top-5 sm:text-xs">{t('در گالری راد آرت')}</span>
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-3 px-2 pb-1 pt-4 sm:px-3">
                            <div className="min-w-0">
                                <p className="text-[10px] font-bold text-terracotta-strong">{t('تازه در گالری')}</p>
                                <p className="mt-1 truncate text-sm font-extrabold text-ink sm:text-base">{localizedValue(hero, 'title', locale)}</p>
                                <p className="mt-1 truncate text-xs text-muted">{localizedValue(hero.artist, 'display_name', locale) || t('هنرمند راد آرت')}</p>
                            </div>
                            <span className="inline-flex min-h-10 shrink-0 items-center gap-2 text-xs font-bold text-terracotta-strong">{t('مشاهده اثر')} <ArrowUpLeft size={16} aria-hidden="true" /></span>
                        </div>
                    </Link>
                ) : (
                    <div className="relative aspect-[3/4] w-full overflow-hidden border border-[color:var(--rd-hero-line)] bg-[linear-gradient(135deg,var(--rd-hero-background-alt),var(--rd-surface-muted))]">
                        <div aria-hidden="true" className="absolute inset-5 border border-[color:var(--rd-hero-line)] sm:inset-8" />
                        <div aria-hidden="true" className="absolute start-[12%] top-[12%] h-[48%] w-[48%] bg-[color:var(--rd-hero-accent)]" />
                        <div aria-hidden="true" className="absolute bottom-[12%] end-[10%] h-[58%] w-[48%] bg-[color:var(--rd-hero-background)]" />
                        <span className="absolute bottom-8 start-8 font-latin text-[10px] font-bold tracking-[.25em] text-[color:var(--rd-hero-foreground)]">ART / PEOPLE / STORIES</span>
                    </div>
                )}
            >
                <p className="text-xs leading-6 text-[color:var(--rd-hero-muted)]">{t('نمایش عمومی به آثار تأییدشده و پروفایل‌های عمومی محدود است.')}</p>
            </DiscoveryHero>

            <section aria-label="چطور در راد آرت کشف کنیم" className="bg-surface-muted py-section sm:py-section-wide">
                <Container width="wide" className="grid gap-4 sm:grid-cols-3">
                    {editorialSteps.map((step) => (
                        <Card
                            as="article"
                            key={step.number}
                            className="grid min-w-0 grid-cols-[3rem_minmax(0,1fr)] items-start gap-4 bg-paper p-5 sm:p-6"
                        >
                            <span lang="en" className="pt-1 font-latin text-xs font-bold tracking-widest text-terracotta-strong">{step.number}</span>
                            <div className="min-w-0">
                                <h2 className="text-lg font-extrabold text-ink">{t(step.title)}</h2>
                                <p className="mt-2 text-sm leading-7 text-muted">{t(step.description)}</p>
                            </div>
                        </Card>
                    ))}
                </Container>
            </section>

            <Container as="section" width="wide" aria-labelledby="recent-works-title" className="py-section sm:py-section-wide">
                <SectionHeading
                    id="recent-works-title"
                    eyebrow="THE GALLERY / 01"
                    title={t('تازه در گالری')}
                    description="آثاری که به‌تازگی برای نمایش عمومی تأیید شده‌اند."
                    to="/artworks"
                    linkLabel={t('دیدن همه آثار')}
                />
                {error ? (
                    <ErrorState className="mt-8" title={t('دریافت محتوای گالری ممکن نشد')} description={t('برای دریافت دوباره تلاش کنید.')} onRetry={() => artworksQuery.refetch()} />
                ) : loading ? (
                    <div className="mt-8 grid gap-x-5 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2, 3, 4, 5].map((item) => <ArtworkCardSkeleton key={item} />)}</div>
                ) : recentWorks.length ? (
                    <div className="mt-8 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">{recentWorks.map((item) => <ArtworkCard key={item.id} artwork={item} />)}</div>
                ) : (
                    <EmptyState className="mt-8" title={t('هنوز اثر دیگری برای نمایش نیست')} description={t('آثار تازه پس از تأیید در این بخش قرار می‌گیرند.')} />
                )}
            </Container>

            <section aria-labelledby="categories-title" className="border-y border-border bg-paper">
                <Container>
                    <SectionHeading
                        id="categories-title"
                        eyebrow="FIND YOUR PERSPECTIVE / 02"
                        title={t('از کجا شروع کنیم؟')}
                        description={t('دسته‌بندی‌های فعال گالری را مرور کنید و به جهان هر شاخه هنری وارد شوید.')}
                    />
                    <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {loading ? [0, 1, 2, 3].map((item) => <Skeleton key={item} height={null} className="h-28 w-full " />) : categories.length ? categories.slice(0, 8).map((category, index) => (
                            <Link key={category.id} to={'/artworks?category=' + encodeURIComponent(category.slug)} className="group flex min-h-32 items-center gap-4 border border-border bg-canvas p-5 text-start no-underline transition-colors hover:border-terracotta hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">
                                <span className="min-w-0 flex-1">
                                    <span lang="en" className="block font-latin text-[10px] font-bold tracking-widest text-terracotta-strong">0{index + 1}</span>
                                    <span className="mt-2 block break-words font-bold text-ink">{localizedValue(category, 'name', locale)}</span>
                                </span>
                                <ArrowUpLeft size={18} className="shrink-0 text-muted transition-transform group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-terracotta-strong" aria-hidden="true" />
                            </Link>
                        )) : <p className="text-sm text-muted">{t('دسته‌بندی فعالی برای نمایش وجود ندارد.')}</p>}
                    </div>
                </Container>
            </section>

            <Container as="section" width="wide" aria-labelledby="artists-title" className="py-section sm:py-section-wide">
                <SectionHeading
                    id="artists-title"
                    eyebrow="THE PEOPLE / 03"
                    title={t('هنرمندان، فراتر از آثار')}
                    description={t('با هنرمندانی آشنا شوید که پروفایل عمومی خود را در راد آرت منتشر کرده‌اند.')}
                    to="/artists"
                    linkLabel={t('دیدن همه هنرمندان')}
                />
                {loading ? (
                    <div className="mt-8 grid gap-4 sm:grid-cols-3">{[0, 1, 2].map((item) => <ArtistCardSkeleton key={item} />)}</div>
                ) : artists.length ? (
                    <div className="mt-8 grid gap-4 sm:grid-cols-3">{artists.map((artist) => <ArtistCard key={artist.id} artist={artist} />)}</div>
                ) : (
                    <p className="mt-6 text-sm text-muted">{t('هنرمندان دارای پروفایل عمومی در این بخش معرفی می‌شوند.')}</p>
                )}
                {spotlight && (
                    <Card
                        as="article"
                        className="rd-hero-surface mt-8 grid min-w-0 overflow-hidden border border-[color:var(--rd-hero-line)] sm:grid-cols-[minmax(0,1fr)_15rem]"
                    >
                        <div className="flex min-w-0 flex-col justify-center p-6 sm:p-8 lg:p-10">
                            <p className="text-[10px] font-extrabold tracking-[.14em] text-[color:var(--rd-hero-accent)]">ARTIST SPOTLIGHT / {t('هنرمند منتخب')}</p>
                            <h3 className="mt-3 break-words text-2xl font-black leading-heading text-[color:var(--rd-hero-foreground)] sm:text-3xl">{localizedValue(spotlight, 'display_name', locale)}</h3>
                            {localizedValue(spotlight, 'city', locale) && <p className="mt-2 text-xs font-semibold text-[color:var(--rd-hero-muted)]">{localizedValue(spotlight, 'city', locale)}</p>}
                            <p className="mt-4 max-w-3xl text-sm leading-8 text-[color:var(--rd-hero-muted)]">{localizedValue(spotlight, 'bio', locale) || t('پورتفولیوی عمومی این هنرمند را ببینید و با آثار تأییدشده او آشنا شوید.')}</p>
                            <Link to={'/artists/' + spotlight.slug} className="mt-6 inline-flex min-h-11 w-fit items-center gap-2 border border-[color:var(--rd-hero-line)] px-4 py-2 text-sm font-bold text-[color:var(--rd-hero-foreground)] no-underline transition-colors hover:border-[color:var(--rd-hero-accent)] hover:bg-[color:var(--rd-hero-foreground)] hover:text-[color:var(--rd-hero-background)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">
                                {t('ورود به پورتفولیو')}
                                <ArrowLeft size={16} aria-hidden="true" />
                            </Link>
                        </div>
                        <div className="relative grid min-h-48 place-items-center border-t border-[color:var(--rd-hero-line)] bg-[color:var(--rd-hero-background-alt)] p-8 text-[color:var(--rd-hero-foreground)] sm:border-t-0 sm:border-s">
                            <span aria-hidden="true" className="absolute start-5 top-4 font-latin text-[10px] font-bold tracking-[.2em] text-[color:var(--rd-hero-muted)]">RAD / PEOPLE</span>
                            <span aria-hidden="true" className="grid h-28 w-28 place-items-center border border-[color:var(--rd-hero-line)] bg-[color:var(--rd-hero-background)] text-5xl font-black text-[color:var(--rd-hero-accent)] sm:h-36 sm:w-36">
                                {(localizedValue(spotlight, 'display_name', locale) || (locale === 'en' ? 'A' : 'ه')).trim().slice(0, 1)}
                            </span>
                            <span aria-hidden="true" className="absolute bottom-4 end-5 font-latin text-[10px] font-bold tracking-widest text-[color:var(--rd-hero-muted)]">FEATURED ARTIST</span>
                        </div>
                    </Card>
                )}
            </Container>

            {(collections.length > 0 || featuredArtists.length > 0) && (
                <section aria-label="مجموعه‌ها و هنرمندان منتخب" className="border-y border-border bg-surface-muted">
                    <Container>
                        {collections.length > 0 && (
                            <div>
                                <SectionHeading
                                    id="collections-title"
                                    eyebrow="CURATED STORIES / 04"
                                    title={t('روایت‌هایی از نگاه سردبیر')}
                                    description={t('مجموعه‌هایی برای دیدن آثار در کنار یکدیگر و کشف ارتباط‌های تازه.')}
                                    to="/collections"
                                    linkLabel={t('همه مجموعه‌ها')}
                                />
                                <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {collections.slice(0, 3).map((item, index) => (
                                        <Link key={item.id} to={'/collections/' + item.slug} className="group flex min-h-56 flex-col border border-border bg-paper p-6 no-underline transition-colors hover:border-terracotta">
                                            <span lang="en" className="font-latin text-[10px] font-bold tracking-widest text-terracotta-strong">SELECTION / 0{index + 1}</span>
                                            <div className="mt-auto pt-10">
                                                <p className="text-xs text-muted">{item.artwork_count} {t('اثر منتخب')}</p>
                                                <h3 className="mt-2 text-xl font-black text-ink">{localizedValue(item, 'title', locale)}</h3>
                                                <p className="mt-2 line-clamp-3 text-sm leading-7 text-muted">{localizedValue(item, 'intro', locale) || (locale === 'en' ? 'A selection of approved Rad Art works.' : 'انتخابی از آثار تأییدشده راد آرت')}</p>
                                                <span className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-terracotta-strong">{t('مشاهده مجموعه')} <ArrowLeft size={14} aria-hidden="true" /></span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                        {featuredArtists.length > 0 && (
                            <div className={collections.length > 0 ? 'mt-14 border-t border-border pt-10' : ''}>
                                <p className="text-[10px] font-extrabold tracking-[.14em] text-terracotta-strong">SELECTED VOICES</p>
                                <h2 className="mt-2 text-2xl font-black">{t('صداهای منتخب')}</h2>
                                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                                    {featuredArtists.slice(0, 3).map((item) => (
                                        <Link key={item.id} to={'/artists/' + item.artist.slug} className="border-s-2 border-sand bg-paper p-5 no-underline transition-colors hover:border-terracotta">
                                            <h3 className="font-black text-ink">{localizedValue(item.artist, 'display_name', locale)}</h3>
                                            <p className="mt-2 text-sm leading-7 text-muted">{item.editorial_intro_en && locale === 'en' ? item.editorial_intro_en : item.editorial_intro || localizedValue(item.artist, 'bio', locale) || t('با پورتفولیوی این هنرمند آشنا شوید.')}</p>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </Container>
                </section>
            )}

            <section className="rd-hero-surface border-y border-[color:var(--rd-hero-line)]">
                <Container className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
                    <div>
                        <p className="text-[10px] font-extrabold tracking-[.16em] text-[color:var(--rd-hero-accent)]">BECOME PART OF THE STORY</p>
                        <h2 className="mt-3 max-w-3xl text-2xl font-black leading-relaxed text-[color:var(--rd-hero-foreground)] sm:text-3xl">{t('جهان هنری خود را با دیگران به اشتراک بگذارید.')}</h2>
                        <p className="mt-3 max-w-2xl text-sm leading-8 text-[color:var(--rd-hero-muted)]">{t('هنرمندان می‌توانند حساب بسازند، پروفایل خود را تکمیل کنند و آثارشان را برای بررسی ارسال کنند.')}</p>
                    </div>
                    <Link to="/register" className="inline-flex min-h-12 items-center justify-center gap-3 bg-[color:var(--rd-hero-foreground)] px-6 text-sm font-bold text-[color:var(--rd-hero-background)] no-underline transition-colors hover:bg-[color:var(--rd-hero-accent)]">
                        {t('شروع به‌عنوان هنرمند')}
                        <ArrowUpLeft size={17} aria-hidden="true" />
                    </Link>
                </Container>
            </section>
        </div>
    );
}
