import { createElement, useEffect, useState } from 'react';
import axios from 'axios';
import ContactArtistForm from './ContactArtistForm';
import { formatArtworkPrice } from '../utils/formatArtworkPrice';

export default function ArtworkGallery({ user }) {
    const detailSlug = window.location.pathname.match(/^[/]artworks[/]([^/]+)$/)?.[1];
    const [categories, setCategories] = useState([]);
    const [artworks, setArtworks] = useState([]);
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');

    useEffect(() => {
        if (detailSlug) {
            axios.get('/api/v1/artworks/' + encodeURIComponent(detailSlug))
                .then(({ data }) => setDetail(data.data))
                .catch(() => setError(true))
                .finally(() => setLoading(false));
            return;
        }

        axios.get('/api/v1/categories').then(({ data }) => setCategories(data.data)).catch(() => setCategories([]));
    }, [detailSlug]);

    useEffect(() => {
        if (detailSlug) return;

        setLoading(true);
        setError(false);
        axios.get('/api/v1/artworks', { params: { q: search || undefined, category: category || undefined } })
            .then(({ data }) => setArtworks(data.data))
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    }, [category, detailSlug, search]);

    if (detailSlug) {
        return (
            <main className="min-h-screen bg-canvas px-6 py-12 text-ink" dir="rtl">
                <article className="mx-auto max-w-4xl rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-10">
                    <a href="/" className="font-black text-terracotta-strong">بازگشت به راد آرت</a>
                    {loading ? <p className="mt-10 text-stone-500">در حال دریافت اثر…</p> : error || !detail ? (
                        <div className="mt-10"><h1 className="text-2xl font-black">اثر در دسترس نیست</h1><p className="mt-3 text-stone-500">این اثر وجود ندارد یا هنوز برای نمایش عمومی تأیید نشده است.</p></div>
                    ) : (
                        <div className="mt-8 grid gap-8 md:grid-cols-[1.1fr_.9fr]">
                            <img src={detail.image_url} alt={detail.title} className="w-full rounded-2xl object-cover" />
                            <div>
                                <p className="text-sm font-bold text-terracotta-strong">{detail.category.name}</p>
                                <h1 className="mt-3 text-3xl font-black leading-relaxed">{detail.title}</h1>
                                <p className="mt-3 text-sm text-stone-500">{detail.medium} {detail.dimensions ? '· ' + detail.dimensions : ''}</p>
                                {detail.description && <p className="mt-6 whitespace-pre-line leading-8 text-stone-700">{detail.description}</p>}
                                <p className="mt-6 font-bold">{formatArtworkPrice(detail.price)}</p>
                                <p className="mt-2 text-sm text-stone-500">{detail.availability === 'available' ? 'موجود' : detail.availability === 'sold' ? 'فروخته‌شده' : 'برای فروش نیست'}</p>
                                <a href={'/artists/' + detail.artist.slug} className="mt-8 inline-block rounded-full bg-ink px-5 py-3 text-sm font-bold text-white">مشاهده پروفایل هنرمند: {detail.artist.display_name}</a>
                                {user?.role === 'buyer' && createElement(ContactArtistForm, { artistSlug: detail.artist.slug, artworkId: detail.id })}
                                {!user && <a href="/#account" className="mt-6 inline-block text-sm font-bold text-terracotta-strong underline">برای تماس با هنرمند وارد شوید یا ثبت‌نام کنید</a>}
                            </div>
                        </div>
                    )}
                </article>
            </main>
        );
    }

    return (
        <section id="artworks" className="mx-auto max-w-7xl px-6 py-20 lg:px-10" dir="rtl">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
                <div>
                    <p className="text-sm font-bold text-terracotta-strong">کاتالوگ راد آرت</p>
                    <h2 className="mt-2 text-3xl font-black">آثار منتخب هنرمندان</h2>
                    <p className="mt-3 text-sm leading-7 text-stone-500">آثاری که بررسی و برای نمایش عمومی تأیید شده‌اند.</p>
                </div>
                <form onSubmit={(event) => { event.preventDefault(); setSearch(searchInput.trim()); }} className="flex flex-wrap gap-2">
                    <input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} aria-label="جست‌وجو در آثار" placeholder="جست‌وجوی عنوان یا تکنیک…" className="min-w-[220px] rounded-full border border-stone-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-terracotta" />
                    <select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="فیلتر دسته‌بندی" className="rounded-full border border-stone-300 bg-white px-4 py-2.5 text-sm">
                        <option value="">همه دسته‌ها</option>
                        {categories.map((item) => <option key={item.id} value={item.slug}>{item.name}</option>)}
                    </select>
                    <button className="rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-white">جست‌وجو</button>
                </form>
            </div>
            {loading ? <p className="mt-8 text-sm text-stone-500">در حال بارگذاری آثار…</p> : error ? (
                <p role="alert" className="mt-8 rounded-xl bg-white p-5 text-sm text-red-700">دریافت کاتالوگ با خطا روبه‌رو شد.</p>
            ) : artworks.length === 0 ? (
                <p className="mt-8 rounded-xl border border-stone-200 bg-white p-8 text-sm text-stone-500">هنوز اثری برای نمایش در این دسته‌بندی ثبت نشده است.</p>
            ) : (
                <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {artworks.map((artwork) => (
                        <a key={artwork.id} href={'/artworks/' + artwork.slug} className="group overflow-hidden rounded-2xl border border-stone-200 bg-white transition hover:-translate-y-1 hover:shadow-lg">
                            <img src={artwork.image_url} alt={artwork.title} loading="lazy" className="aspect-[4/3] w-full object-cover transition group-hover:scale-[1.02]" />
                            <div className="p-5">
                                <p className="text-xs font-bold text-terracotta-strong">{artwork.category.name}</p>
                                <h3 className="mt-2 text-lg font-extrabold">{artwork.title}</h3>
                                <p className="mt-2 text-sm text-stone-500">{artwork.artist.display_name}</p>
                                <p className="mt-4 text-sm font-bold">{formatArtworkPrice(artwork.price)}</p>
                            </div>
                        </a>
                    ))}
                </div>
            )}
        </section>
    );
}
