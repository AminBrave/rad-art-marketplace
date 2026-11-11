import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import { ArtworkCard, ArtworkCardSkeleton, EmptyState, ErrorState, SearchField, SelectField } from '../components/ui';

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

    return (
        <main className="mx-auto min-h-[65vh] max-w-7xl px-5 py-10 sm:px-8 lg:px-10 lg:py-14" dir="rtl">
            <header className="border-b border-border pb-8 sm:pb-10">
                <p className="text-xs font-bold tracking-wide text-terracotta-strong">آرشیو عمومی راد آرت</p>
                <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">گالری آثار</h1>
                <p className="mt-3 max-w-2xl text-sm leading-8 text-muted">در میان آثار تأییدشده هنرمندان جست‌وجو کنید؛ بر اساس دسته، تکنیک و وضعیت اثر مسیر کشف خود را دقیق‌تر کنید.</p>
            </header>

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

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
                <p aria-live="polite" className="text-sm text-muted">{loading ? 'در حال دریافت آثار…' : meta.total.toLocaleString('fa-IR') + ' اثر'}</p>
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
                    <button type="button" disabled={page <= 1} onClick={() => setParams(Object.fromEntries([...params.entries(), ['page', String(page - 1)]]))} className="border border-border px-4 py-2 text-sm font-semibold disabled:opacity-40">قبلی</button>
                    <span className="text-sm text-muted">صفحه {meta.current_page.toLocaleString('fa-IR')} از {meta.last_page.toLocaleString('fa-IR')}</span>
                    <button type="button" disabled={page >= meta.last_page} onClick={() => setParams(Object.fromEntries([...params.entries(), ['page', String(page + 1)]]))} className="border border-border px-4 py-2 text-sm font-semibold disabled:opacity-40">بعدی</button>
                </nav>
            )}
        </main>
    );
}
