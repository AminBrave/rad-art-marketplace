import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from './AuthContext';
import ContactArtistForm from './ContactArtistForm';
import { RouteLoading } from './RoutingPages';
import { ArtworkCard, EmptyState, ErrorState } from '../components/ui';

export default function ArtistProfilePage() {
    const { slug } = useParams();
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [status, setStatus] = useState(0);
    const [moreError, setMoreError] = useState('');

    useEffect(() => {
        let active = true;
        setLoading(true);
        setProfile(null);
        setStatus(0);
        setMoreError('');

        axios.get('/api/v1/artists/' + encodeURIComponent(slug), { params: { artworks_page: 1 } })
            .then(({ data }) => { if (active) setProfile(data.data); })
            .catch((error) => { if (active) setStatus(error.response?.status ?? 0); })
            .finally(() => { if (active) setLoading(false); });

        return () => { active = false; };
    }, [slug]);

    const loadMore = useCallback(async () => {
        if (!profile?.artworks_pagination?.has_more || loadingMore) return;

        setLoadingMore(true);
        setMoreError('');

        try {
            const nextPage = profile.artworks_pagination.next_page;
            const { data } = await axios.get('/api/v1/artists/' + encodeURIComponent(slug), {
                params: { artworks_page: nextPage },
            });
            setProfile((current) => {
                if (!current || current.slug !== slug) return current;
                const existingIds = new Set(current.artworks.map((artwork) => artwork.id));
                const nextArtworks = data.data.artworks.filter((artwork) => !existingIds.has(artwork.id));

                return {
                    ...current,
                    artworks: [...current.artworks, ...nextArtworks],
                    artworks_pagination: data.data.artworks_pagination,
                };
            });
        } catch {
            setMoreError('دریافت آثار بیشتر انجام نشد. دوباره تلاش کنید.');
        } finally {
            setLoadingMore(false);
        }
    }, [loadingMore, profile, slug]);

    if (loading) return <RouteLoading label="در حال دریافت پروفایل هنرمند…" />;

    return (
        <main className="mx-auto min-h-[65vh] max-w-7xl px-5 py-12 sm:px-8 lg:px-10" dir="rtl">
            <Link to="/artists" className="text-sm font-bold text-terracotta-strong underline">بازگشت به هنرمندان</Link>
            {profile ? (
                <>
                    <section className="mt-7 border border-border bg-white p-7 sm:p-12">
                        <p className="text-sm font-bold text-terracotta-strong">پروفایل هنرمند</p>
                        <h1 className="mt-3 text-4xl font-black">{profile.display_name}</h1>
                        {profile.city && <p className="mt-3 text-sm text-muted">{profile.city}</p>}
                        {profile.bio && <p className="mt-8 max-w-3xl whitespace-pre-line text-sm leading-9 text-muted">{profile.bio}</p>}
                        <div className="mt-8 flex flex-wrap gap-4 text-sm font-semibold">
                            {profile.website_url && <a href={profile.website_url} target="_blank" rel="noreferrer" className="text-terracotta-strong underline">وب‌سایت</a>}
                            {profile.instagram_handle && <a href={'https://instagram.com/' + profile.instagram_handle} target="_blank" rel="noreferrer" className="text-terracotta-strong underline">اینستاگرام</a>}
                        </div>
                        {user?.role === 'buyer' && <ContactArtistForm artistSlug={profile.slug} />}
                        {!user && <Link to="/login" state={{ from: { pathname: '/artists/' + slug } }} className="mt-8 inline-block bg-ink px-5 py-3 text-sm font-bold text-white">برای ارتباط با هنرمند وارد شوید</Link>}
                    </section>
                    <section className="mt-12">
                        <p className="text-xs font-bold text-terracotta-strong">مجموعه آثار</p>
                        <h2 className="mt-2 text-2xl font-black">آثار تأییدشده این هنرمند</h2>
                        {profile.artworks?.length ? (
                            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                {profile.artworks.map((item) => <ArtworkCard key={item.id} artwork={{ ...item, artist: { display_name: profile.display_name, slug: profile.slug } }} />)}
                            </div>
                        ) : (
                            <EmptyState className="mt-6" title="هنوز اثری برای نمایش وجود ندارد" description="آثار تأییدشده این هنرمند در این بخش نمایش داده می‌شوند." />
                        )}
                        {moreError && <ErrorState className="mt-6" title="دریافت آثار بیشتر ناموفق بود" description={moreError} onRetry={loadMore} />}
                        {profile.artworks_pagination?.has_more && (
                            <div className="mt-8 flex justify-center">
                                <button type="button" onClick={loadMore} disabled={loadingMore} className="border border-border px-6 py-3 text-sm font-bold text-ink transition-colors hover:border-terracotta disabled:cursor-wait disabled:opacity-60">
                                    {loadingMore ? 'در حال دریافت…' : 'نمایش آثار بیشتر'}
                                </button>
                            </div>
                        )}
                    </section>
                </>
            ) : (
                <section className="mt-8 border border-border bg-white p-8">
                    <h1 className="text-2xl font-black">{status === 403 ? 'دسترسی به پروفایل مجاز نیست' : 'پروفایل در دسترس نیست'}</h1>
                    <p className="mt-3 text-sm leading-7 text-muted">این پروفایل وجود ندارد یا نمایش عمومی آن غیرفعال شده است.</p>
                </section>
            )}
        </main>
    );
}
