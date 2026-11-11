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

    return (
        <main className="mx-auto min-h-[65vh] max-w-7xl px-5 py-12 sm:px-8 lg:px-10" dir="rtl">
            <header className="border-b border-border pb-8">
                <p className="text-xs font-bold text-primary">جامعه خلاق راد آرت</p>
                <h1 className="mt-2 text-3xl font-black sm:text-4xl">هنرمندان</h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground-foreground">با هنرمندان دارای پروفایل عمومی آشنا شوید و مسیر هنری و آثار تأییدشده آن‌ها را دنبال کنید.</p>
            </header>
            <div className="mt-7 max-w-2xl">
                <SearchField value={input} onChange={(event) => setInput(event.target.value)} onSearch={(value) => setParams(value.trim() ? { q: value.trim() } : {})} label="جست‌وجوی هنرمند" placeholder="نام هنرمند یا شهر…" />
            </div>
            <p className="mt-6 text-xs text-muted-foreground-foreground">{loading ? 'در حال دریافت هنرمندان…' : meta.total.toLocaleString('fa-IR') + ' هنرمند'}</p>
            {loading ? (
                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2, 3, 4, 5].map((item) => <ArtistCardSkeleton key={item} />)}</div>
            ) : error ? (
                <ErrorState className="mt-8" title="دریافت فهرست هنرمندان ممکن نشد" description="لطفاً دوباره تلاش کنید." onRetry={() => artistsQuery.refetch()} />
            ) : artists.length ? (
                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{artists.map((artist) => <ArtistCard key={artist.id} artist={artist} />)}</div>
            ) : (
                <EmptyState className="mt-8" title="هنرمندی پیدا نشد" description="نام یا شهر دیگری را جست‌وجو کنید." />
            )}
            {!loading && !error && meta.last_page > 1 && (
                <nav aria-label="صفحه‌بندی هنرمندان" className="mt-10 flex items-center justify-center gap-4">
                    <button type="button" disabled={page <= 1} onClick={() => updatePage(page - 1)} className="border border-border px-4 py-2 text-sm font-semibold disabled:opacity-40">قبلی</button>
                    <span className="text-sm text-muted-foreground-foreground">صفحه {meta.current_page.toLocaleString('fa-IR')} از {meta.last_page.toLocaleString('fa-IR')}</span>
                    <button type="button" disabled={page >= meta.last_page} onClick={() => updatePage(page + 1)} className="border border-border px-4 py-2 text-sm font-semibold disabled:opacity-40">بعدی</button>
                </nav>
            )}
        </main>
    );
}
