import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';

const statusLabels = { new: 'جدید', read: 'خوانده‌شده', archived: 'بایگانی‌شده' };

export default function InquiryCenter({ user, hasProfile }) {
    const [items, setItems] = useState([]);
    const [nextPage, setNextPage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [busyId, setBusyId] = useState(null);
    const [error, setError] = useState('');
    const isArtist = user?.role === 'artist';
    const endpoint = isArtist ? '/api/v1/artist/inquiries' : '/api/v1/buyer/inquiries';

    const load = useCallback(async (url = endpoint, append = false) => {
        setLoading(true);
        setError('');
        try {
            const { data } = await axios.get(url);
            setItems((current) => append ? [...current, ...data.data] : data.data);
            setNextPage(data.next_page_url);
        } catch (requestError) {
            setError(requestError.response?.status === 403
                ? 'سرور اجازه مشاهده این صندوق پیام را صادر نکرد.'
                : 'دریافت پیام‌ها انجام نشد. دوباره تلاش کنید.');
        } finally {
            setLoading(false);
        }
    }, [endpoint]);

    useEffect(() => {
        if (user?.role === 'buyer' || (user?.role === 'artist' && hasProfile)) load();
    }, [hasProfile, load, user?.role]);

    const updateStatus = async (item, status) => {
        setBusyId(item.id);
        setError('');
        try {
            const { data } = await axios.patch('/api/v1/artist/inquiries/' + item.id, { status });
            setItems((current) => current.map((entry) => entry.id === item.id ? data.data : entry));
        } catch (requestError) {
            setError(requestError.response?.status === 403
                ? 'سرور اجازه تغییر وضعیت این پیام را صادر نکرد.'
                : 'به‌روزرسانی وضعیت پیام انجام نشد.');
        } finally {
            setBusyId(null);
        }
    };

    if ((!isArtist && user?.role !== 'buyer') || (isArtist && !hasProfile)) return null;

    return (
        <section className="mx-auto max-w-7xl px-6 pb-16 lg:px-10" dir="rtl">
            <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
                <p className="text-sm font-bold text-[#b65c3a]">{isArtist ? 'ارتباط با مخاطبان' : 'پیام‌های ارسال‌شده'}</p>
                <h2 className="mt-2 text-2xl font-black">{isArtist ? 'صندوق پیام‌های هنرمند' : 'پیگیری پیام‌ها'}</h2>
                <p className="mt-2 text-sm leading-7 text-stone-500">{isArtist ? 'پیام‌های دریافتی را بخوانید و پس از رسیدگی بایگانی کنید. ایمیل خصوصی فرستنده نمایش داده نمی‌شود.' : 'وضعیت پیام‌هایی را که برای هنرمندان فرستاده‌اید پیگیری کنید.'}</p>

                {error && <p role="alert" className="mt-5 text-sm text-red-700">{error}</p>}
                {loading && items.length === 0 ? <p className="mt-6 text-sm text-stone-500">در حال دریافت پیام‌ها…</p> : items.length === 0 ? (
                    <p className="mt-6 rounded-xl bg-[#fcfbf9] p-5 text-sm text-stone-500">{isArtist ? 'هنوز پیامی دریافت نکرده‌اید.' : 'هنوز پیامی ارسال نکرده‌اید.'}</p>
                ) : (
                    <div className="mt-6 space-y-4">
                        {items.map((item) => (
                            <article key={item.id} className="rounded-2xl border border-stone-200 p-5">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <h3 className="font-extrabold">{item.subject}</h3>
                                    <span className="rounded-full bg-[#eae3d8] px-3 py-1 text-xs font-semibold text-[#80513d]">{statusLabels[item.status]}</span>
                                </div>
                                <p className="mt-2 text-xs text-stone-500">
                                    {isArtist ? 'فرستنده: ' + item.buyer.name : 'هنرمند: ' + item.artist.display_name}
                                    {item.artwork ? ' · اثر: ' + item.artwork.title : ''}
                                    {' · ' + new Date(item.created_at).toLocaleDateString('fa-IR')}
                                </p>
                                <p className="mt-4 whitespace-pre-line text-sm leading-8 text-stone-700">{item.message}</p>
                                {isArtist && item.status !== 'archived' && (
                                    <div className="mt-4 flex flex-wrap gap-2 border-t border-stone-100 pt-4">
                                        {item.status === 'new' && <button type="button" disabled={busyId === item.id} onClick={() => updateStatus(item, 'read')} className="rounded-full border border-stone-300 px-4 py-2 text-xs font-semibold disabled:opacity-50">علامت‌گذاری به‌عنوان خوانده‌شده</button>}
                                        <button type="button" disabled={busyId === item.id} onClick={() => updateStatus(item, 'archived')} className="rounded-full border border-stone-300 px-4 py-2 text-xs font-semibold disabled:opacity-50">بایگانی پیام</button>
                                    </div>
                                )}
                            </article>
                        ))}
                    </div>
                )}
                {nextPage && <button type="button" disabled={loading} onClick={() => load(nextPage, true)} className="mt-5 rounded-full border border-stone-300 px-5 py-2.5 text-sm font-semibold disabled:opacity-50">{loading ? 'در حال دریافت…' : 'پیام‌های قدیمی‌تر'}</button>}
            </div>
        </section>
    );
}
