import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchArtists, artistKeys } from '..';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '../../../shared/i18n';
import { ArtistCard } from '..';
import { EmptyState, ErrorState, SearchField, SectionHeader, Button, Section, Container } from '../../../shared/ui';
import { ArtistCardSkeleton } from '..';

export default function ArtistDirectoryPage() {
    const { t, locale } = useLanguage();
    const [params, setParams] = useSearchParams();
    const query = params.get('q') ?? '';
    const page = Math.max(1, Number.parseInt(params.get('page') ?? '1', 10) || 1);
    const [input, setInput] = useState(query);

    useEffect(() => setInput(query), [query]);

    const artistsQuery = useQuery({
        queryKey: artistKeys.directory({ query, page }),
        queryFn: ({ signal }) => fetchArtists({ query, page, signal }),
        placeholderData: (previousData) => previousData,
        staleTime: 30_000,
    });

    const artists = artistsQuery.data?.data ?? [];
    const meta = {
        current_page: artistsQuery.data?.current_page ?? page,
        last_page: artistsQuery.data?.last_page ?? 1,
        total: artistsQuery.data?.total ?? 0,
    };
    const loading = artistsQuery.isPending;
    const error = artistsQuery.isError;

    const updatePage = (nextPage) => {
        const next = {};
        if (query) next.q = query;
        if (nextPage > 1) next.page = String(nextPage);
        setParams(next);
    };

    const submitSearch = (value) => setParams(value.trim() ? { q: value.trim() } : {});

    return (
        <div className="w-full min-w-0 min-h-[65vh] pb-16 pt-8 sm:pt-12">
            <Container width="wide">
            <nav aria-label={t("مسیر صفحه")} className="text-xs text-muted">
                <span>{t("خانه")}</span><span className="mx-2" aria-hidden="true">/</span><span aria-current="page" className="text-ink">{t("هنرمندان")}</span>
            </nav>
            </Container>

            <Section bleed className="mt-6 border-y border-[color:var(--rd-hero-line)] rd-hero-surface">
                <Container width="wide">
                    <header className="relative isolate px-6 py-10 sm:px-10 sm:py-14 lg:px-14">
                <div aria-hidden="true" className="pointer-events-none absolute -start-10 -top-16 h-56 w-56 border border-[color:var(--rd-hero-line)]" />
                <div aria-hidden="true" className="pointer-events-none absolute -start-2 -top-8 h-40 w-40 border border-[color:var(--rd-hero-accent)]" />
                <div className="relative z-10 max-w-3xl">
                    <p className="text-xs font-bold tracking-[.12em] text-[color:var(--rd-hero-accent)]">{t("جامعه خلاق راد آرت")}</p>
                    <h1 className="mt-4 text-4xl font-black leading-[1.2] tracking-[-.05em] text-[color:var(--rd-hero-foreground)] sm:text-6xl">{t("هنرمند را کشف کنید.")}</h1>
                    <p className="mt-5 max-w-2xl text-sm leading-8 text-[color:var(--rd-hero-muted)] sm:text-base">
                        {t("با هنرمندان مستقل آشنا شوید؛ از نگاه و مسیر هنری آن‌ها بخوانید و مجموعه آثار تأییدشده‌شان را ببینید.")}
                    </p>
                    <div className="mt-8 max-w-2xl">
                        <SearchField value={input} onChange={(event) => setInput(event.target.value)} onSearch={submitSearch} label={t("جست‌وجوی هنرمند")} placeholder={t("نام هنرمند یا شهر…")} />
                    </div>
                </div>
                    </header>
                </Container>
            </Section>

            <Container as="section" width="wide" className="mt-10" aria-labelledby="artist-directory-heading">
                <SectionHeader
                    id="artist-directory-heading"
                    eyebrow={t("جامعه هنرمندان")}
                    title={query ? t('نتایج جست‌وجو') : t('چهره‌های خلاق')}
                    actions={<p className="text-xs text-muted" aria-live="polite">{loading ? t('در حال دریافت هنرمندان…') : meta.total.toLocaleString(locale === 'fa' ? 'fa-IR' : 'en-US') + ' ' + t('هنرمند')}{artistsQuery.isFetching && !loading ? ' · ' + t('به‌روزرسانی…') : ''}</p>}
                />

                {loading ? (
                    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2, 3, 4, 5].map((item) => <ArtistCardSkeleton key={item} />)}</div>
                ) : error ? (
                    <ErrorState className="mt-8" title={t("دریافت فهرست هنرمندان ممکن نشد")} description={t("لطفاً دوباره تلاش کنید.")} onRetry={() => artistsQuery.refetch()} />
                ) : artists.length ? (
                    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">{artists.map((artist) => <ArtistCard key={artist.id} artist={artist} />)}</div>
                ) : (
                    <EmptyState className="mt-8" title={t("هنرمندی پیدا نشد")} description={t("نام یا شهر دیگری را جست‌وجو کنید.")} />
                )}
            </Container>

            {!loading && !error && meta.last_page > 1 && (
                <Container as="nav" width="wide" className="mt-10 flex items-center justify-center gap-4" aria-label={t("صفحه‌بندی هنرمندان")}>
                    <Button variant="outline" type="button" disabled={page <= 1} onClick={() => updatePage(page - 1)} className="min-h-11 border border-border px-5 py-2 text-sm font-semibold transition-colors hover:border-terracotta disabled:cursor-not-allowed disabled:opacity-40">{t("قبلی")}</Button>
                    <span className="text-sm text-muted">{locale === 'fa' ? `صفحه ${meta.current_page.toLocaleString('fa-IR')} از ${meta.last_page.toLocaleString('fa-IR')}` : `Page ${meta.current_page.toLocaleString('en-US')} of ${meta.last_page.toLocaleString('en-US')}`}</span>
                    <Button variant="outline" type="button" disabled={page >= meta.last_page} onClick={() => updatePage(page + 1)} className="min-h-11 border border-border px-5 py-2 text-sm font-semibold transition-colors hover:border-terracotta disabled:cursor-not-allowed disabled:opacity-40">{t("بعدی")}</Button>
                </Container>
            )}
        </div>
    );
}
