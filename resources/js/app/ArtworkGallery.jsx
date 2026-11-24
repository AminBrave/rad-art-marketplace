import { useEffect, useState } from 'react';
import axios from 'axios';
import { formatArtworkPrice } from '../utils/formatArtworkPrice';
import { MediaImage, SelectField, TextInput, Button, Container } from '../components/ui';

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
            <main className="min-h-screen w-full bg-canvas py-12 text-ink" dir="rtl">
                <Container width="wide">
                <article className="mx-auto max-w-4xl rounded-card border border-border bg-paper p-6 shadow-sm sm:p-10">
                    <a href="/" className="font-black text-terracotta-strong">بازگشت به راد آرت</a>
                    {loading ? <p className="mt-10 text-muted">در حال دریافت اثر…</p> : error || !detail ? (
                        <div className="mt-10"><h1 className="text-2xl font-black">اثر در دسترس نیست</h1><p className="mt-3 text-muted">این اثر وجود ندارد یا هنوز برای نمایش عمومی تأیید نشده است.</p></div>
                    ) : (
                        <div className="mt-8 grid gap-8 md:grid-cols-[1.1fr_.9fr]">
                            <MediaImage src={detail.image_url} alt={detail.title} className="aspect-[3/4] w-full" imageClassName="object-cover" loading="eager" fetchPriority="high" />
                            <div>
                                <p className="text-sm font-bold text-terracotta-strong">{detail.category.name}</p>
                                <h1 className="mt-3 text-3xl font-black leading-relaxed">{detail.title}</h1>
                                <p className="mt-3 text-sm text-muted">{detail.medium} {detail.dimensions ? '· ' + detail.dimensions : ''}</p>
                                {detail.description && <p className="mt-6 whitespace-pre-line leading-8 text-ink">{detail.description}</p>}
                                <p className="mt-6 font-bold">{formatArtworkPrice(detail.price)}</p>
                                <p className="mt-2 text-sm text-muted">{detail.availability === 'available' ? 'موجود' : detail.availability === 'sold' ? 'فروخته‌شده' : 'برای فروش نیست'}</p>
                                <a href={'/artists/' + detail.artist.slug} className="mt-8 inline-block rounded-control bg-ink px-5 py-3 text-sm font-bold text-inverse">مشاهده پروفایل هنرمند: {detail.artist.display_name}</a>
                                {user?.role === 'buyer' && <a href={'/dashboard/buyer/messages?artist=' + encodeURIComponent(detail.artist.slug) + '&artwork=' + encodeURIComponent(detail.slug)} className="mt-7 inline-flex bg-ink px-5 py-3 text-sm font-bold text-inverse transition hover:bg-terracotta">پیام مستقیم درباره این اثر</a>}
                                {!user && <a href="/#account" className="mt-6 inline-block text-sm font-bold text-terracotta-strong underline">برای تماس با هنرمند وارد شوید یا ثبت‌نام کنید</a>}
                            </div>
                        </div>
                    )}
                </article>
                </Container>
            </main>
        );
    }

    return (
        <Container as="section" width="wide" id="artworks" className="py-20" dir="rtl">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
                <div>
                    <p className="text-sm font-bold text-terracotta-strong">کاتالوگ راد آرت</p>
                    <h2 className="mt-2 text-3xl font-black">آثار منتخب هنرمندان</h2>
                    <p className="mt-3 text-sm leading-7 text-muted">آثاری که بررسی و برای نمایش عمومی تأیید شده‌اند.</p>
                </div>
                <form onSubmit={(event) => { event.preventDefault(); setSearch(searchInput.trim()); }} className="flex flex-wrap gap-2">
                    <TextInput value={searchInput} onChange={(event) => setSearchInput(event.target.value)} aria-label="جست‌وجو در آثار" placeholder="جست‌وجوی عنوان یا تکنیک…" className="min-w-[220px] rounded-control px-4 py-2.5" />
                    <SelectField value={category} onChange={(event) => setCategory(event.target.value)} aria-label="فیلتر دسته‌بندی" className="min-h-11 w-auto rounded-control border-border-strong bg-paper px-4 py-2.5 text-sm">
                        <option value="">همه دسته‌ها</option>
                        {categories.map((item) => <option key={item.id} value={item.slug}>{item.name}</option>)}
                    </SelectField>
                    <Button variant="ghost" type="submit" className="rounded-control bg-ink px-5 py-2.5 text-sm font-bold text-inverse">جست‌وجو</Button>
                </form>
            </div>
            {loading ? <p className="mt-8 text-sm text-muted">در حال بارگذاری آثار…</p> : error ? (
                <p role="alert" className="mt-8 rounded-card bg-paper p-5 text-sm text-danger">دریافت کاتالوگ با خطا روبه‌رو شد.</p>
            ) : artworks.length === 0 ? (
                <p className="mt-8 rounded-card border border-border bg-paper p-8 text-sm text-muted">هنوز اثری برای نمایش در این دسته‌بندی ثبت نشده است.</p>
            ) : (
                <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {artworks.map((artwork) => (
                        <a key={artwork.id} href={'/artworks/' + artwork.slug} className="group overflow-hidden rounded-card border border-border bg-paper transition hover:-translate-y-1 hover:shadow-lg">
                            <MediaImage src={artwork.image_url} alt={artwork.title} className="aspect-[3/4] w-full" imageClassName="object-cover transition group-hover:scale-[1.02]" loading="lazy" decoding="async" />
                            <div className="p-5">
                                <p className="text-xs font-bold text-terracotta-strong">{artwork.category.name}</p>
                                <h3 className="mt-2 text-lg font-extrabold">{artwork.title}</h3>
                                <p className="mt-2 text-sm text-muted">{artwork.artist.display_name}</p>
                                <p className="mt-4 text-sm font-bold">{formatArtworkPrice(artwork.price)}</p>
                            </div>
                        </a>
                    ))}
                </div>
            )}
        </Container>
    );
}
