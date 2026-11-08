import { useEffect, useState } from 'react';
import axios from 'axios';

const filters = [
    { value: 'pending_review', label: 'در انتظار بررسی' },
    { value: 'approved', label: 'تأییدشده' },
    { value: 'changes_requested', label: 'درخواست اصلاح' },
    { value: 'rejected', label: 'ردشده' },
];
const statusLabels = Object.fromEntries(filters.map((item) => [item.value, item.label]));

export default function AdminArtworkModeration() {
    const [status, setStatus] = useState('pending_review');
    const [artworks, setArtworks] = useState([]);
    const [notes, setNotes] = useState({});
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const loadArtworks = async () => {
        setLoading(true);
        setError('');
        try {
            const { data } = await axios.get('/api/v1/admin/artworks', { params: { status } });
            setArtworks(data.data);
        } catch {
            setError('دریافت صف بررسی آثار انجام نشد.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadArtworks();
    }, [status]);

    const moderate = async (artwork, action) => {
        const note = (notes[artwork.id] ?? '').trim();
        if (action !== 'approve' && !note) {
            setError('برای رد اثر یا درخواست اصلاح، نوشتن توضیح الزامی است.');
            return;
        }

        setBusyId(artwork.id);
        setError('');
        setMessage('');
        try {
            const { data } = await axios.patch('/api/v1/admin/artworks/' + artwork.id + '/moderation', {
                action,
                ...(action === 'approve' ? {} : { note }),
            });
            setMessage(data.message);
            setArtworks((current) => current.filter((item) => item.id !== artwork.id));
        } catch (requestError) {
            setError(requestError.response?.data?.message ?? 'ثبت تصمیم انجام نشد. دوباره تلاش کنید.');
        } finally {
            setBusyId(null);
        }
    };

    return (
        <section className="mx-auto max-w-7xl px-6 pb-20 lg:px-10" dir="rtl">
            <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div>
                        <p className="text-sm font-bold text-[#b65c3a]">پنل مدیریت</p>
                        <h2 className="mt-2 text-2xl font-black">بررسی و انتشار آثار</h2>
                        <p className="mt-2 text-sm leading-7 text-stone-500">فقط آثار در انتظار بررسی امکان تصمیم‌گیری دارند. توضیح رد یا درخواست اصلاح برای هنرمند ثبت می‌شود.</p>
                    </div>
                    <button type="button" onClick={loadArtworks} className="rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold hover:border-[#b65c3a]">بروزرسانی</button>
                </div>

                <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="فیلتر وضعیت آثار">
                    {filters.map((item) => (
                        <button key={item.value} type="button" role="tab" aria-selected={status === item.value} onClick={() => setStatus(item.value)} className={status === item.value ? 'rounded-full bg-[#20201e] px-4 py-2 text-xs font-bold text-white' : 'rounded-full border border-stone-300 px-4 py-2 text-xs font-semibold text-stone-600'}>
                            {item.label}
                        </button>
                    ))}
                </div>

                {message && <p role="status" className="mt-5 text-sm text-green-700">{message}</p>}
                {error && <p role="alert" className="mt-5 text-sm text-red-700">{error}</p>}
                {loading ? <p className="mt-8 text-sm text-stone-500">در حال دریافت آثار…</p> : artworks.length === 0 ? (
                    <p className="mt-8 rounded-xl bg-[#fcfbf9] p-6 text-sm text-stone-500">در این وضعیت اثری وجود ندارد.</p>
                ) : (
                    <div className="mt-8 grid gap-5 lg:grid-cols-2">
                        {artworks.map((artwork) => (
                            <article key={artwork.id} className="overflow-hidden rounded-2xl border border-stone-200">
                                <div className="grid sm:grid-cols-[180px_1fr]">
                                    <img src={artwork.image_url} alt={artwork.title} className="h-52 w-full object-cover sm:h-full" />
                                    <div className="p-5">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <h3 className="font-extrabold">{artwork.title}</h3>
                                            <span className="rounded-full bg-[#eae3d8] px-3 py-1 text-[11px] font-semibold text-[#80513d]">{statusLabels[artwork.status]}</span>
                                        </div>
                                        <p className="mt-2 text-xs text-stone-500">{artwork.artist.display_name} · {artwork.category.name}</p>
                                        {artwork.medium && <p className="mt-3 text-sm text-stone-600">تکنیک: {artwork.medium}</p>}
                                        {artwork.dimensions && <p className="mt-1 text-sm text-stone-600">ابعاد: {artwork.dimensions}</p>}
                                        {artwork.description && <p className="mt-3 line-clamp-3 text-sm leading-7 text-stone-600">{artwork.description}</p>}
                                        <a href={'/artworks/' + artwork.slug} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm font-bold text-[#b65c3a] underline">مشاهده صفحه اثر</a>
                                        {status === 'pending_review' && (
                                            <div className="mt-4 border-t border-stone-100 pt-4">
                                                <label className="block text-xs font-semibold text-stone-600">
                                                    توضیح برای هنرمند (برای رد یا درخواست اصلاح الزامی)
                                                    <textarea value={notes[artwork.id] ?? ''} onChange={(event) => setNotes((current) => ({ ...current, [artwork.id]: event.target.value }))} rows="2" maxLength="2000" className="mt-2 w-full rounded-xl border border-stone-200 bg-[#fcfbf9] p-3 text-sm outline-none focus:border-[#b65c3a]" />
                                                </label>
                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    <button type="button" disabled={busyId === artwork.id} onClick={() => moderate(artwork, 'approve')} className="rounded-full bg-[#20201e] px-4 py-2 text-xs font-bold text-white disabled:opacity-50">تأیید و انتشار</button>
                                                    <button type="button" disabled={busyId === artwork.id} onClick={() => moderate(artwork, 'request_changes')} className="rounded-full border border-[#b65c3a] px-4 py-2 text-xs font-bold text-[#9a4d32] disabled:opacity-50">درخواست اصلاح</button>
                                                    <button type="button" disabled={busyId === artwork.id} onClick={() => moderate(artwork, 'reject')} className="rounded-full border border-red-200 px-4 py-2 text-xs font-bold text-red-700 disabled:opacity-50">رد اثر</button>
                                                </div>
                                            </div>
                                        )}
                                        {artwork.rejection_note && <p className="mt-3 rounded-xl bg-[#fcfbf9] p-3 text-xs leading-6 text-stone-600">یادداشت مدیر: {artwork.rejection_note}</p>}
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
