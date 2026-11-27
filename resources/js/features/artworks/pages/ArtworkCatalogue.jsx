import { useEffect, useMemo, useRef, useState } from 'react';
import { useHorizontalOverflow, useScrollOverflow, useStickyOnScroll } from '../../../shared/hooks';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { ChevronDown, SlidersHorizontal, X } from 'lucide-react';
import { fetchArtworkFilters, fetchArtworks } from '../api/artworks';
import { artworkKeys } from '../model/queryKeys';
import { useLanguage } from '../../../shared/i18n';
import { localizedValue } from '../../../utils/localizedContent';
import { scrollToElement } from '../../../utils/scroll';
import { ArtworkCard } from '../components/ArtworkCard';
import {
    Button,
    Container,
    Dialog,
    DialogClose,
    DialogContent,
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
                <div className="relative">
                    <select
                    id={idPrefix + "-artwork-filter-category"}
                    value={values.category}
                    onChange={(event) => onChange({ category: event.target.value })}
                    aria-label={t('فیلتر دسته‌بندی')}
                    className="min-h-11 w-full appearance-none border border-border-strong bg-paper py-2 pe-10 ps-3.5 font-sans text-sm text-ink focus-visible:border-focus focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus"
                >
                    <option value="">{t('همه دسته‌ها')}</option>
                    {categories.map((item) => (
                        <option key={item.id} value={item.slug}>{localizedValue(item, 'name', locale)}</option>
                    ))}
                    </select>
                    <ChevronDown size={16} aria-hidden="true" className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-muted" />
                </div>
            </div>

            <div className="grid gap-2 border-t border-divider-section pt-4">
                <label className="text-sm font-bold text-ink" htmlFor={idPrefix + "-artwork-filter-medium"}>{t('تکنیک و مواد')}</label>
                <div className="relative">
                    <select
                    id={idPrefix + "-artwork-filter-medium"}
                    value={values.medium}
                    onChange={(event) => onChange({ medium: event.target.value })}
                    aria-label={t('فیلتر تکنیک و مواد')}
                    className="min-h-11 w-full appearance-none border border-border-strong bg-paper py-2 pe-10 ps-3.5 font-sans text-sm text-ink focus-visible:border-focus focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus"
                >
                    <option value="">{t('همه تکنیک‌ها')}</option>
                    {(filters.mediums ?? []).map((item) => <option key={item} value={item}>{t(item)}</option>)}
                    </select>
                    <ChevronDown size={16} aria-hidden="true" className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-muted" />
                </div>
            </div>

            <div className="grid gap-2 border-t border-divider-section pt-4">
                <label className="text-sm font-bold text-ink" htmlFor={idPrefix + "-artwork-filter-availability"}>{t('وضعیت اثر')}</label>
                <div className="relative">
                    <select
                    id={idPrefix + "-artwork-filter-availability"}
                    value={values.availability}
                    onChange={(event) => onChange({ availability: event.target.value })}
                    aria-label={t('فیلتر وضعیت اثر')}
                    className="min-h-11 w-full appearance-none border border-border-strong bg-paper py-2 pe-10 ps-3.5 font-sans text-sm text-ink focus-visible:border-focus focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus"
                >
                    <option value="">{t('همه وضعیت‌ها')}</option>
                    {(filters.availability ?? []).map((item) => (
                        <option key={item.value} value={item.value}>
                            {locale === 'en' ? (item.label_en || item.label) : item.label}
                        </option>
                    ))}
                    </select>
                    <ChevronDown size={16} aria-hidden="true" className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-muted" />
                </div>
            </div>

            <div className="grid gap-2 border-t border-divider-section pt-4">
                <label className="text-sm font-bold text-ink" htmlFor={idPrefix + "-artwork-filter-sort"}>{t('مرتب‌سازی آثار')}</label>
                <div className="relative">
                    <select
                    id={idPrefix + "-artwork-filter-sort"}
                    value={values.sort}
                    onChange={(event) => onChange({ sort: event.target.value })}
                    aria-label={t('مرتب‌سازی آثار')}
                    className="min-h-11 w-full appearance-none border border-border-strong bg-paper py-2 pe-10 ps-3.5 font-sans text-sm text-ink focus-visible:border-focus focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus"
                >
                    {sortOptions.map((item) => (
                        <option key={item.value} value={item.value}>
                            {locale === 'en' ? (item.label_en || item.label) : item.label}
                        </option>
                    ))}
                    </select>
                    <ChevronDown size={16} aria-hidden="true" className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-muted" />
                </div>
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


function ArtworkActiveFilterChips({
    activeFilterCount,
    search,
    category,
    medium,
    availability,
    sort,
    categories,
    filters,
    onRemove,
    dark = false,
}) {
    const { t, locale } = useLanguage();
    const scrollRef = useRef(null);
    const isRtl = locale !== 'en';
    const visibleFades = useHorizontalOverflow(scrollRef, {
        enabled: dark && activeFilterCount > 0,
        direction: isRtl ? 'rtl' : 'ltr',
        contentKey: [activeFilterCount, search, category, medium, availability, sort].join('|'),
    });

    if (activeFilterCount === 0) return null;

    const chipClass = dark
        ? "inline-flex min-h-8 shrink-0 items-center gap-1.5 rounded-full border border-border bg-surface-muted px-3 text-xs font-semibold text-ink transition-colors hover:border-action"
        : "inline-flex min-h-8 shrink-0 items-center gap-1.5 rounded-full border border-border bg-paper px-3 text-xs font-semibold text-ink hover:border-terracotta";
    const content = (
        <>
            <span className="shrink-0 text-xs font-bold text-muted">{t('انتخاب شما:')}</span>
            {search && <Button variant="outline" type="button" onClick={() => onRemove({ q: '' })} className={chipClass}>{search}<X size={12} aria-hidden="true" /></Button>}
            {category && <Button variant="outline" type="button" onClick={() => onRemove({ category: '' })} className={chipClass}>{localizedValue(categories.find((item) => item.slug === category), 'name', locale) || category}<X size={12} aria-hidden="true" /></Button>}
            {medium && <Button variant="outline" type="button" onClick={() => onRemove({ medium: '' })} className={chipClass}>{medium}<X size={12} aria-hidden="true" /></Button>}
            {availability && <Button variant="outline" type="button" onClick={() => onRemove({ availability: '' })} className={chipClass}>{filters.availability?.find((item) => item.value === availability)?.[locale === 'en' ? 'label_en' : 'label'] ?? availability}<X size={12} aria-hidden="true" /></Button>}
            {sort !== 'newest' && <Button variant="outline" type="button" onClick={() => onRemove({ sort: 'newest' })} className={chipClass}>{filters.sorts?.find((item) => item.value === sort)?.[locale === 'en' ? 'label_en' : 'label'] ?? sort}<X size={12} aria-hidden="true" /></Button>}
        </>
    );

    if (!dark) {
        return <div className="mt-5 flex min-w-0 flex-wrap items-center gap-2" aria-label={t('معیارهای فعال')}>{content}</div>;
    }

    const startFadeClass = isRtl ? 'bg-gradient-to-l' : 'bg-gradient-to-r';
    const endFadeClass = isRtl ? 'bg-gradient-to-r' : 'bg-gradient-to-l';

    return (
        <div className="relative min-w-0" aria-label={t('معیارهای فعال')}>
            <div
                ref={scrollRef}
                className="flex min-w-0 items-center gap-2 overflow-x-auto overscroll-x-contain whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
                {content}
            </div>
            {visibleFades.start && (
                <span aria-hidden="true" className={`pointer-events-none absolute inset-y-0 start-0 z-10 w-8 ${startFadeClass} from-canvas to-transparent`} />
            )}
            {visibleFades.end && (
                <span aria-hidden="true" className={`pointer-events-none absolute inset-y-0 end-0 z-10 w-8 ${endFadeClass} from-canvas to-transparent`} />
            )}
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
    const filterSummaryEndRef = useRef(null);
    const archiveSectionRef = useRef(null);
    const sidebarScrollRef = useRef(null);
    const [bottomNavigationHeight, setBottomNavigationHeight] = useState(0);
    const {
        enabled: stickyToolbarEnabled,
        visible: stickyToolbarVisible,
        headerOffset: stickyToolbarTop,
        suppressDirectionFor,
    } = useStickyOnScroll({ activationRef: filterSummaryEndRef, direction: 'up' });

    const scrollToArchiveStart = () => scrollToElement(archiveSectionRef.current, {
        behavior: 'smooth',
        offset: 12,
        onBeforeScroll: () => suppressDirectionFor(1500),
    });

    useEffect(() => {
        const navigation = document.querySelector(
            '[data-testid="public-bottom-navigation"], [data-testid="authenticated-bottom-navigation"]',
        );
        if (!navigation) {
            setBottomNavigationHeight(0);
            return undefined;
        }

        const updateHeight = () => {
            const height = navigation.getBoundingClientRect().height;
            setBottomNavigationHeight((current) => (
                Math.abs(current - height) > 1 ? height : current
            ));
        };

        updateHeight();
        const observer = typeof ResizeObserver === 'function'
            ? new ResizeObserver(updateHeight)
            : null;
        observer?.observe(navigation);
        window.addEventListener('resize', updateHeight);

        return () => {
            observer?.disconnect();
            window.removeEventListener('resize', updateHeight);
        };
    }, []);

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
    const sidebarFades = useScrollOverflow(sidebarScrollRef, {
        axis: 'vertical',
        contentKey: [activeFilterCount, bottomNavigationHeight, filtersLoading, filtersError].join('|'),
    });

    const updateFilters = (changes) => {
        suppressDirectionFor(1500);
        const next = { ...currentFilters, ...changes };
        const query = {};
        if (next.q) query.q = next.q;
        if (next.category) query.category = next.category;
        if (next.medium) query.medium = next.medium;
        if (next.availability) query.availability = next.availability;
        if (next.sort && next.sort !== 'newest') query.sort = next.sort;
        setParams(query);
        scrollToArchiveStart();
    };

    const submitSearch = (value) => updateFilters({ q: value.trim() });
    const clearFilters = () => {
        suppressDirectionFor(1500);
        setSearchInput('');
        setDraftFilters(defaultFilterValues);
        setParams({});
        scrollToArchiveStart();
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
                    <div className="relative hidden min-w-0 lg:sticky lg:top-24 lg:block lg:self-start">
                        <aside
                            ref={sidebarScrollRef}
                            data-testid="artwork-filter-sidebar"
                            tabIndex={0}
                            style={{ maxHeight: `calc(100dvh - 6rem - ${bottomNavigationHeight}px - 1rem)` }}
                            className="min-w-0 overscroll-y-contain overflow-y-auto pe-3 pb-4"
                            aria-label={t('فیلتر و مرتب‌سازی آثار')}
                        >
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
                        {sidebarFades.start && (
                            <span data-testid="artwork-sidebar-fade-top" aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-10 h-8 bg-gradient-to-b from-canvas to-transparent" />
                        )}
                        {sidebarFades.end && (
                            <span data-testid="artwork-sidebar-fade-bottom" aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-8 bg-gradient-to-t from-canvas to-transparent" />
                        )}
                    </div>

                    <div className="min-w-0">
                        <div ref={archiveSectionRef} className="flex flex-wrap items-center justify-between gap-3 border-b border-ink pb-4">
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

                        <ArtworkActiveFilterChips
                            activeFilterCount={activeFilterCount}
                            search={search}
                            category={category}
                            medium={medium}
                            availability={availability}
                            sort={sort}
                            categories={categories}
                            filters={filters}
                            onRemove={updateFilters}
                        />
                        <div ref={filterSummaryEndRef} className="h-px w-full" aria-hidden="true" />

                        {loading ? (
                            <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-9 md:grid-cols-3 xl:grid-cols-4">
                                {[0, 1, 2, 3, 4, 5].map((item) => <ArtworkCardSkeleton key={item} />)}
                            </div>
                        ) : error ? (
                            <ErrorState className="mt-8" title={t('دریافت گالری با خطا روبه‌رو شد')} description={t('اتصال را بررسی کنید و دوباره تلاش کنید.')} onRetry={() => artworksQuery.refetch()} />
                        ) : artworks.length ? (
                            <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-9 md:grid-cols-3 xl:grid-cols-4">
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

            {stickyToolbarEnabled && (
                <div
                    aria-hidden={!stickyToolbarVisible}
                    style={{ top: stickyToolbarTop }}
                    className={`fixed inset-x-0 z-40 border-b border-divider-section bg-[color:color-mix(in_srgb,var(--color-canvas)_96%,transparent)] text-ink shadow-soft backdrop-blur supports-[backdrop-filter]:bg-[color:color-mix(in_srgb,var(--color-canvas)_90%,transparent)] transition-[transform,opacity,visibility] duration-200 motion-reduce:transition-none ${stickyToolbarVisible ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-full opacity-0 pointer-events-none'}`}
                >
                    <Container width="wide">
                        <div className="flex min-w-0 items-center gap-3 py-3">
                            <Button
                                variant="outline"
                                type="button"
                                onClick={openMobileFilters}
                                aria-haspopup="dialog"
                                className="min-h-9 shrink-0 border-border bg-surface-muted px-3 text-ink hover:border-action hover:bg-surface hover:text-ink lg:hidden"
                            >
                                <SlidersHorizontal size={15} aria-hidden="true" />
                                {t('فیلترها')}
                                {activeFilterCount > 0 && (
                                    <span className="ms-1 inline-flex min-w-5 items-center justify-center bg-surface px-1.5 py-0.5 text-xs tabular-nums text-ink">
                                        {activeFilterCount.toLocaleString(locale === 'fa' ? 'fa-IR' : 'en-US')}
                                    </span>
                                )}
                            </Button>
                            <span aria-hidden="true" className="h-6 w-px shrink-0 bg-border lg:hidden" />
                            <div className="min-w-0 flex-1">
                                <ArtworkActiveFilterChips
                                    activeFilterCount={activeFilterCount}
                                    search={search}
                                    category={category}
                                    medium={medium}
                                    availability={availability}
                                    sort={sort}
                                    categories={categories}
                                    filters={filters}
                                    onRemove={updateFilters}
                                    dark
                                />
                                {activeFilterCount === 0 && (
                                    <p className="truncate text-xs text-muted">{t('نمایش آثار عمومی و تأییدشده')}</p>
                                )}
                            </div>
                            <span aria-hidden="true" className="h-6 w-px shrink-0 bg-border" />
                            <p aria-live="polite" className="shrink-0 whitespace-nowrap text-xs font-bold text-ink sm:text-sm">
                                {loading ? t('در حال دریافت آثار…') : meta.total.toLocaleString(locale === 'fa' ? 'fa-IR' : 'en-US') + ' ' + t('اثر')}
                            </p>
                        </div>
                    </Container>
                </div>
            )}

            <Dialog open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                <DialogContent
                    placement="center"
                    className="flex flex-col gap-0 overflow-hidden"
                    aria-label={t('فیلتر و مرتب‌سازی آثار')}
                >
                    <div className="flex items-start justify-between gap-4 border-b border-divider-section p-5">
                        <div>
                            <DialogTitle className="text-lg">{t('فیلترها')}</DialogTitle>
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
