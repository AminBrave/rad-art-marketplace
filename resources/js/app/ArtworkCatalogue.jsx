import { useEffect, useState } from 'react';
import axios from 'axios';
import {
    ArtworkCard,
    EmptyState,
    ErrorState,
    SearchField,
    SelectField,
    Skeleton,
    SkeletonLines,
} from '../components/ui';

export default function ArtworkCatalogue() {
    const [categories, setCategories] = useState([]);
    const [artworks, setArtworks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        axios.get('/api/v1/categories')
            .then(({ data }) => setCategories(data.data))
            .catch(() => setCategories([]));
    }, []);

    useEffect(() => {
        let active = true;
        setLoading(true);
        setError(false);
        axios.get('/api/v1/artworks', { params: { q: search || undefined, category: category || undefined } })
            .then(({ data }) => { if (active) setArtworks(data.data); })
            .catch(() => { if (active) setError(true); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [category, retryCount, search]);

    return (
        <section id="artworks" className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-20" dir="rtl">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
                <div>
                    <p className="text-sm font-bold text-terracotta-strong">کاتالوگ راد آرت</p>
                    <h2 className="mt-2 text-3xl font-black">آثار منتخب هنرمندان</h2>
                    <p className="mt-3 text-sm leading-7 text-muted">آثاری که بررسی و برای نمایش عمومی تأیید شده‌اند.</p>
                </div>
                <div className="grid w-full gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(10rem,auto)] md:max-w-2xl">
                    <SearchField
                        value={searchInput}
                        onChange={(event) => setSearchInput(event.target.value)}
                        onSearch={(value) => setSearch(value.trim())}
                        label="جست‌وجو در آثار"
                        placeholder="جست‌وجوی عنوان یا تکنیک…"
                    />
                    <SelectField
                        value={category}
                        onChange={(event) => setCategory(event.target.value)}
                        aria-label="فیلتر دسته‌بندی"
                    >
                        <option value="">همه دسته‌ها</option>
                        {categories.map((item) => <option key={item.id} value={item.slug}>{item.name}</option>)}
                    </SelectField>
                </div>
            </div>

            {loading ? (
                <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-label="در حال بارگذاری آثار" role="status">
                    {Array.from({ length: 6 }, (_, index) => (
                        <div key={index} className="grid gap-3 border border-border bg-paper p-3">
                            <Skeleton height="12rem" />
                            <SkeletonLines lines={2} />
                        </div>
                    ))}
                </div>
            ) : error ? (
                <ErrorState
                    className="mt-8"
                    title="دریافت کاتالوگ با خطا روبه‌رو شد"
                    description="اتصال را بررسی کنید و دوباره تلاش کنید."
                    onRetry={() => setRetryCount((count) => count + 1)}
                />
            ) : artworks.length === 0 ? (
                <EmptyState
                    className="mt-8"
                    title="اثری برای نمایش پیدا نشد"
                    description="عبارت جست‌وجو یا دسته‌بندی را تغییر دهید، یا بعداً دوباره سر بزنید."
                />
            ) : (
                <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {artworks.map((artwork) => <ArtworkCard key={artwork.id} artwork={artwork} />)}
                </div>
            )}
        </section>
    );
}
