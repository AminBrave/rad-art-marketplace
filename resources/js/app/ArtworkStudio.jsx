import { useEffect, useState } from 'react';
import axios from 'axios';

const emptyArtwork = {
    title: '',
    description: '',
    category_id: '',
    medium: '',
    dimensions: '',
    year: '',
    price: '',
    availability: 'available',
};

const statusLabels = {
    pending_review: 'در انتظار بررسی',
    approved: 'منتشرشده',
    rejected: 'نیازمند اصلاح',
};

export default function ArtworkStudio({ user, hasProfile }) {
    const [categories, setCategories] = useState([]);
    const [artworks, setArtworks] = useState([]);
    const [form, setForm] = useState(emptyArtwork);
    const [image, setImage] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [busy, setBusy] = useState(false);
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (user?.role !== 'artist' || !hasProfile) return;

        axios.get('/api/v1/categories').then(({ data }) => setCategories(data.data)).catch(() => setCategories([]));
        axios.get('/api/v1/artist/artworks').then(({ data }) => setArtworks(data.data)).catch(() => setMessage('دریافت آثار شما انجام نشد.'));
    }, [hasProfile, user?.role]);

    if (user?.role !== 'artist') return null;

    if (!hasProfile) {
        return (
            <section className="mx-auto mt-8 max-w-7xl rounded-2xl border border-stone-200 bg-white p-6 text-sm leading-7 text-stone-600" dir="rtl">
                برای ثبت اثر، ابتدا فرم پروفایل هنرمند را تکمیل و ذخیره کنید.
            </section>
        );
    }

    const updateForm = (event) => {
        setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    };

    const resetForm = () => {
        setForm(emptyArtwork);
        setImage(null);
        const imageInput = document.getElementById('artwork-image');
        if (imageInput) imageInput.value = '';
        setEditingId(null);
        setErrors({});
    };

    const editArtwork = (artwork) => {
        setEditingId(artwork.id);
        setForm({
            title: artwork.title ?? '',
            description: artwork.description ?? '',
            category_id: String(artwork.category.id),
            medium: artwork.medium ?? '',
            dimensions: artwork.dimensions ?? '',
            year: artwork.year ? String(artwork.year) : '',
            price: artwork.price ?? '',
            availability: artwork.availability ?? 'available',
        });
        setImage(null);
        setErrors({});
        setMessage('');
        document.getElementById('artwork-editor')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    const saveArtwork = async (event) => {
        event.preventDefault();
        setBusy(true);
        setErrors({});
        setMessage('');

        const payload = new FormData();
        Object.entries(form).forEach(([key, value]) => {
            if (value !== '') payload.append(key, value);
        });
        if (image) payload.append('image', image);
        if (editingId) payload.append('_method', 'PATCH');

        try {
            const endpoint = editingId ? '/api/v1/artist/artworks/' + editingId : '/api/v1/artist/artworks';
            const { data } = await axios.post(endpoint, payload);
            setMessage(data.message);
            resetForm();
            const refreshed = await axios.get('/api/v1/artist/artworks');
            setArtworks(refreshed.data.data);
        } catch (error) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors ?? {});
                setMessage('لطفاً خطاهای فرم را بررسی کنید.');
            } else {
                setMessage('ثبت اثر انجام نشد. دوباره تلاش کنید.');
            }
        } finally {
            setBusy(false);
        }
    };

    return (
        <section className="mt-8 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8" dir="rtl">
            <div className="mb-6">
                <p className="text-sm font-bold text-[#b65c3a]">گالری شخصی</p>
                <h2 className="mt-2 text-2xl font-black">ثبت و مدیریت آثار</h2>
                <p className="mt-2 text-sm leading-7 text-stone-500">آثار جدید پس از ثبت در صف بررسی مدیر قرار می‌گیرند و فقط پس از تأیید در کاتالوگ عمومی نمایش داده می‌شوند.</p>
            </div>

            <form id="artwork-editor" onSubmit={saveArtwork} className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-semibold sm:col-span-2">
                    عنوان اثر
                    <input name="title" value={form.title} onChange={updateForm} required maxLength="160" className="mt-2 w-full rounded-xl border border-stone-200 bg-[#fcfbf9] px-4 py-3 outline-none focus:border-[#b65c3a]" />
                    {errors.title?.map((item) => <span key={item} className="mt-1 block text-xs text-red-700">{item}</span>)}
                </label>
                <label className="text-sm font-semibold">
                    دسته‌بندی
                    <select name="category_id" value={form.category_id} onChange={updateForm} required className="mt-2 w-full rounded-xl border border-stone-200 bg-[#fcfbf9] px-4 py-3">
                        <option value="">انتخاب دسته‌بندی</option>
                        {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                    </select>
                    {errors.category_id?.map((item) => <span key={item} className="mt-1 block text-xs text-red-700">{item}</span>)}
                </label>
                <label className="text-sm font-semibold">
                    تکنیک / متریال
                    <input name="medium" value={form.medium} onChange={updateForm} maxLength="120" className="mt-2 w-full rounded-xl border border-stone-200 bg-[#fcfbf9] px-4 py-3" placeholder="مثلاً رنگ روغن، آبرنگ…" />
                    {errors.medium?.map((item) => <span key={item} className="mt-1 block text-xs text-red-700">{item}</span>)}
                </label>
                <label className="text-sm font-semibold">
                    ابعاد
                    <input name="dimensions" value={form.dimensions} onChange={updateForm} maxLength="120" className="mt-2 w-full rounded-xl border border-stone-200 bg-[#fcfbf9] px-4 py-3" placeholder="مثلاً ۵۰ × ۷۰ سانتی‌متر" />
                    {errors.dimensions?.map((item) => <span key={item} className="mt-1 block text-xs text-red-700">{item}</span>)}
                </label>
                <label className="text-sm font-semibold">
                    سال خلق اثر
                    <input name="year" type="number" value={form.year} onChange={updateForm} min="1000" max={new Date().getFullYear() + 1} className="mt-2 w-full rounded-xl border border-stone-200 bg-[#fcfbf9] px-4 py-3" />
                    {errors.year?.map((item) => <span key={item} className="mt-1 block text-xs text-red-700">{item}</span>)}
                </label>
                <label className="text-sm font-semibold">
                    قیمت (ریال)
                    <input name="price" type="number" value={form.price} onChange={updateForm} min="0" step="1" className="mt-2 w-full rounded-xl border border-stone-200 bg-[#fcfbf9] px-4 py-3" />
                    {errors.price?.map((item) => <span key={item} className="mt-1 block text-xs text-red-700">{item}</span>)}
                </label>
                <label className="text-sm font-semibold">
                    وضعیت دسترس‌پذیری
                    <select name="availability" value={form.availability} onChange={updateForm} className="mt-2 w-full rounded-xl border border-stone-200 bg-[#fcfbf9] px-4 py-3">
                        <option value="available">موجود</option>
                        <option value="sold">فروخته‌شده</option>
                        <option value="not_for_sale">برای فروش نیست</option>
                    </select>
                </label>
                <label className="text-sm font-semibold sm:col-span-2">
                    توضیحات اثر
                    <textarea name="description" value={form.description} onChange={updateForm} rows="3" maxLength="3000" className="mt-2 w-full rounded-xl border border-stone-200 bg-[#fcfbf9] px-4 py-3 leading-7" />
                    {errors.description?.map((item) => <span key={item} className="mt-1 block text-xs text-red-700">{item}</span>)}
                </label>
                <label className="text-sm font-semibold sm:col-span-2">
                    تصویر اثر {editingId ? '(در صورت نیاز تصویر جدید انتخاب کنید)' : ''}
                    <input id="artwork-image" type="file" accept="image/jpeg,image/png,image/webp" required={!editingId} onChange={(event) => setImage(event.target.files?.[0] ?? null)} className="mt-2 block w-full rounded-xl border border-stone-200 bg-[#fcfbf9] px-4 py-3 text-sm file:ml-3 file:rounded-full file:border-0 file:bg-[#eae3d8] file:px-4 file:py-2" />
                    <span className="mt-1 block text-xs font-normal text-stone-500">فرمت JPG، PNG یا WebP؛ حداکثر ۵ مگابایت.</span>
                    {errors.image?.map((item) => <span key={item} className="mt-1 block text-xs text-red-700">{item}</span>)}
                </label>
                <div className="flex flex-wrap gap-3 sm:col-span-2">
                    <button disabled={busy} className="rounded-xl bg-[#20201e] px-6 py-3 font-bold text-white hover:bg-[#b65c3a] disabled:opacity-60">
                        {busy ? 'در حال ذخیره…' : editingId ? 'ذخیره و ارسال دوباره برای بررسی' : 'ثبت اثر برای بررسی'}
                    </button>
                    {editingId && <button type="button" onClick={resetForm} className="rounded-xl border border-stone-300 px-5 py-3 text-sm font-semibold">انصراف از ویرایش</button>}
                </div>
            </form>

            {message && <p role="status" className="mt-4 text-sm text-[#80513d]">{message}</p>}

            <div className="mt-10 border-t border-stone-100 pt-7">
                <h3 className="text-lg font-extrabold">آثار ثبت‌شده شما</h3>
                {artworks.length === 0 ? (
                    <p className="mt-4 rounded-xl bg-[#fcfbf9] p-5 text-sm text-stone-500">هنوز اثری ثبت نکرده‌اید.</p>
                ) : (
                    <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {artworks.map((artwork) => (
                            <article key={artwork.id} className="overflow-hidden rounded-2xl border border-stone-200">
                                <img src={artwork.image_url} alt={artwork.title} className="aspect-[4/3] w-full object-cover" />
                                <div className="p-4">
                                    <div className="flex items-center justify-between gap-2">
                                        <h4 className="font-bold">{artwork.title}</h4>
                                        <span className="shrink-0 rounded-full bg-[#eae3d8] px-2.5 py-1 text-[11px] font-semibold text-[#80513d]">{statusLabels[artwork.status] ?? artwork.status}</span>
                                    </div>
                                    <p className="mt-2 text-xs text-stone-500">{artwork.category.name}</p>
                                    {artwork.rejection_note && <p className="mt-2 text-xs leading-6 text-red-700">{artwork.rejection_note}</p>}
                                    <button type="button" onClick={() => editArtwork(artwork)} className="mt-4 text-sm font-bold text-[#b65c3a] underline">ویرایش اثر</button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
