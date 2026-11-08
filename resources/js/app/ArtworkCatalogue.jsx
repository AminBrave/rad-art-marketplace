import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function ArtworkCatalogue() {
    const [categories, setCategories] = useState([]);
    const [artworks, setArtworks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');

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
    }, [category, search]);

    return (
        <section id="artworks" className="mx-auto max-w-7xl px-6 py-20 lg:px-10" dir="rtl">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
                <div>
                    <p className="text-sm font-bold text-[#b65c3a]">کاتالوگ راد آرت</p>
                    <h2 className="mt-2 text-3xl font-black">آثار منتخب هنرمندان</h2>
                    <p className="mt-3 text-sm leading-7 text-stone-500">آثاری که بررسی و برای نمایش عمومی تأیید شده‌اند.</p>
                </div>
                <form onSubmit={(event) => { event.preventDefault(); setSearch(searchInput.trim()); }} className="flex flex-wrap gap-2">
                    <input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} aria-label="جست‌وجو در آثار" placeholder="جست‌وجوی عنوان یا تکنیک…" className="min-w-[220px] rounded-full border border-stone-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#b65c3a]" />
                    <select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="فیلتر دسته‌بندی" className="rounded-full border border-stone-300 bg-white px-4 py-2.5 text-sm">
                        <option value="">همه دسته‌ها</option>
                        {categories.map((item) => <option key={item.id} value={item.slug}>{item.name}</option>)}
                    </select>
                    <button className="rounded-full bg-[#20201e] px-5 py-2.5 text-sm font-bold text-white">جست‌وجو</button>
                </form>
            </div>
            {loading ? <p className="mt-8 text-sm text-stone-500">در حال بارگذاری آثار…</p> : error ? (
                <p role="alert" className="mt-8 rounded-xl bg-white p-5 text-sm text-red-700">دریافت کاتالوگ با خطا روبه‌رو شد.</p>
            ) : artworks.length === 0 ? (
                <p className="mt-8 rounded-xl border border-stone-200 bg-white p-8 text-sm text-stone-500">هنوز اثری برای نمایش در این دسته‌بندی ثبت نشده است.</p>
            ) : (
                <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {artworks.map((artwork) => (
                        <Link key={artwork.id} to={'/artworks/' + artwork.slug} className="group overflow-hidden rounded-2xl border border-stone-200 bg-white transition hover:-translate-y-1 hover:shadow-lg">
                            <img src={artwork.image_url} alt={artwork.title} loading="lazy" className="aspect-[4/3] w-full object-cover transition group-hover:scale-[1.02]" />
                            <div className="p-5">
                                <p className="text-xs font-bold text-[#b65c3a]">{artwork.category.name}</p>
                                <h3 className="mt-2 text-lg font-extrabold">{artwork.title}</h3>
                                <p className="mt-2 text-sm text-stone-500">{artwork.artist.display_name}</p>
                                <p className="mt-4 text-sm font-bold">{artwork.price ? Number(artwork.price).toLocaleString('fa-IR') + ' ریال' : 'قیمت توافقی'}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </section>
    );
}
