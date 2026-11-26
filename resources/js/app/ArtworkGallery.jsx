import { useEffect, useState } from 'react';
import axios from 'axios';
import { formatArtworkPrice } from '../utils/formatArtworkPrice';
import { MediaImage, SelectField, TextInput, Button, Container } from '../components/ui';
import { useLanguage } from './LanguageContext';
import { localizedValue } from '../utils/localizedContent';

export default function ArtworkGallery({ user }) {
    const { t, locale } = useLanguage();
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
            <main className="min-h-screen w-full bg-canvas py-page text-ink">
                <Container width="wide">
                <article className="mx-auto max-w-4xl rounded-card border border-border bg-paper p-6 shadow-sm sm:p-10">
                    <a href="/" className="font-black text-terracotta-strong">{t('بازگشت به راد آرت')}</a>
                    {loading ? <p className="mt-10 text-muted">{t('در حال دریافت اثر…')}</p> : error || !detail ? (
                        <div className="mt-10"><h1 className="text-2xl font-black">{t('اثر در دسترس نیست')}</h1><p className="mt-3 text-muted">{t('این اثر وجود ندارد یا هنوز برای نمایش عمومی تأیید نشده است.')}</p></div>
                    ) : (
                        <div className="mt-8 grid gap-8 md:grid-cols-[1.1fr_.9fr]">
                            <div className="aspect-[3/4] w-full bg-surface-muted p-3 sm:p-5"><MediaImage src={detail.image_url} alt={localizedValue(detail, 'title', locale)} className="h-full w-full" imageClassName="object-cover" loading="eager" fetchPriority="high" /></div>
                            <div>
                                <p className="text-sm font-bold text-terracotta-strong">{localizedValue(detail.category, 'name', locale)}</p>
                                <h1 className="mt-3 text-3xl font-black leading-relaxed">{localizedValue(detail, 'title', locale)}</h1>
                                <p className="mt-3 text-sm text-muted">{t(detail.medium)} {detail.dimensions ? '· ' + detail.dimensions : ''}</p>
                                {localizedValue(detail, 'description', locale) && <p className="mt-6 whitespace-pre-line leading-8 text-ink">{localizedValue(detail, 'description', locale)}</p>}
                                <p className="mt-6 font-bold">{formatArtworkPrice(detail.price, locale)}</p>
                                <p className="mt-2 text-sm text-muted">{t(detail.availability === 'available' ? 'قابل استعلام' : detail.availability === 'sold' ? 'فروخته‌شده' : 'برای فروش نیست')}</p>
                                <a href={'/artists/' + detail.artist.slug} className="mt-8 inline-block rounded-control bg-ink px-5 py-3 text-sm font-bold text-inverse">{t('مشاهده پروفایل هنرمند:')} {localizedValue(detail.artist, 'display_name', locale)}</a>
                                {user?.role === 'buyer' && <a href={'/dashboard/buyer/messages?artist=' + encodeURIComponent(detail.artist.slug) + '&artwork=' + encodeURIComponent(detail.slug)} className="mt-7 inline-flex bg-ink px-5 py-3 text-sm font-bold text-inverse transition hover:bg-terracotta">{t('پیام مستقیم درباره این اثر')}</a>}
                                {!user && <a href="/#account" className="mt-6 inline-block text-sm font-bold text-terracotta-strong underline">{t('برای تماس با هنرمند وارد شوید یا ثبت‌نام کنید')}</a>}
                            </div>
                        </div>
                    )}
                </article>
                </Container>
            </main>
        );
    }

    return (
        <Container as="section" width="wide" id="artworks" className="py-section-relaxed">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
                <div>
                    <p className="text-sm font-bold text-terracotta-strong">{t('کاتالوگ راد آرت')}</p>
                    <h2 className="mt-2 text-3xl font-black">{t('آثار منتخب هنرمندان')}</h2>
                    <p className="mt-3 text-sm leading-7 text-muted">{t('آثاری که بررسی و برای نمایش عمومی تأیید شده‌اند.')}</p>
                </div>
                <form onSubmit={(event) => { event.preventDefault(); setSearch(searchInput.trim()); }} className="flex flex-wrap gap-2">
                    <TextInput value={searchInput} onChange={(event) => setSearchInput(event.target.value)} aria-label={t("جست‌وجو در آثار")} placeholder={t("جست‌وجوی عنوان یا تکنیک…")} className="min-w-[220px] rounded-control px-4 py-2.5" />
                    <SelectField value={category} onChange={(event) => setCategory(event.target.value)} aria-label={t("فیلتر دسته‌بندی")} className="min-h-11 w-auto rounded-control border-border-strong bg-paper px-4 py-2.5 text-sm">
                        <option value="">{t('همه دسته‌ها')}</option>
                        {categories.map((item) => <option key={item.id} value={item.slug}>{localizedValue(item, 'name', locale)}</option>)}
                    </SelectField>
                    <Button variant="ghost" type="submit" className="rounded-control bg-ink px-5 py-2.5 text-sm font-bold text-inverse">{t('جست‌وجو')}</Button>
                </form>
            </div>
            {loading ? <p className="mt-8 text-sm text-muted">{t('در حال بارگذاری آثار…')}</p> : error ? (
                <p role="alert" className="mt-8 rounded-card bg-paper p-5 text-sm text-danger">{t('دریافت کاتالوگ با خطا روبه‌رو شد.')}</p>
            ) : artworks.length === 0 ? (
                <p className="mt-8 rounded-card border border-border bg-paper p-8 text-sm text-muted">{t('هنوز اثری برای نمایش در این دسته‌بندی ثبت نشده است.')}</p>
            ) : (
                <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {artworks.map((artwork) => (
                        <a key={artwork.id} href={'/artworks/' + artwork.slug} className="group overflow-hidden rounded-card border border-border bg-paper transition hover:-translate-y-1 hover:shadow-lg">
                            <div className="aspect-[3/4] w-full bg-surface-muted p-3"><MediaImage src={artwork.image_url} alt={localizedValue(artwork, 'title', locale)} className="h-full w-full" imageClassName="object-cover transition group-hover:scale-[1.02]" loading="lazy" decoding="async" /></div>
                            <div className="p-5">
                                <p className="text-xs font-bold text-terracotta-strong">{localizedValue(artwork.category, 'name', locale)}</p>
                                <h3 className="mt-2 text-lg font-extrabold">{localizedValue(artwork, 'title', locale)}</h3>
                                <p className="mt-2 text-sm text-muted">{localizedValue(artwork.artist, 'display_name', locale)}</p>
                                <p className="mt-4 text-sm font-bold">{formatArtworkPrice(artwork.price, locale)}</p>
                            </div>
                        </a>
                    ))}
                </div>
            )}
        </Container>
    );
}
