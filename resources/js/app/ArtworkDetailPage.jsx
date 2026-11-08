import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from './AuthContext';
import ContactArtistForm from './ContactArtistForm';
import { RouteLoading } from './RoutingPages';

export default function ArtworkDetailPage() {
    const { slug } = useParams();
    const { user } = useAuth();
    const [artwork, setArtwork] = useState(null);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState(0);

    useEffect(() => {
        let active = true;
        setLoading(true);
        setArtwork(null);
        setStatus(0);
        axios.get('/api/v1/artworks/' + encodeURIComponent(slug))
            .then(({ data }) => { if (active) setArtwork(data.data); })
            .catch((error) => { if (active) setStatus(error.response?.status ?? 0); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [slug]);

    if (loading) return <RouteLoading label="در حال دریافت اثر هنری…" />;

    return (
        <main className="min-h-screen bg-[#f7f5f0] px-5 py-12 text-[#20201e] sm:px-8" dir="rtl">
            <article className="mx-auto max-w-4xl rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-10">
                <Link to="/artworks" className="font-black text-[#b65c3a]">بازگشت به کاتالوگ آثار</Link>
                {!artwork ? (
                    <div className="mt-10">
                        <h1 className="text-2xl font-black">{status === 403 ? 'دسترسی به این اثر مجاز نیست' : 'اثر در دسترس نیست'}</h1>
                        <p className="mt-3 text-stone-500">{status === 403 ? 'سرور اجازه مشاهده این اثر را صادر نکرد.' : 'این اثر وجود ندارد یا هنوز برای نمایش عمومی تأیید نشده است.'}</p>
                    </div>
                ) : (
                    <div className="mt-8 grid gap-8 md:grid-cols-[1.1fr_.9fr]">
                        <img src={artwork.image_url} alt={artwork.title} className="w-full rounded-2xl object-cover" />
                        <div>
                            <p className="text-sm font-bold text-[#b65c3a]">{artwork.category.name}</p>
                            <h1 className="mt-3 text-3xl font-black leading-relaxed">{artwork.title}</h1>
                            <p className="mt-3 text-sm text-stone-500">{artwork.medium} {artwork.dimensions ? '· ' + artwork.dimensions : ''}</p>
                            {artwork.description && <p className="mt-6 whitespace-pre-line leading-8 text-stone-700">{artwork.description}</p>}
                            <p className="mt-6 font-bold">{artwork.price ? Number(artwork.price).toLocaleString('fa-IR') + ' ریال' : 'قیمت توافقی'}</p>
                            <p className="mt-2 text-sm text-stone-500">{artwork.availability === 'available' ? 'موجود' : artwork.availability === 'sold' ? 'فروخته‌شده' : 'برای فروش نیست'}</p>
                            <Link to={'/artists/' + artwork.artist.slug} className="mt-8 inline-block rounded-full bg-[#20201e] px-5 py-3 text-sm font-bold text-white">مشاهده پروفایل هنرمند: {artwork.artist.display_name}</Link>
                            {user?.role === 'buyer' && <ContactArtistForm artistSlug={artwork.artist.slug} artworkId={artwork.id} />}
                            {!user && <Link to="/login" state={{ from: { pathname: '/artworks/' + slug } }} className="mt-6 inline-block text-sm font-bold text-[#b65c3a] underline">برای تماس با هنرمند وارد شوید یا ثبت‌نام کنید</Link>}
                        </div>
                    </div>
                )}
            </article>
        </main>
    );
}
