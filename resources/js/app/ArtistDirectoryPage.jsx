import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import { ArtistCard, ArtistCardSkeleton, EmptyState, ErrorState, SearchField } from '../components/ui';

export default function ArtistDirectoryPage() {
    const [params, setParams] = useSearchParams();
    const query = params.get('q') ?? '';
    const page = Math.max(1, Number.parseInt(params.get('page') ?? '1', 10) || 1);
    const [input, setInput] = useState(query);

    useEffect(() => setInput(query), [query]);

    const artistsQuery = useQuery({
        queryKey: ['artists', { query, page }],
        queryFn: async ({ signal }) => {
            const { data } = await axios.get('/api/v1/artists', {
                params: { q: query || undefined, page },
                signal,
            });

            return data;
        },
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
        <main className="mx-auto min-h-[65vh] max-w-7xl px-5 pb-16 pt-8 sm:px-8 sm:pt-12 lg:px-10" dir="rtl">
            <nav aria-label="مسیر صفحه" className="text-xs text-muted">
                <span>خانه</span><span className="mx-2" aria-hidden="true">/</span><span aria-current="page" className="text-ink">هنرمندان</span>
            </nav>

            <header className="relative mt-6 overflow-hidden border-y border-border bg-surface-muted px-6 py-10 sm:px-10 sm:py-14 lg:px-14">
                <div aria-hidden="true" className="absolute -left-10 -top-16 h-56 w-56 rounded-full border border-sand/80" />
                <div aria-hidden="true" className="absolute -left-2 -top-8 h-40 w-40 rounded-full border border-sand/70" />
                <div className="relative max-w-3xl">
                    <p className="text-xs font-bold tracking-wide text-terracotta-strong">جامعه خلاق راد آرت</p>
                    <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">هنرمند را کشف کنید.</h1>
                    <p className="mt-5 max-w-2xl text-sm leading-8 text-muted sm:text-base">
                        با هنرمندان مستقل آشنا شوید؛ از نگاه و مسیر هنری آن‌ها بخوانید و مجموعه آثار تأییدشده‌شان را ببینید.
                    </p>
                    <div className="mt-8 max-w-2xl">
                        <SearchField value={input} onChange={(event) => setInput(event.target.value)} onSearch={submitSearch} label="جست‌وجوی هنرمند" placeholder="نام هنرمند یا شهر…" />
                    </div>
                </div>
            </header>

            <section className="mt-10" aria-labelledby="artist-directory-heading">
                <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border pb-4">
                    <div>
                        <p className="text-[11px] font-bold text-terracotta-strong">جامعه هنرمندان</p>
                        <h2 id="artist-directory-heading" className="mt-1 text-xl font-black sm:text-2xl">{query ? 'نتایج جست‌وجو' : 'چهره‌های خلاق'}</h2>
                    </div>
                    <p className="text-xs text-muted" aria-live="polite">
                        {loading ? 'در حال دریافت هنرمندان…' : meta.total.toLocaleString('fa-IR') + ' هنرمند'}
                        {artistsQuery.isFetching && !loading ? ' · به‌روزرسانی…' : ''}
                    </p>
                </div>

                {loading ? (
                    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2, 3, 4, 5].map((item) => <ArtistCardSkeleton key={item} />)}</div>
                ) : error ? (
                    <ErrorState className="mt-8" title="دریافت فهرست هنرمندان ممکن نشد" description="لطفاً دوباره تلاش کنید." onRetry={() => artistsQuery.refetch()} />
                ) : artists.length ? (
                    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">{artists.map((artist) => <ArtistCard key={artist.id} artist={artist} />)}</div>
                ) : (
                    <EmptyState className="mt-8" title="هنرمندی پیدا نشد" description="نام یا شهر دیگری را جست‌وجو کنید." />
                )}
            </section>

            {!loading && !error && meta.last_page > 1 && (
                <nav aria-label="صفحه‌بندی هنرمندان" className="mt-10 flex items-center justify-center gap-4">
                    <button type="button" disabled={page <= 1} onClick={() => updatePage(page - 1)} className="min-h-11 border border-border px-5 py-2 text-sm font-semibold transition-colors hover:border-terracotta disabled:cursor-not-allowed disabled:opacity-40">قبلی</button>
                    <span className="text-sm text-muted">صفحه {meta.current_page.toLocaleString('fa-IR')} از {meta.last_page.toLocaleString('fa-IR')}</span>
                    <button type="button" disabled={page >= meta.last_page} onClick={() => updatePage(page + 1)} className="min-h-11 border border-border px-5 py-2 text-sm font-semibold transition-colors hover:border-terracotta disabled:cursor-not-allowed disabled:opacity-40">بعدی</button>
                </nav>
            )}
        </main>
    );
}
