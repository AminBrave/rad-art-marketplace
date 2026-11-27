import { useEffect, useMemo, useRef, useState } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import { fetchArtworkFilters, fetchArtworks } from '../api/artworks';
import { artworkKeys } from '../model/queryKeys';
import { useLanguage } from '../../../shared/i18n';
import { localizedValue } from '../../../utils/localizedContent';
import { ArtworkCard } from '../components/ArtworkCard';
import {
    Button,
    Container,
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogTitle,
    EmptyState,
    ErrorState,
    PageHeader,
    SearchField,
} from '../../../shared/ui';
import { ArtworkCardSkeleton } from '../components/skeletons';

const emptyFilters = { mediums: [], availability: [], sorts: [] };
const defaultFilterValues = { q: '', category: '', medium: '', availability: '', sort: 'newest' };

function ArtworkFilterControls({
    values,
    categories,
    filters,
    filtersLoading,
    filtersError,
    onChange,
    searchValue,
    onSearchChange,
    onSearch,
    idPrefix,
}) {
    const { t, locale } = useLanguage();
    const sortOptions = filters.sorts?.length
        ? filters.sorts
        : [{ value: 'newest', label: t('جدیدترین') }];

    return (
        <div className="grid gap-5">
            <div className="grid gap-2">
                <h3 className="text-xs font-extrabold tracking-[.1em] text-terracotta-strong">{t('جست‌وجوی هدفمند')}</h3>
                <SearchField
                    value={searchValue}
                    onChange={onSearchChange}
                    onSearch={onSearch}
                    label={t('جست‌وجو در آثار و هنرمندان')}
                    placeholder={t('عنوان، توضیحات، تکنیک یا نام هنرمند…')}
                    className={idPrefix === 'desktop' ? 'sm:flex-col' : ''}
                />
            </div>

            <div className="grid gap-2 border-t border-divider-section pt-4">
                <label className="text-sm font-bold text-ink" htmlFor={idPrefix + "-artwork-filter-category"}>{t('دسته‌بندی')}</label>
                <select
                    id={idPrefix + "-artwork-filter-category"}
                    value={values.category}
                    onChange={(event) => onChange({ category: event.target.value })}
                    aria-label={t('فیلتر دسته‌بندی')}
                    className="min-h-11 w-full appearance-auto border border-border-strong bg-paper px-3.5 py-2 font-sans text-sm text-ink focus-visible:border-focus focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus"
                >
                    <option value="">{t('همه دسته‌ها')}</option>
                    {categories.map((item) => (
                        <option key={item.id} value={item.slug}>{localizedValue(item, 'name', locale)}</option>
                    ))}
                </select>
            </div>

            <div className="grid gap-2 border-t border-divider-section pt-4">
                <label className="text-sm font-bold text-ink" htmlFor={idPrefix + "-artwork-filter-medium"}>{t('تکنیک و مواد')}</label>
                <select
                    id={idPrefix + "-artwork-filter-medium"}
                    value={values.medium}
                    onChange={(event) => onChange({ medium: event.target.value })}
                    aria-label={t('فیلتر تکنیک و مواد')}
                    className="min-h-11 w-full appearance-auto border border-border-strong bg-paper px-3.5 py-2 font-sans text-sm text-ink focus-visible:border-focus focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus"
                >
                    <option value="">{t('همه تکنیک‌ها')}</option>
                    {(filters.mediums ?? []).map((item) => <option key={item} value={item}>{t(item)}</option>)}
                </select>
            </div>

            <div className="grid gap-2 border-t border-divider-section pt-4">
                <label className="text-sm font-bold text-ink" htmlFor={idPrefix + "-artwork-filter-availability"}>{t('وضعیت اثر')}</label>
                <select
                    id={idPrefix + "-artwork-filter-availability"}
                    value={values.availability}
                    onChange={(event) => onChange({ availability: event.target.value })}
                    aria-label={t('فیلتر وضعیت اثر')}
                    className="min-h-11 w-full appearance-auto border border-border-strong bg-paper px-3.5 py-2 font-sans text-sm text-ink focus-visible:border-focus focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus"
                >
                    <option value="">{t('همه وضعیت‌ها')}</option>
                    {(filters.availability ?? []).map((item) => (
                        <option key={item.value} value={item.value}>
                            {locale === 'en' ? (item.label_en || item.label) : item.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="grid gap-2 border-t border-divider-section pt-4">
                <label className="text-sm font-bold text-ink" htmlFor={idPrefix + "-artwork-filter-sort"}>{t('مرتب‌سازی آثار')}</label>
                <select
                    id={idPrefix + "-artwork-filter-sort"}
                    value={values.sort}
                    onChange={(event) => onChange({ sort: event.target.value })}
                    aria-label={t('مرتب‌سازی آثار')}
                    className="min-h-11 w-full appearance-auto border border-border-strong bg-paper px-3.5 py-2 font-sans text-sm text-ink focus-visible:border-focus focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus"
                >
                    {sortOptions.map((item) => (
                        <option key={item.value} value={item.value}>
                            {locale === 'en' ? (item.label_en || item.label) : item.label}
                        </option>
                    ))}
                </select>
            </div>

            {filtersError && (
                <p role="status" className="text-xs leading-relaxed text-muted">
                    {t('برخی گزینه‌های فیلتر بارگذاری نشدند؛ می‌توانید با جست‌وجو و دسته‌بندی ادامه دهید.')}
                </p>
            )}
            {filtersLoading && <p role="status" className="text-xs text-muted">{t('در حال آماده‌سازی گزینه‌های فیلتر…')}</p>}
        </div>
    );
}

export default function ArtworkCatalogue() {
    const { t, locale } = useLanguage();
    const [params, setParams] = useSearchParams();
    const search = params.get('q') ?? '';
    const category = params.get('category') ?? '';
    const medium = params.get('medium') ?? '';
    const availability = params.get('availability') ?? '';
    const sort = params.get('sort') ?? 'newest';
    const currentFilters = { q: search, category, medium, availability, sort };
    const [searchInput, setSearchInput] = useState(search);
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
    const [draftFilters, setDraftFilters] = useState(currentFilters);
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
        const next = { ...currentFilters, ...changes };
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
        setDraftFilters(defaultFilterValues);
        setParams({});
    };

    const openMobileFilters = () => {
        setDraftFilters(currentFilters);
        setSearchInput(search);
        setMobileFiltersOpen(true);
    };

    const applyMobileFilters = () => {
        const nextFilters = { ...draftFilters, q: draftFilters.q.trim() };
        setSearchInput(nextFilters.q);
        updateFilters(nextFilters);
        setMobileFiltersOpen(false);
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

    const filterControlProps = {
        categories,
        filters,
        filtersLoading,
        filtersError,
    };

    return (
        <div className="w-full min-w-0 min-h-[65vh] py-10 lg:py-14">
            <Container width="wide">
                <PageHeader
                    eyebrow={t('آرشیو عمومی راد آرت')}
                    title={t('گالری آثار')}
                    description={t('در میان آثار تأییدشده هنرمندان جست‌وجو کنید؛ بر اساس دسته، تکنیک و وضعیت اثر مسیر کشف خود را دقیق‌تر کنید.')}
                />

                <div className="mt-8 grid min-w-0 gap-8 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-9">
                    <aside className="hidden min-w-0 lg:sticky lg:top-24 lg:block lg:self-start" aria-label={t('فیلتر و مرتب‌سازی آثار')}>
                        <div className="flex items-center justify-between gap-3 border-b border-ink pb-4">
                            <h2 className="text-base font-extrabold text-ink">{t('فیلتر و مرتب‌سازی آثار')}</h2>
                            {activeFilterCount > 0 && (
                                <Button variant="ghost" size="sm" type="button" onClick={clearFilters} className="px-1 text-xs text-terracotta-strong">
                                    {t('پاک‌کردن فیلترها')}
                                </Button>
                            )}
                        </div>
                        <div className="pt-5">
                            <ArtworkFilterControls
                                {...filterControlProps}
                                values={currentFilters}
                                idPrefix="desktop"
                                searchValue={searchInput}
                                onSearchChange={(event) => setSearchInput(event.target.value)}
                                onSearch={submitSearch}
                                onChange={updateFilters}
                            />
                        </div>
                    </aside>

                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink pb-4">
                            <div>
                                <p className="text-[11px] font-bold tracking-[.12em] text-terracotta-strong">{t('آرشیو آثار')}</p>
                                <p aria-live="polite" className="mt-1 text-sm font-semibold text-ink">
                                    {loading ? t('در حال دریافت آثار…') : meta.total.toLocaleString(locale === 'fa' ? 'fa-IR' : 'en-US') + ' ' + t('اثر')}
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                type="button"
                                onClick={openMobileFilters}
                                aria-haspopup="dialog"
                                className="lg:hidden"
                            >
                                <SlidersHorizontal size={16} aria-hidden="true" />
                                {t('فیلترها')}
                                {activeFilterCount > 0 && (
                                    <span className="ms-1 inline-flex min-w-5 items-center justify-center bg-surface-muted px-1.5 py-0.5 text-xs tabular-nums">
                                        {activeFilterCount.toLocaleString(locale === 'fa' ? 'fa-IR' : 'en-US')}
                                    </span>
                                )}
                            </Button>
                            <p className="hidden text-xs text-muted lg:block">{t('نمایش آثار عمومی و تأییدشده')}</p>
                        </div>

                        {activeFilterCount > 0 && (
                            <div className="mt-5 flex flex-wrap items-center gap-2" aria-label={t('معیارهای فعال')}>
                                <span className="me-1 text-xs font-bold text-muted">{t('انتخاب شما:')}</span>
                                {search && (
                                    <Button variant="outline" type="button" onClick={() => updateFilters({ q: '' })} className="inline-flex min-h-9 items-center gap-2 border border-border bg-paper px-3 text-xs font-semibold hover:border-terracotta">
                                        {search}<X size={12} aria-hidden="true" />
                                    </Button>
                                )}
                                {category && (
                                    <Button variant="outline" type="button" onClick={() => updateFilters({ category: '' })} className="inline-flex min-h-9 items-center gap-2 border border-border bg-paper px-3 text-xs font-semibold hover:border-terracotta">
                                        {localizedValue(categories.find((item) => item.slug === category), 'name', locale) || category}<X size={12} aria-hidden="true" />
                                    </Button>
                                )}
                                {medium && (
                                    <Button variant="outline" type="button" onClick={() => updateFilters({ medium: '' })} className="inline-flex min-h-9 items-center gap-2 border border-border bg-paper px-3 text-xs font-semibold hover:border-terracotta">
                                        {medium}<X size={12} aria-hidden="true" />
                                    </Button>
                                )}
                                {availability && (
                                    <Button variant="outline" type="button" onClick={() => updateFilters({ availability: '' })} className="inline-flex min-h-9 items-center gap-2 border border-border bg-paper px-3 text-xs font-semibold hover:border-terracotta">
                                        {filters.availability?.find((item) => item.value === availability)?.[locale === 'en' ? 'label_en' : 'label'] ?? availability}<X size={12} aria-hidden="true" />
                                    </Button>
                                )}
                                {sort !== 'newest' && (
                                    <Button variant="outline" type="button" onClick={() => updateFilters({ sort: 'newest' })} className="inline-flex min-h-9 items-center gap-2 border border-border bg-paper px-3 text-xs font-semibold hover:border-terracotta">
                                        {filters.sorts?.find((item) => item.value === sort)?.[locale === 'en' ? 'label_en' : 'label'] ?? sort}<X size={12} aria-hidden="true" />
                                    </Button>
                                )}
                            </div>
                        )}

                        {loading ? (
                            <div className="mt-6 grid gap-x-5 gap-y-9 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                                {[0, 1, 2, 3, 4, 5].map((item) => <ArtworkCardSkeleton key={item} />)}
                            </div>
                        ) : error ? (
                            <ErrorState className="mt-8" title={t('دریافت گالری با خطا روبه‌رو شد')} description={t('اتصال را بررسی کنید و دوباره تلاش کنید.')} onRetry={() => artworksQuery.refetch()} />
                        ) : artworks.length ? (
                            <div className="mt-6 grid gap-x-5 gap-y-9 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                                {artworks.map((artwork) => <ArtworkCard key={artwork.id} artwork={artwork} />)}
                            </div>
                        ) : (
                            <div className="mt-8">
                                <EmptyState title={t('اثری با این مشخصات پیدا نشد')} description={t('عبارت جست‌وجو یا گزینه‌های فیلتر را تغییر دهید.')} />
                                {activeFilterCount > 0 && (
                                    <div className="mt-4 flex justify-center">
                                        <Button variant="outline" type="button" onClick={clearFilters}>{t('پاک‌کردن فیلترها')}</Button>
                                    </div>
                                )}
                            </div>
                        )}

                        {!loading && !error && artworks.length > 0 && (
                            <div className="mt-10 flex min-h-16 flex-col items-center justify-center gap-3 border-t border-border pt-6" aria-live="polite">
                                {artworksQuery.isFetchNextPageError && <p role="alert" className="text-sm text-danger">{t('دریافت آثار بیشتر انجام نشد.')}</p>}
                                {artworksQuery.hasNextPage ? (
                                    <>
                                        <span ref={loadMoreRef} className="h-px w-full" aria-hidden="true" />
                                        <Button type="button" variant="outline" disabled={loadingMore} onClick={() => artworksQuery.fetchNextPage()}>
                                            {loadingMore ? t('در حال دریافت آثار…') : t('بارگذاری آثار بیشتر')}
                                        </Button>
                                    </>
                                ) : (
                                    <p className="text-xs text-muted">
                                        {locale === 'fa' ? 'همه ' + meta.total.toLocaleString('fa-IR') + ' اثر نمایش داده شدند.' : 'All ' + meta.total.toLocaleString('en-US') + ' artworks are displayed.'}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </Container>

            <Dialog open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                <DialogContent
                    placement="center"
                    className="flex h-[min(42rem,calc(100dvh-6rem))] w-[min(26rem,calc(100vw-6rem))] flex-col gap-0 overflow-hidden"
                    aria-label={t('فیلتر و مرتب‌سازی آثار')}
                >
                    <div className="flex items-start justify-between gap-4 border-b border-divider-section p-5">
                        <div>
                            <DialogTitle className="text-lg">{t('فیلترها')}</DialogTitle>
                            <DialogDescription>{t('آثار را با معیارهای دلخواه محدود کنید و سپس نتایج را ببینید.')}</DialogDescription>
                        </div>
                        <DialogClose asChild>
                            <Button variant="ghost" size="sm" aria-label={t('بستن')} className="min-h-10 min-w-10 px-2">
                                <X size={18} aria-hidden="true" />
                            </Button>
                        </DialogClose>
                    </div>
                    <div className="min-h-0 flex-1 overflow-y-auto p-5">
                        <ArtworkFilterControls
                            {...filterControlProps}
                            values={draftFilters}
                            idPrefix="mobile"
                            searchValue={draftFilters.q}
                            onSearchChange={(event) => setDraftFilters((current) => ({ ...current, q: event.target.value }))}
                            onSearch={(value) => setDraftFilters((current) => ({ ...current, q: value.trim() }))}
                            onChange={(changes) => setDraftFilters((current) => ({ ...current, ...changes }))}
                        />
                    </div>
                    <div className="sticky bottom-0 flex items-center gap-3 border-t border-divider-section bg-paper p-4">
                        <Button
                            variant="ghost"
                            type="button"
                            onClick={() => setDraftFilters(defaultFilterValues)}
                            className="flex-1"
                        >
                            {t('بازنشانی')}
                        </Button>
                        <Button type="button" onClick={applyMobileFilters} className="flex-[1.4]">
                            {t('اعمال فیلترها')}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
