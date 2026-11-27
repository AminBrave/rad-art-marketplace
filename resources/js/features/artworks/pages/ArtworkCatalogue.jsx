import { useEffect, useMemo, useRef, useState } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { fetchArtworkFilters, fetchArtworks } from '../api/artworks';
import { artworkKeys } from '../model/queryKeys';
import { useSearchParams } from 'react-router-dom';
import { X } from 'lucide-react';
import { useLanguage } from '../../../shared/i18n';
import { localizedValue } from '../../../utils/localizedContent';
import { ArtworkCard } from '../components/ArtworkCard';
import { EmptyState, ErrorState, SearchField, SelectField, PageHeader, Button, Container, Section } from '../../../shared/ui';
import { ArtworkCardSkeleton } from '../components/skeletons';

const emptyFilters = { mediums: [], availability: [], sorts: [] };

export default function ArtworkCatalogue() {
    const { t, locale } = useLanguage();
    const [params, setParams] = useSearchParams();
    const search = params.get('q') ?? '';
    const category = params.get('category') ?? '';
    const medium = params.get('medium') ?? '';
    const availability = params.get('availability') ?? '';
    const sort = params.get('sort') ?? 'newest';
    const [searchInput, setSearchInput] = useState(search);
    const loadMoreRef = useRef(null);

    useEffect(() => setSearchInput(search), [search]);

    const filtersQuery = useQuery({
        queryKey: artworkKeys.filters(),
        queryFn: ({ signal }) => fetchArtworkFilters({ signal }),
        staleTime: 5 * 60_000,
    });

    const artworksQuery = useInfiniteQuery({
        queryKey: artworkKeys.list({ search, category, medium, availability, sort }),
        initialPageParam: 1,
        queryFn: ({ signal, pageParam }) => fetchArtworks({
            params: {
                q: search || undefined,
                category: category || undefined,
                medium: medium || undefined,
                availability: availability || undefined,
                sort: sort === 'newest' ? undefined : sort,
                page: pageParam,
            },
            signal,
        }),
        getNextPageParam: (lastPage) => (
            lastPage.current_page < lastPage.last_page ? lastPage.current_page + 1 : undefined
        ),
        staleTime: 30_000,
    });

    const categories = filtersQuery.data?.categories ?? [];
    const filters = filtersQuery.data?.filters ?? emptyFilters;
    const artworkPages = artworksQuery.data?.pages ?? [];
    const artworks = artworkPages.flatMap((pageData) => pageData.data ?? []);
    const latestPage = artworkPages[artworkPages.length - 1];
    const meta = {
        current_page: latestPage?.current_page ?? 1,
        last_page: latestPage?.last_page ?? 1,
        total: latestPage?.total ?? 0,
    };
    const loading = artworksQuery.isPending;
    const error = artworksQuery.isError && !artworksQuery.data;
    const loadingMore = artworksQuery.isFetchingNextPage;
    const filtersLoading = filtersQuery.isPending;
    const filtersError = filtersQuery.isError;

    const activeFilterCount = useMemo(
        () => [search, category, medium, availability, sort !== 'newest' ? sort : ''].filter(Boolean).length,
        [search, category, medium, availability, sort],
    );

    const updateFilters = (changes) => {
        const next = { q: search, category, medium, availability, sort, ...changes };
        const query = {};
        if (next.q) query.q = next.q;
        if (next.category) query.category = next.category;
        if (next.medium) query.medium = next.medium;
        if (next.availability) query.availability = next.availability;
        if (next.sort && next.sort !== 'newest') query.sort = next.sort;
        setParams(query);
    };

    const submitSearch = (value) => updateFilters({ q: value.trim() });
    const clearFilters = () => {
        setSearchInput('');
        setParams({});
    };

    const { hasNextPage, fetchNextPage } = artworksQuery;

    useEffect(() => {
        const sentinel = loadMoreRef.current;
        if (!sentinel || !hasNextPage || loadingMore || error) return undefined;
        if (typeof window.IntersectionObserver !== 'function') return undefined;

        const observer = new window.IntersectionObserver((entries) => {
            if (entries.some((entry) => entry.isIntersecting)) {
                fetchNextPage();
            }
        }, { rootMargin: '640px 0px' });

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [hasNextPage, fetchNextPage, loadingMore, error]);

    return (
        <div className="w-full min-w-0 min-h-[65vh] py-10 lg:py-14">
            <Container width="wide">
                <PageHeader eyebrow={t("آرشیو عمومی راد آرت")} title={t("گالری آثار")} description={t("در میان آثار تأییدشده هنرمندان جست‌وجو کنید؛ بر اساس دسته، تکنیک و وضعیت اثر مسیر کشف خود را دقیق‌تر کنید.")} />
            </Container>

            <Section as="section" bleed aria-label={t("فیلتر و مرتب‌سازی آثار")} className="relative mt-8 border-y border-divider-section bg-surface-muted/70 py-6 sm:py-7">
                <Container width="wide">
                <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <p className="text-[11px] font-extrabold tracking-[.12em] text-terracotta-strong">{t("جست‌وجوی هدفمند")}</p>
                        <h2 className="mt-1 text-base font-black">{t("آثاری را پیدا کنید که با نگاه شما هم‌مسیرند")}</h2>
                    </div>
                    <span className="text-xs text-muted">{activeFilterCount ? activeFilterCount.toLocaleString(locale === 'fa' ? 'fa-IR' : 'en-US') + ' ' + t('معیار انتخاب‌شده') : t('همه آثار عمومی')}</span>
                </div>
                <div className="grid gap-3.5 md:grid-cols-2 xl:grid-cols-[minmax(20rem,1.7fr)_repeat(2,minmax(11rem,1fr))]">
                    <SearchField value={searchInput} onChange={(event) => setSearchInput(event.target.value)} onSearch={submitSearch} label={t("جست‌وجو در آثار و هنرمندان")} placeholder={t("عنوان، توضیحات، تکنیک یا نام هنرمند…")} />
                    <SelectField value={category} onChange={(event) => updateFilters({ category: event.target.value })} aria-label={t("فیلتر دسته‌بندی")}>
                        <option value="">{t("همه دسته‌ها")}</option>
                        {categories.map((item) => <option key={item.id} value={item.slug}>{localizedValue(item, 'name', locale)}</option>)}
                    </SelectField>
                    <SelectField value={medium} onChange={(event) => updateFilters({ medium: event.target.value })} aria-label={t("فیلتر تکنیک و مواد")}>
                        <option value="">{t("همه تکنیک‌ها")}</option>
                        {(filters.mediums ?? []).map((item) => <option key={item} value={item}>{t(item)}</option>)}
                    </SelectField>
                    <SelectField value={availability} onChange={(event) => updateFilters({ availability: event.target.value })} aria-label={t("فیلتر وضعیت اثر")}>
                        <option value="">{t("همه وضعیت‌ها")}</option>
                        {(filters.availability ?? []).map((item) => <option key={item.value} value={item.value}>{locale === 'en' ? (item.label_en || item.label) : item.label}</option>)}
                    </SelectField>
                    <SelectField value={sort} onChange={(event) => updateFilters({ sort: event.target.value })} aria-label={t("مرتب‌سازی آثار")}>
                        {(filters.sorts?.length ? filters.sorts : [{ value: 'newest', label: t('جدیدترین') }]).map((item) => <option key={item.value} value={item.value}>{locale === 'en' ? (item.label_en || item.label) : item.label}</option>)}
                    </SelectField>
                    <div className="flex items-center justify-between gap-3">
                        <p className="text-xs text-muted">{activeFilterCount ? activeFilterCount.toLocaleString(locale === 'fa' ? 'fa-IR' : 'en-US') + ' ' + t('فیلتر فعال') : t('بدون فیلتر')}</p>
                        {activeFilterCount > 0 && <Button variant="ghost" type="button" onClick={clearFilters} className="text-sm font-bold text-terracotta-strong underline underline-offset-4">{t("پاک‌کردن فیلترها")}</Button>}
                    </div>
                </div>
                {filtersError && <p role="status" className="mt-3 text-xs text-muted">{t("برخی گزینه‌های فیلتر بارگذاری نشدند؛ می‌توانید با جست‌وجو و دسته‌بندی ادامه دهید.")}</p>}
                {filtersLoading && <p className="mt-3 text-xs text-muted">{t("در حال آماده‌سازی گزینه‌های فیلتر…")}</p>}
            </Container>
            </Section>

            <Container width="wide">
            {activeFilterCount > 0 && (
                <div className="mt-6 flex flex-wrap items-center gap-2" aria-label={t("معیارهای فعال")}>
                    <span className="me-1 text-xs font-bold text-muted">{t("انتخاب شما:")}</span>
                    {search && <Button variant="outline" type="button" onClick={() => updateFilters({ q: '' })} className="inline-flex min-h-9 items-center gap-2 border border-border bg-paper px-3 text-xs font-semibold hover:border-terracotta">{search}<X size={12} aria-hidden="true" /></Button>}
                    {category && <Button variant="outline" type="button" onClick={() => updateFilters({ category: '' })} className="inline-flex min-h-9 items-center gap-2 border border-border bg-paper px-3 text-xs font-semibold hover:border-terracotta">{localizedValue(categories.find((item) => item.slug === category), 'name', locale) || category}<X size={12} aria-hidden="true" /></Button>}
                    {medium && <Button variant="outline" type="button" onClick={() => updateFilters({ medium: '' })} className="inline-flex min-h-9 items-center gap-2 border border-border bg-paper px-3 text-xs font-semibold hover:border-terracotta">{medium}<X size={12} aria-hidden="true" /></Button>}
                    {availability && <Button variant="outline" type="button" onClick={() => updateFilters({ availability: '' })} className="inline-flex min-h-9 items-center gap-2 border border-border bg-paper px-3 text-xs font-semibold hover:border-terracotta">{filters.availability?.find((item) => item.value === availability)?.[locale === 'en' ? 'label_en' : 'label'] ?? availability}<X size={12} aria-hidden="true" /></Button>}
                    {sort !== 'newest' && <Button variant="outline" type="button" onClick={() => updateFilters({ sort: 'newest' })} className="inline-flex min-h-9 items-center gap-2 border border-border bg-paper px-3 text-xs font-semibold hover:border-terracotta">{filters.sorts?.find((item) => item.value === sort)?.[locale === 'en' ? 'label_en' : 'label'] ?? sort}<X size={12} aria-hidden="true" /></Button>}
                </div>
            )}
            <div className="mt-9 flex flex-wrap items-end justify-between gap-3 border-b border-ink pb-4">
                <div>
                    <p className="text-[11px] font-bold tracking-[.12em] text-terracotta-strong">{t("آرشیو آثار")}</p>
                    <p aria-live="polite" className="mt-1 text-sm font-semibold text-ink">{loading ? t('در حال دریافت آثار…') : meta.total.toLocaleString(locale === 'fa' ? 'fa-IR' : 'en-US') + ' ' + t('اثر')}</p>
                </div>
                <p className="text-xs text-muted">{t("نمایش آثار عمومی و تأییدشده")}</p>
            </div>
            {loading ? (
                <div className="mt-6 grid gap-x-5 gap-y-9 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{[0, 1, 2, 3, 4, 5].map((item) => <ArtworkCardSkeleton key={item} />)}</div>
            ) : error ? (
                <ErrorState className="mt-8" title={t("دریافت گالری با خطا روبه‌رو شد")} description={t("اتصال را بررسی کنید و دوباره تلاش کنید.")} onRetry={() => artworksQuery.refetch()} />
            ) : artworks.length ? (
                <div className="mt-6 grid gap-x-5 gap-y-9 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{artworks.map((artwork) => <ArtworkCard key={artwork.id} artwork={artwork} />)}</div>
            ) : (
                <EmptyState className="mt-8" title={t("اثری با این مشخصات پیدا نشد")} description={t("عبارت جست‌وجو یا گزینه‌های فیلتر را تغییر دهید.")} />
            )}
            {!loading && !error && artworks.length > 0 && (
                <div className="mt-10 flex min-h-16 flex-col items-center justify-center gap-3 border-t border-border pt-6" aria-live="polite">
                    {artworksQuery.isFetchNextPageError && <p role="alert" className="text-sm text-danger">{t("دریافت آثار بیشتر انجام نشد.")}</p>}
                    {artworksQuery.hasNextPage ? (
                        <>
                            <span ref={loadMoreRef} className="h-px w-full" aria-hidden="true" />
                            <Button type="button" variant="outline" disabled={loadingMore} onClick={() => artworksQuery.fetchNextPage()}>
                                {loadingMore ? t('در حال دریافت آثار…') : t('بارگذاری آثار بیشتر')}
                            </Button>
                        </>
                    ) : (
                        <p className="text-xs text-muted">{locale === 'fa' ? `همه ${meta.total.toLocaleString('fa-IR')} اثر نمایش داده شدند.` : `All ${meta.total.toLocaleString('en-US')} artworks are displayed.`}</p>
                    )}
                </div>
            )}
            </Container>
        </div>
    );
}
