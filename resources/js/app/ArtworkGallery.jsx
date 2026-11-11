import { Button, Input, Select } from '../components/ui';
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
            <main className="min-h-screen bg-background px-6 py-12 text-foreground" dir="rtl">
                <article className="mx-auto max-w-4xl rounded-lg border border-border bg-card p-6 shadow-sm sm:p-10">
                    <a href="/" className="font-semibold text-primary">بازگشت به راد آرت</a>
                    {loading ? <p className="mt-10 text-muted-foreground">در حال دریافت اثر…</p> : error || !detail ? (
                        <div className="mt-10"><h1 className="text-2xl font-semibold">اثر در دسترس نیست</h1><p className="mt-3 text-muted-foreground">این اثر وجود ندارد یا هنوز برای نمایش عمومی تأیید نشده است.</p></div>
                    ) : (
                        <div className="mt-8 grid gap-8 md:grid-cols-[1.1fr_.9fr]">
                            <img src={detail.image_url} alt={detail.title} className="w-full rounded-lg object-cover" />
                            <div>
                                <p className="text-sm font-bold text-primary">{detail.category.name}</p>
                                <h1 className="mt-3 text-3xl font-semibold leading-relaxed">{detail.title}</h1>
                                <p className="mt-3 text-sm text-muted-foreground">{detail.medium} {detail.dimensions ? '· ' + detail.dimensions : ''}</p>
                                {detail.description && <p className="mt-6 whitespace-pre-line leading-8 text-foreground">{detail.description}</p>}
                                <p className="mt-6 font-bold">{formatArtworkPrice(detail.price)}</p>
                                <p className="mt-2 text-sm text-muted-foreground">{detail.availability === 'available' ? 'موجود' : detail.availability === 'sold' ? 'فروخته‌شده' : 'برای فروش نیست'}</p>
                                <Button asChild variant="default" size="default" className="mt-8 inline-block"><a href={'/artists/' + detail.artist.slug}>مشاهده پروفایل هنرمند: {detail.artist.display_name}</a></Button>
                                {user?.role === 'buyer' && createElement(ContactArtistForm, { artistSlug: detail.artist.slug, artworkId: detail.id })}
                                {!user && <a href="/#account" className="mt-6 inline-block text-sm font-bold text-primary underline">برای تماس با هنرمند وارد شوید یا ثبت‌نام کنید</a>}
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
                    <p className="text-sm font-bold text-primary">کاتالوگ راد آرت</p>
                    <h2 className="mt-2 text-3xl font-semibold">آثار منتخب هنرمندان</h2>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">آثاری که بررسی و برای نمایش عمومی تأیید شده‌اند.</p>
                </div>
                <form onSubmit={(event) => { event.preventDefault(); setSearch(searchInput.trim()); }} className="flex flex-wrap gap-2">
                    <Input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} aria-label="جست‌وجو در آثار" placeholder="جست‌وجوی عنوان یا تکنیک…"  className="min-w-[220px]" />
                    <Select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="فیلتر دسته‌بندی">
                        <option value="">همه دسته‌ها</option>
                        {categories.map((item) => <option key={item.id} value={item.slug}>{item.name}</option>)}
                    </Select>
                    <Button variant="default" size="default" type="submit">جست‌وجو</Button>
                </form>
            </div>
            {loading ? <p className="mt-8 text-sm text-muted-foreground">در حال بارگذاری آثار…</p> : error ? (
                <p role="alert" className="mt-8 rounded-xl bg-card p-5 text-sm text-destructive">دریافت کاتالوگ با خطا روبه‌رو شد.</p>
            ) : artworks.length === 0 ? (
                <p className="mt-8 rounded-xl border border-border bg-card p-8 text-sm text-muted-foreground">هنوز اثری برای نمایش در این دسته‌بندی ثبت نشده است.</p>
            ) : (
                <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {artworks.map((artwork) => (
                        <a key={artwork.id} href={'/artworks/' + artwork.slug} className="group overflow-hidden rounded-lg border border-border bg-card transition hover:-translate-y-1 hover:shadow-lg">
                            <img src={artwork.image_url} alt={artwork.title} loading="lazy" className="aspect-[4/3] w-full object-cover transition group-hover:scale-[1.02]" />
                            <div className="p-5">
                                <p className="text-xs font-bold text-primary">{artwork.category.name}</p>
                                <h3 className="mt-2 text-lg font-semibold">{artwork.title}</h3>
                                <p className="mt-2 text-sm text-muted-foreground">{artwork.artist.display_name}</p>
                                <p className="mt-4 text-sm font-bold">{formatArtworkPrice(artwork.price)}</p>
                            </div>
                        </a>
                    ))}
                </div>
            )}
        </section>
    );
}
