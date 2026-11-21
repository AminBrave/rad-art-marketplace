import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import { ArtworkCard, ArtworkCardSkeleton, EmptyState, ErrorState, SearchField, SelectField, PageContainer, PageHeader } from '../components/ui';

const emptyFilters = { mediums: [], availability: [], sorts: [] };

export default function ArtworkCatalogue() {
    const [params, setParams] = useSearchParams();
    const search = params.get('q') ?? '';
    const category = params.get('category') ?? '';
    const medium = params.get('medium') ?? '';
    const availability = params.get('availability') ?? '';
    const sort = params.get('sort') ?? 'newest';
    const page = Math.max(1, Number.parseInt(params.get('page') ?? '1', 10) || 1);
    const [searchInput, setSearchInput] = useState(search);

    useEffect(() => setSearchInput(search), [search]);

    const filtersQuery = useQuery({
        queryKey: ['artwork-catalogue', 'filters'],
        queryFn: async ({ signal }) => {
            const [categoryResponse, filterResponse] = await Promise.all([
                axios.get('/api/v1/categories', { signal }),
                axios.get('/api/v1/artwork-filters', { signal }),
            ]);

            return {
                categories: categoryResponse.data.data ?? [],
                filters: filterResponse.data.data ?? emptyFilters,
            };
        },
        staleTime: 5 * 60_000,
    });

    const artworksQuery = useQuery({
        queryKey: ['artworks', { search, category, medium, availability, sort, page }],
        queryFn: async ({ signal }) => {
            const { data } = await axios.get('/api/v1/artworks', {
                params: {
                    q: search || undefined,
                    category: category || undefined,
                    medium: medium || undefined,
                    availability: availability || undefined,
                    sort: sort === 'newest' ? undefined : sort,
                    page,
                },
                signal,
            });

            return data;
        },
        placeholderData: (previousData) => previousData,
        staleTime: 30_000,
    });

    const categories = filtersQuery.data?.categories ?? [];
    const filters = filtersQuery.data?.filters ?? emptyFilters;
    const artworks = artworksQuery.data?.data ?? [];
    const meta = {
        current_page: artworksQuery.data?.current_page ?? page,
        last_page: artworksQuery.data?.last_page ?? 1,
        total: artworksQuery.data?.total ?? 0,
    };
    const loading = artworksQuery.isPending;
    const error = artworksQuery.isError;
    const filtersLoading = filtersQuery.isPending;
    const filtersError = filtersQuery.isError;

    const activeFilters = useMemo(() => {
        const selected = [];

        if (search) selected.push({ key: 'q', label: 'جست‌وجو: ' + search });
        if (category) {
            const option = categories.find((item) => item.slug === category);
            selected.push({ key: 'category', label: 'دسته: ' + (option?.name ?? category) });
        }
        if (medium) selected.push({ key: 'medium', label: 'تکنیک: ' + medium });
        if (availability) {
            const option = filters.availability?.find((item) => item.value === availability);
            selected.push({ key: 'availability', label: 'وضعیت: ' + (option?.label ?? availability) });
        }
        if (sort !== 'newest') {
            const option = filters.sorts?.find((item) => item.value === sort);
            selected.push({ key: 'sort', label: 'مرتب‌سازی: ' + (option?.label ?? sort) });
        }

        return selected;
    }, [search, category, medium, availability, sort, categories, filters]);

    const activeFilterCount = activeFilters.length;

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
    const removeFilter = (key) => updateFilters({ [key]: key === 'sort' ? 'newest' : '' });
    const clearFilters = () => {
        setSearchInput('');
        setParams({});
    };

    return (
        <PageContainer as="main" className="min-w-0 max-w-full box-border min-h-[65vh] py-10 lg:py-14" dir="rtl">
            <PageHeader eyebrow="آرشیو عمومی راد آرت" title="گالری آثار" description="در میان آثار تأییدشده هنرمندان جست‌وجو کنید؛ بر اساس دسته، تکنیک و وضعیت اثر مسیر کشف خود را دقیق‌تر کنید." />

            <section aria-label="فیلتر و مرتب‌سازی آثار" className="mt-7 border border-border bg-surface-muted p-4 sm:p-5 lg:p-6">
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(18rem,1.5fr)_repeat(2,minmax(11rem,1fr))]">
                    <SearchField value={searchInput} onChange={(event) => setSearchInput(event.target.value)} onSearch={submitSearch} label="جست‌وجو در آثار و هنرمندان" placeholder="عنوان، توضیحات، تکنیک یا نام هنرمند…" />
                    <SelectField value={category} onChange={(event) => updateFilters({ category: event.target.value })} aria-label="فیلتر دسته‌بندی">
                        <option value="">همه دسته‌ها</option>
                        {categories.map((item) => <option key={item.id} value={item.slug}>{item.name}</option>)}
                    </SelectField>
                    <SelectField value={medium} onChange={(event) => updateFilters({ medium: event.target.value })} aria-label="فیلتر تکنیک و مواد">
                        <option value="">همه تکنیک‌ها</option>
                        {(filters.mediums ?? []).map((item) => <option key={item} value={item}>{item}</option>)}
                    </SelectField>
                    <SelectField value={availability} onChange={(event) => updateFilters({ availability: event.target.value })} aria-label="فیلتر وضعیت اثر">
                        <option value="">همه وضعیت‌ها</option>
                        {(filters.availability ?? []).map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                    </SelectField>
                    <SelectField value={sort} onChange={(event) => updateFilters({ sort: event.target.value })} aria-label="مرتب‌سازی آثار">
                        {(filters.sorts?.length ? filters.sorts : [{ value: 'newest', label: 'جدیدترین' }]).map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                    </SelectField>
                    <div className="flex items-center justify-between gap-3">
                        <p className="text-xs text-muted">{activeFilterCount ? activeFilterCount.toLocaleString('fa-IR') + ' فیلتر فعال' : 'بدون فیلتر'}</p>
                        {activeFilterCount > 0 && <button type="button" onClick={clearFilters} className="text-sm font-bold text-terracotta-strong underline underline-offset-4">پاک‌کردن فیلترها</button>}
                    </div>
                </div>
                {filtersError && <p role="status" className="mt-3 text-xs text-muted">برخی گزینه‌های فیلتر بارگذاری نشدند؛ می‌توانید با جست‌وجو و دسته‌بندی ادامه دهید.</p>}
                {filtersLoading && <p className="mt-3 text-xs text-muted">در حال آماده‌سازی گزینه‌های فیلتر…</p>}
            </section>

            {activeFilters.length > 0 && (
                <section className="mt-4 flex flex-wrap items-center gap-2" aria-label="فیلترهای فعال">
                    <span className="me-1 text-xs font-semibold text-muted">انتخاب‌های شما:</span>
                    {activeFilters.map((filter) => (
                        <button
                            key={filter.key}
                            type="button"
                            onClick={() => removeFilter(filter.key)}
                            aria-label={'حذف ' + filter.label}
                            className="inline-flex min-h-9 max-w-full items-center gap-2 rounded-full border border-border bg-paper px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-terracotta hover:text-terracotta-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                        >
                            <span className="break-words">{filter.label}</span>
                            <span aria-hidden="true" className="text-base leading-none text-muted">×</span>
                        </button>
                    ))}
                </section>
            )}

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
                <p aria-live="polite" className="text-sm text-muted">
                    {loading ? 'در حال دریافت آثار…' : artworksQuery.isFetching ? 'در حال به‌روزرسانی نتایج…' : meta.total.toLocaleString('fa-IR') + ' اثر'}
                </p>
                <p className="text-xs text-muted">نمایش آثار عمومی و تأییدشده</p>
            </div>
            {loading ? (
                <div className="mt-6 grid gap-x-5 gap-y-9 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{[0, 1, 2, 3, 4, 5].map((item) => <ArtworkCardSkeleton key={item} />)}</div>
            ) : error ? (
                <ErrorState className="mt-8" title="دریافت گالری با خطا روبه‌رو شد" description="اتصال را بررسی کنید و دوباره تلاش کنید." onRetry={() => artworksQuery.refetch()} />
            ) : artworks.length ? (
                <div className="mt-6 grid gap-x-5 gap-y-9 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{artworks.map((artwork) => <ArtworkCard key={artwork.id} artwork={artwork} />)}</div>
            ) : (
                <EmptyState className="mt-8" title="اثری با این مشخصات پیدا نشد" description="عبارت جست‌وجو یا گزینه‌های فیلتر را تغییر دهید." />
            )}
            {!loading && !error && meta.last_page > 1 && (
                <nav aria-label="صفحه‌بندی آثار" className="mt-10 flex items-center justify-center gap-4">
                    <button type="button" disabled={page <= 1} onClick={() => setParams(Object.fromEntries([...params.entries(), ['page', String(page - 1)]]))} className="min-h-11 border border-border px-5 py-2 text-sm font-semibold transition-colors hover:border-terracotta disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">قبلی</button>
                    <span className="text-sm text-muted">صفحه {meta.current_page.toLocaleString('fa-IR')} از {meta.last_page.toLocaleString('fa-IR')}</span>
                    <button type="button" disabled={page >= meta.last_page} onClick={() => setParams(Object.fromEntries([...params.entries(), ['page', String(page + 1)]]))} className="min-h-11 border border-border px-5 py-2 text-sm font-semibold transition-colors hover:border-terracotta disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">بعدی</button>
                </nav>
            )}
        </PageContainer>
    );
}
