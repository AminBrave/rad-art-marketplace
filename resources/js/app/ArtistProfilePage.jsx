import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from './AuthContext';
import ContactArtistForm from './ContactArtistForm';
import { RouteLoading } from './RoutingPages';

export default function ArtistProfilePage() {
    const { slug } = useParams();
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState(0);

    useEffect(() => {
        let active = true;
        setLoading(true);
        setProfile(null);
        setStatus(0);
        axios.get('/api/v1/artists/' + encodeURIComponent(slug))
            .then(({ data }) => { if (active) setProfile(data.data); })
            .catch((error) => { if (active) setStatus(error.response?.status ?? 0); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [slug]);

    if (loading) return <RouteLoading label="در حال دریافت پروفایل هنرمند…" />;

    return (
        <main className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16" dir="rtl">
            <article className="rounded-3xl border border-stone-200 bg-white p-7 shadow-sm sm:p-12">
                <Link to="/artists" className="text-sm font-bold text-[#9a452b]">بازگشت به هنرمندان</Link>
                {profile ? <>
                    <p className="mt-10 text-sm font-bold text-[#9a452b]">پروفایل هنرمند</p>
                    <h1 className="mt-3 text-4xl font-black">{profile.display_name}</h1>
                    {profile.city && <p className="mt-3 text-sm text-stone-500">{profile.city}</p>}
                    {profile.bio && <p className="mt-8 whitespace-pre-line leading-9 text-stone-700">{profile.bio}</p>}
                    {user?.role === 'buyer' && <ContactArtistForm artistSlug={profile.slug} />}
                    {!user && <Link to="/login" state={{ from: { pathname: '/artists/' + slug } }} className="mt-8 inline-block rounded-full bg-[#20201e] px-5 py-3 text-sm font-bold text-white">برای تماس با هنرمند وارد شوید یا ثبت‌نام کنید</Link>}
                    <div className="mt-8 flex flex-wrap gap-4 text-sm font-semibold">
                        {profile.website_url && <a href={profile.website_url} target="_blank" rel="noreferrer" className="text-[#9a452b] underline">وب‌سایت</a>}
                        {profile.instagram_handle && <a href={'https://instagram.com/' + profile.instagram_handle} target="_blank" rel="noreferrer" className="text-[#9a452b] underline">اینستاگرام</a>}
                    </div>
                </> : (
                    <div className="mt-10">
                        <h1 className="text-2xl font-black">{status === 403 ? 'دسترسی به پروفایل مجاز نیست' : 'پروفایل در دسترس نیست'}</h1>
                        <p className="mt-3 leading-8 text-stone-500">{status === 403 ? 'سرور اجازه مشاهده این پروفایل را صادر نکرد.' : 'این پروفایل وجود ندارد یا نمایش عمومی آن غیرفعال شده است.'}</p>
                    </div>
                )}
            </article>
        </main>
    );
}
