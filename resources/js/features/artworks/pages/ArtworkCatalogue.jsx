import { useEffect, useMemo, useRef, useState } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { Check, RotateCcw, SlidersHorizontal, X } from 'lucide-react';
import { fetchArtworkFilters, fetchArtworks } from '../api/artworks';
import { artworkKeys } from '../model/queryKeys';
import { useLanguage } from '../../../shared/i18n';
import { localizedValue } from '../../../utils/localizedContent';
import { ArtworkCard } from '../components/ArtworkCard';
import {
    EmptyState, ErrorState, SearchField, PageHeader, Button, Container, Section,
    Dialog, DialogTrigger, DialogClose, DialogContent, DialogTitle, DialogDescription,
} from '../../../shared/ui';
import { ArtworkCardSkeleton } from '../components/skeletons';

const emptyFilters = { mediums: [], availability: [], sorts: [] };

function FilterGroup({ title, hint, options, value, onChange, allLabel, scroll = false }) {
    return (
        <fieldset className="min-w-0 border-t border-border/80 py-5 first:border-t-0 first:pt-0">
            <legend className="mb-3 w-full">
                <span className="block text-sm font-extrabold text-ink">{title}</span>
                {hint && <span className="mt-1 block text-xs leading-5 text-muted">{hint}</span>}
            </legend>
            <div className={scroll ? 'grid max-h-56 grid-cols-2 gap-2 overflow-y-auto pe-1' : 'flex flex-wrap gap-2'} role="group" aria-label={title}>
                {allLabel && (
                    <button
                        type="button"
                        aria-pressed={!value}
                        onClick={() => onChange('')}
                        className={`inline-flex min-h-10 items-center justify-between gap-2 border px-3 text-start text-xs font-semibold transition ${!value ? 'border-terracotta bg-terracotta/10 text-terracotta-strong' : 'border-border bg-paper text-muted hover:border-ink/40 hover:text-ink'}`}
                    >
                        <span>{allLabel}</span>
                        {!value && <Check size={14} aria-hidden="true" />}
                    </button>
                )}
                {options.map((option) => {
                    const selected = value === option.value;
                    return (
                        <button
                            key={option.value}
                            type="button"
                            aria-pressed={selected}
                            onClick={() => onChange(option.value)}
                            className={`inline-flex min-h-10 items-center justify-between gap-2 border px-3 text-start text-xs font-semibold transition ${selected ? 'border-terracotta bg-terracotta/10 text-terracotta-strong' : 'border-border bg-paper text-muted hover:border-ink/40 hover:text-ink'}`}
                        >
                            <span className="min-w-0 truncate">{option.label}</span>
                            {selected && <Check size={14} className="shrink-0" aria-hidden="true" />}
                        </button>
                    );
                })}
            </div>
        </fieldset>
    );
}

function FilterPanel({ categories, filters, values, onChange, onClear, locale, t, compact = false }) {
    const categoryOptions = categories.map((item) => ({
        value: item.slug,
        label: localizedValue(item, 'name', locale),
    }));
    const mediumOptions = (filters.mediums ?? []).map((item) => ({ value: item, label: t(item) }));
    const availabilityOptions = (filters.availability ?? []).map((item) => ({
        value: item.value,
        label: locale === 'en' ? (item.label_en || item.label) : item.label,
    }));
    const sortOptions = (filters.sorts?.length ? filters.sorts : [{ value: 'newest', label: t('جدیدترین') }]).map((item) => ({
        value: item.value,
        label: locale === 'en' ? (item.label_en || item.label) : item.label,
    }));

    return (
        <div className={compact ? 'flex min-h-0 flex-1 flex-col' : ''}>
            <div className="flex items-center justify-between gap-3 border-b border-border pb-4">
                <div>
                    <p className="text-[10px] font-extrabold tracking-[.16em] text-terracotta-strong">{t('تنظیمات کشف')}</p>
                    <h2 className="mt-1 text-lg font-black text-ink">{t('فیلتر آثار')}</h2>
                </div>
                <span className="grid h-10 w-10 place-items-center rounded-full bg-surface-muted text-terracotta-strong">
                    <SlidersHorizontal size={17} aria-hidden="true" />
                </span>
            </div>
            <div className={compact ? 'min-h-0 flex-1 overflow-y-auto pe-1' : ''}>
                <div className="pt-5">
                    <FilterGroup title={t('دسته‌بندی هنری')} hint={t('از میان شاخه‌های هنری انتخاب کنید')} options={categoryOptions} value={values.category} onChange={(value) => onChange({ category: value })} allLabel={t('همه دسته‌ها')} scroll />
                    <FilterGroup title={t('تکنیک و مواد')} hint={t('رسانه و شیوه خلق اثر')} options={mediumOptions} value={values.medium} onChange={(value) => onChange({ medium: value })} allLabel={t('همه تکنیک‌ها')} />
                    <FilterGroup title={t('وضعیت اثر')} options={availabilityOptions} value={values.availability} onChange={(value) => onChange({ availability: value })} allLabel={t('همه وضعیت‌ها')} />
                    <FilterGroup title={t('چیدمان گالری')} hint={t('ترتیب نمایش آثار')} options={sortOptions} value={values.sort} onChange={(value) => onChange({ sort: value || 'newest' })} />
                </div>
            </div>
            <div className={compact ? 'mt-4 flex shrink-0 gap-2 border-t border-border pt-4' : 'mt-4 border-t border-border pt-4'}>
                <Button type="button" variant="outline" onClick={onClear} className="min-h-11 gap-2">
                    <RotateCcw size={14} aria-hidden="true" />{t('پاک‌کردن انتخاب‌ها')}
                </Button>
            </div>
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
    const [searchInput, setSearchInput] = useState(search);
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
    const [draftFilters, setDraftFilters] = useState({ category, medium, availability, sort });
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
    const values = { category, medium, availability, sort };

    const activeFilterCount = useMemo(
        () => [search, category, medium, availability, sort !== 'newest' ? sort : ''].filter(Boolean).length,
        [search, category, medium, availability, sort],
    );

    const setQueryFilters = (next, nextSearch = search) => {
        const query = {};
        if (nextSearch) query.q = nextSearch;
        if (next.category) query.category = next.category;
        if (next.medium) query.medium = next.medium;
        if (next.availability) query.availability = next.availability;
        if (next.sort && next.sort !== 'newest') query.sort = next.sort;
        setParams(query);
    };

    const updateFilters = (changes) => setQueryFilters({ ...values, ...changes });
    const submitSearch = (value) => setQueryFilters(values, value.trim());
    const clearFilters = () => {
        setSearchInput('');
        setQueryFilters({ category: '', medium: '', availability: '', sort: 'newest' }, '');
    };
    const prepareMobileFilters = () => setDraftFilters(values);
    const applyMobileFilters = () => {
        setQueryFilters(draftFilters);
        setMobileFiltersOpen(false);
    };
    const clearMobileDraft = () => setDraftFilters({ category: '', medium: '', availability: '', sort: 'newest' });
    const clearDesktopFilters = () => updateFilters({ category: '', medium: '', availability: '', sort: 'newest' });

    const { hasNextPage, fetchNextPage } = artworksQuery;

    useEffect(() => {
        const sentinel = loadMoreRef.current;
        if (!sentinel || !hasNextPage || loadingMore || error) return undefined;
        if (typeof window.IntersectionObserver !== 'function') return undefined;
        const observer = new window.IntersectionObserver((entries) => {
            if (entries.some((entry) => entry.isIntersecting)) fetchNextPage();
        }, { rootMargin: '640px 0px' });
        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [hasNextPage, fetchNextPage, loadingMore, error]);

    const activeChips = [
        search && { key: 'q', label: search },
        category && { key: 'category', label: localizedValue(categories.find((item) => item.slug === category), 'name', locale) || category },
        medium && { key: 'medium', label: t(medium) },
        availability && { key: 'availability', label: filters.availability?.find((item) => item.value === availability)?.[locale === 'en' ? 'label_en' : 'label'] ?? availability },
        sort !== 'newest' && { key: 'sort', label: filters.sorts?.find((item) => item.value === sort)?.[locale === 'en' ? 'label_en' : 'label'] ?? sort },
    ].filter(Boolean);

    const removeChip = (key) => {
        if (key === 'q') {
            setSearchInput('');
            setQueryFilters(values, '');
        } else {
            updateFilters({ [key]: key === 'sort' ? 'newest' : '' });
        }
    };

    return (
        <div className="min-h-[65vh] w-full min-w-0 py-10 lg:py-14">
            <Container width="wide">
                <PageHeader eyebrow={t('آرشیو عمومی راد آرت')} title={t('گالری آثار')} description={t('در میان آثار تأییدشده هنرمندان جست‌وجو کنید؛ مسیر کشف خود را با سلیقه‌تان هماهنگ کنید.')} />
            </Container>

            <Section as="section" bleed className="relative mt-8 border-y border-divider-section bg-surface-muted/60 py-5 sm:py-6">
                <Container width="wide">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div className="min-w-0 flex-1">
                            <p className="mb-2 text-[10px] font-extrabold tracking-[.16em] text-terracotta-strong">{t('جست‌وجوی آثار')}</p>
                            <SearchField value={searchInput} onChange={(event) => setSearchInput(event.target.value)} onSearch={submitSearch} label={t('جست‌وجو در آثار و هنرمندان')} placeholder={t('عنوان، توضیحات، تکنیک یا نام هنرمند…')} />
                        </div>
                        <div className="flex items-center justify-between gap-3 sm:justify-end">
                            <p className="text-xs text-muted">{activeFilterCount ? activeFilterCount.toLocaleString(locale === 'fa' ? 'fa-IR' : 'en-US') + ' ' + t('فیلتر فعال') : t('همه آثار عمومی')}</p>
                            <Dialog open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                                <DialogTrigger asChild>
                                    <Button type="button" variant="outline" onClick={prepareMobileFilters} className="min-h-11 gap-2 border-ink/20 bg-paper px-4 lg:hidden">
                                        <SlidersHorizontal size={16} aria-hidden="true" />
                                        {t('فیلتر آثار')}
                                        {activeFilterCount > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-terracotta px-1 text-[10px] text-white">{activeFilterCount}</span>}
                                    </Button>
                                </DialogTrigger>
                                <DialogContent
                                    className="!fixed !inset-x-0 !bottom-0 !left-0 !top-auto !max-h-[88dvh] !w-full !max-w-none !translate-x-0 !translate-y-0 rounded-t-2xl border-x-0 border-b-0 p-5 shadow-2xl sm:!left-1/2 sm:!top-1/2 sm:!bottom-auto sm:!w-[min(34rem,calc(100%-2rem))] sm:!-translate-x-1/2 sm:!-translate-y-1/2 sm:rounded-xl sm:border"
                                    onOpenAutoFocus={(event) => event.preventDefault()}
                                >
                                    <div className="flex max-h-[calc(88dvh-2.5rem)] flex-col">
                                        <div className="mb-4 flex items-start justify-between gap-4">
                                            <div>
                                                <DialogTitle>{t('تنظیمات فیلتر گالری')}</DialogTitle>
                                                <DialogDescription>{t('انتخاب‌ها را انجام دهید و سپس نتایج را به‌روزرسانی کنید.')}</DialogDescription>
                                            </div>
                                            <DialogClose asChild><button type="button" aria-label={t('بستن فیلترها')} className="grid h-10 w-10 shrink-0 place-items-center border border-border text-muted hover:text-ink"><X size={18} /></button></DialogClose>
                                        </div>
                                        <FilterPanel
                                            compact
                                            categories={categories}
                                            filters={filters}
                                            values={draftFilters}
                                            onChange={(changes) => setDraftFilters((current) => ({ ...current, ...changes }))}
                                            onClear={clearMobileDraft}
                                            locale={locale}
                                            t={t}
                                        />
                                        <Button type="button" onClick={applyMobileFilters} className="mt-3 min-h-12 w-full">
                                            {t('نمایش نتایج')}
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </Container>
            </Section>

            <Container width="wide">
                <div className="mt-7 grid min-w-0 gap-7 lg:grid-cols-[minmax(0,1fr)_17.5rem] lg:items-start lg:[direction:ltr]">
                    <main dir={locale === 'fa' ? 'rtl' : 'ltr'} className="min-w-0 lg:col-start-1">
                        {activeChips.length > 0 && (
                            <div className="mb-5 flex flex-wrap items-center gap-2" aria-label={t('فیلترهای فعال')}>
                                <span className="me-1 text-xs font-bold text-muted">{t('انتخاب شما')}</span>
                                {activeChips.map((chip) => (
                                    <button key={chip.key} type="button" onClick={() => removeChip(chip.key)} className="inline-flex min-h-8 items-center gap-2 border border-terracotta/25 bg-terracotta/5 px-3 text-xs font-semibold text-terracotta-strong hover:bg-terracotta/10">
                                        {chip.label}<X size={12} aria-hidden="true" />
                                    </button>
                                ))}
                                <button type="button" onClick={clearFilters} className="min-h-8 px-2 text-xs font-bold text-muted underline underline-offset-4 hover:text-ink">{t('پاک‌کردن همه')}</button>
                            </div>
                        )}
                        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-ink pb-4">
                            <div>
                                <p className="text-[10px] font-bold tracking-[.14em] text-terracotta-strong">{t('مجموعه منتخب')}</p>
                                <p aria-live="polite" className="mt-1 text-sm font-semibold text-ink">{loading ? t('در حال دریافت آثار…') : meta.total.toLocaleString(locale === 'fa' ? 'fa-IR' : 'en-US') + ' ' + t('اثر')}</p>
                            </div>
                            <p className="text-xs text-muted">{t('آثار عمومی و تأییدشده')}</p>
                        </div>
                        {filtersError && <p role="status" className="mt-4 text-xs text-muted">{t('برخی گزینه‌های فیلتر بارگذاری نشدند؛ می‌توانید با جست‌وجو ادامه دهید.')}</p>}
                        {filtersLoading && <p className="mt-4 text-xs text-muted">{t('در حال آماده‌سازی گزینه‌های فیلتر…')}</p>}
                        {loading ? (
                            <div className="mt-6 grid gap-x-5 gap-y-9 sm:grid-cols-2 xl:grid-cols-3">{[0, 1, 2, 3, 4, 5].map((item) => <ArtworkCardSkeleton key={item} />)}</div>
                        ) : error ? (
                            <ErrorState className="mt-8" title={t('دریافت گالری با خطا روبه‌رو شد')} description={t('اتصال را بررسی کنید و دوباره تلاش کنید.')} onRetry={() => artworksQuery.refetch()} />
                        ) : artworks.length ? (
                            <div className="mt-6 grid gap-x-5 gap-y-9 sm:grid-cols-2 xl:grid-cols-3">{artworks.map((artwork) => <ArtworkCard key={artwork.id} artwork={artwork} />)}</div>
                        ) : (
                            <EmptyState className="mt-8" title={t('اثری با این مشخصات پیدا نشد')} description={t('عبارت جست‌وجو یا گزینه‌های فیلتر را تغییر دهید.')} />
                        )}
                        {!loading && !error && artworks.length > 0 && (
                            <div className="mt-10 flex min-h-16 flex-col items-center justify-center gap-3 border-t border-border pt-6" aria-live="polite">
                                {artworksQuery.isFetchNextPageError && <p role="alert" className="text-sm text-danger">{t('دریافت آثار بیشتر انجام نشد.')}</p>}
                                {artworksQuery.hasNextPage ? (
                                    <>
                                        <span ref={loadMoreRef} className="h-px w-full" aria-hidden="true" />
                                        <Button type="button" variant="outline" disabled={loadingMore} onClick={() => fetchNextPage()}>
                                            {loadingMore ? t('در حال دریافت آثار…') : t('بارگذاری آثار بیشتر')}
                                        </Button>
                                    </>
                                ) : (
                                    <p className="text-xs text-muted">{locale === 'fa' ? `همه ${meta.total.toLocaleString('fa-IR')} اثر نمایش داده شدند.` : `All ${meta.total.toLocaleString('en-US')} artworks are displayed.`}</p>
                                )}
                            </div>
                        )}
                    </main>
                    <aside dir={locale === 'fa' ? 'rtl' : 'ltr'} className="hidden min-w-0 lg:sticky lg:top-24 lg:col-start-2 lg:block">
                        <div className="border border-border bg-paper p-5 shadow-sm">
                            <FilterPanel
                                categories={categories}
                                filters={filters}
                                values={values}
                                onChange={updateFilters}
                                onClear={clearDesktopFilters}
                                locale={locale}
                                t={t}
                            />
                            {filtersError && <p role="status" className="mt-3 text-xs text-muted">{t('بارگذاری برخی گزینه‌ها با مشکل روبه‌رو شد.')}</p>}
                        </div>
                        <p className="mt-3 px-1 text-[11px] leading-5 text-muted">{t('فیلترها را تغییر دهید؛ گالری به‌صورت خودکار به‌روز می‌شود.')}</p>
                    </aside>
                </div>
            </Container>
        </div>
    );
}
