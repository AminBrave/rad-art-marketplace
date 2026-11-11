import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Badge, Button, EmptyState, ErrorState, FormField, SkeletonLines, UploadFeedback } from '../components/ui';

const emptyArtwork = { title: '', description: '', category_id: '', medium: '', dimensions: '', year: '', price: '', availability: 'available' };
const statusLabels = { pending_review: 'در انتظار بررسی', approved: 'تأیید و منتشرشده', rejected: 'ردشده', changes_requested: 'نیازمند اصلاح' };
const statusGuidance = {
    pending_review: 'اثر ثبت شده و منتظر بررسی مدیر است. تا زمان تأیید، در گالری عمومی نمایش داده نمی‌شود.',
    approved: 'اثر تأیید شده است. اگر پروفایل شما عمومی باشد، این اثر در پورتفولیوی عمومی نمایش داده می‌شود.',
    rejected: 'این اثر رد شده است. بازخورد مدیر را بخوانید و در صورت امکان با ویرایش اثر دوباره ارسال کنید.',
    changes_requested: 'مدیر برای این اثر اصلاحاتی درخواست کرده است. بازخورد را بررسی کنید، اثر را ویرایش و دوباره برای بررسی ارسال کنید.',
};
const inputClass = 'mt-2 w-full border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-ring focus-visible:ring-2 focus-visible:ring-focus';

export default function ArtworkStudio({ user, hasProfile }) {
    const [categories, setCategories] = useState([]);
    const [artworks, setArtworks] = useState([]);
    const [artworkPage, setArtworkPage] = useState(1);
    const [hasMoreArtworks, setHasMoreArtworks] = useState(false);
    const [form, setForm] = useState(emptyArtwork);
    const [image, setImage] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [busy, setBusy] = useState(false);
    const [loading, setLoading] = useState(true);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState('');
    const [loadError, setLoadError] = useState('');
    const [imageError, setImageError] = useState('');
    const [imagePreview, setImagePreview] = useState('');
    const artworkController = useRef(null);

    useEffect(() => {
        if (!image) { setImagePreview(''); return undefined; }
        const url = window.URL.createObjectURL(image);
        setImagePreview(url);
        return () => window.URL.revokeObjectURL(url);
    }, [image]);

    const loadData = useCallback(async (page = 1) => {
        artworkController.current?.abort();
        const controller = new AbortController();
        artworkController.current = controller;
        setLoading(true);
        setLoadError('');
        try {
            const { data } = await axios.get('/api/v1/artist/artworks', { params: { page }, signal: controller.signal });
            setArtworks(data.data ?? []);
            setArtworkPage(data.current_page ?? page);
            setHasMoreArtworks(Boolean(data.next_page_url));
        } catch (error) {
            if (axios.isCancel(error)) return;
            setLoadError(error.response?.status === 403 ? 'این حساب اجازه مدیریت آثار را ندارد.' : 'دریافت آثار انجام نشد. دوباره تلاش کنید.');
        } finally {
            if (artworkController.current === controller) {
                artworkController.current = null;
                setLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        if (user?.role !== 'artist' || !hasProfile) return undefined;

        let active = true;
        const controller = new AbortController();
        axios.get('/api/v1/categories', { signal: controller.signal })
            .then(({ data }) => { if (active) setCategories(data.data ?? []); })
            .catch((error) => { if (active && !axios.isCancel(error)) setLoadError('دریافت دسته‌بندی‌ها انجام نشد.'); });

        return () => { active = false; controller.abort(); };
    }, [hasProfile, user?.role]);

    useEffect(() => {
        if (user?.role === 'artist' && hasProfile) loadData(1);
        return () => artworkController.current?.abort();
    }, [hasProfile, loadData, user?.role]);

    if (user?.role !== 'artist') return null;
    if (!hasProfile) return <EmptyState title="ابتدا پروفایل هنرمند را تکمیل کنید" description="برای ثبت و مدیریت اثر، نام نمایشی پروفایل خود را ذخیره کنید." action={<Link to="/dashboard/artist/profile" className="text-sm font-bold text-primary underline">تکمیل پروفایل</Link>} />;

    const updateForm = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    const clearImageInput = () => {
        const input = document.getElementById('artwork-image');
        if (input) input.value = '';
    };
    const resetForm = () => {
        setForm(emptyArtwork); setImage(null); setEditingId(null); setErrors({}); setImageError(''); setUploadProgress(0); clearImageInput();
    };
    const editArtwork = (item) => {
        setEditingId(item.id);
        setForm({
            title: item.title ?? '', description: item.description ?? '', category_id: String(item.category?.id ?? ''),
            medium: item.medium ?? '', dimensions: item.dimensions ?? '', year: item.year ? String(item.year) : '',
            price: item.price ?? '', availability: item.availability ?? 'available',
        });
        setImage(null); clearImageInput(); setErrors({}); setImageError(''); setMessage('');
        document.getElementById('artwork-editor')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    const chooseImage = async (event) => {
        const input = event.currentTarget;
        const file = input.files?.[0] ?? null;
        setImageError('');
        setErrors((current) => ({ ...current, image: undefined }));
        if (!file) { setImage(null); return; }
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
            setImageError('فقط فایل JPG، PNG یا WebP پذیرفته می‌شود.'); input.value = ''; setImage(null); return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setImageError('حجم تصویر نباید بیشتر از ۵ مگابایت باشد.'); input.value = ''; setImage(null); return;
        }
        try {
            const dimensions = await new Promise((resolve, reject) => {
                const url = window.URL.createObjectURL(file);
                const preview = new window.Image();
                preview.onload = () => { window.URL.revokeObjectURL(url); resolve({ width: preview.naturalWidth, height: preview.naturalHeight }); };
                preview.onerror = () => { window.URL.revokeObjectURL(url); reject(new Error('invalid-image')); };
                preview.src = url;
            });
            if (dimensions.width > 6000 || dimensions.height > 6000) {
                setImageError('ابعاد تصویر نباید از ۶۰۰۰ × ۶۰۰۰ پیکسل بیشتر باشد. تصویر کوچک‌تری انتخاب کنید.');
                input.value = ''; setImage(null); return;
            }
            setImage(file);
        } catch {
            setImageError('خواندن تصویر ممکن نشد. فایل سالم JPG، PNG یا WebP دیگری انتخاب کنید.');
            input.value = ''; setImage(null);
        }
    };
    const saveArtwork = async (event) => {
        event.preventDefault(); setBusy(true); setErrors({}); setMessage(''); setUploadProgress(0);
        const payload = new FormData();
        Object.entries(form).forEach(([key, value]) => { if (value !== '') payload.append(key, value); });
        if (image) payload.append('image', image);
        if (editingId) payload.append('_method', 'PATCH');
        try {
            const endpoint = editingId ? '/api/v1/artist/artworks/' + editingId : '/api/v1/artist/artworks';
            const { data } = await axios.post(endpoint, payload, {
                onUploadProgress: (event) => { if (event.total) setUploadProgress(Math.round((event.loaded * 100) / event.total)); },
            });
            resetForm();
            setMessage(data.message ?? 'اثر ذخیره شد.');
            await loadData(1);
        } catch (error) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors ?? {}); setMessage('لطفاً خطاهای مشخص‌شده را اصلاح کنید.');
            } else if (error.response?.status === 403) setMessage('سرور اجازه انجام این عملیات را نداد.');
            else setMessage('ذخیره اثر انجام نشد. اطلاعات فرم حفظ شده است؛ دوباره تلاش کنید.');
        } finally { setBusy(false); }
    };
    const fieldError = (name) => errors[name]?.map((item) => <span key={item} className="mt-1 block text-xs font-normal text-destructive">{item}</span>);

    return <section className="space-y-7" dir="rtl">
        <header><p className="text-sm font-bold text-primary">گالری شخصی</p><h1 className="mt-2 text-2xl font-black">مدیریت آثار</h1>
            <p className="mt-2 text-sm leading-7 text-muted-foreground-foreground">آثار جدید و ویرایش‌شده پس از ثبت دوباره برای بررسی مدیر ارسال می‌شوند. فقط آثار تأییدشده در گالری عمومی نمایش داده می‌شوند.</p></header>
        <section id="artwork-editor" className="border border-border bg-card p-5 sm:p-7">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-bold">{editingId ? 'ویرایش اثر' : 'ثبت اثر جدید'}</h2><p className="mt-1 text-xs text-muted-foreground-foreground">فیلدهای الزامی با علامت * مشخص شده‌اند.</p></div>{editingId && <Button variant="outline" size="sm" onClick={resetForm}>انصراف از ویرایش</Button>}</div>
            <form onSubmit={saveArtwork} className="grid gap-5 sm:grid-cols-2">
                <FormField label="عنوان اثر" required error={errors.title?.[0]}><input name="title" value={form.title} onChange={updateForm} required maxLength={160} className={inputClass} /></FormField>
                <FormField label="دسته‌بندی" required error={errors.category_id?.[0]}><select name="category_id" value={form.category_id} onChange={updateForm} required className={inputClass}><option value="">انتخاب دسته‌بندی</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></FormField>
                <FormField label="تکنیک / متریال" error={errors.medium?.[0]}><input name="medium" value={form.medium} onChange={updateForm} maxLength={120} className={inputClass} placeholder="مثلاً رنگ روغن، آبرنگ…" /></FormField>
                <FormField label="ابعاد" error={errors.dimensions?.[0]}><input name="dimensions" value={form.dimensions} onChange={updateForm} maxLength={120} className={inputClass} placeholder="مثلاً ۵۰ × ۷۰ سانتی‌متر" /></FormField>
                <FormField label="سال خلق اثر" error={errors.year?.[0]}><input name="year" type="number" value={form.year} onChange={updateForm} min="1000" max={new Date().getFullYear() + 1} className={inputClass} /></FormField>
                <FormField label="قیمت (ریال)" error={errors.price?.[0]}><input name="price" type="number" value={form.price} onChange={updateForm} min="0" step="1" className={inputClass} /></FormField>
                <FormField label="وضعیت دسترس‌پذیری" required><select name="availability" value={form.availability} onChange={updateForm} className={inputClass}><option value="available">موجود</option><option value="sold">فروخته‌شده</option><option value="not_for_sale">برای فروش نیست</option></select></FormField>
                <FormField label="توضیحات اثر" error={errors.description?.[0]} className="sm:col-span-2"><textarea name="description" value={form.description} onChange={updateForm} rows={4} maxLength={3000} className={inputClass} /></FormField>
                <div className="sm:col-span-2">
                    <label htmlFor="artwork-image" className="block text-sm font-semibold text-foreground">تصویر اثر {editingId ? '(اختیاری؛ برای جایگزینی تصویر)' : '*'}</label>
                    <input id="artwork-image" type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" required={!editingId} onChange={chooseImage} aria-describedby="artwork-image-help" className="mt-2 block w-full border border-border bg-background px-3 py-3 text-sm file:ml-3 file:border-0 file:bg-muted file:px-3 file:py-2 file:font-semibold" />
                    <p id="artwork-image-help" className="mt-2 text-xs leading-6 text-muted-foreground-foreground">JPG، JPEG، PNG یا WebP؛ حداکثر ۵ مگابایت و ۶۰۰۰ × ۶۰۰۰ پیکسل. ابعاد تصویر پیش از ارسال بررسی می‌شود.</p>
                    {fieldError('image')}{imageError && <p role="alert" className="mt-1 text-xs text-destructive">{imageError}</p>}
                    {imagePreview && <div className="mt-4 max-w-sm border border-border p-2"><img src={imagePreview} alt="پیش‌نمایش تصویر انتخاب‌شده" className="max-h-64 w-full object-contain" /></div>}
                    <UploadFeedback fileName={image?.name} status={busy ? 'uploading' : uploadProgress === 100 ? 'success' : 'idle'} progress={uploadProgress} />
                </div>
                <div className="flex flex-wrap items-center gap-3 sm:col-span-2"><Button type="submit" disabled={busy || Boolean(imageError)} loading={busy}>{editingId ? 'ذخیره و ارسال دوباره برای بررسی' : 'ثبت اثر برای بررسی'}</Button>{message && <p role="status" className="text-sm text-muted-foreground-foreground">{message}</p>}</div>
            </form>
        </section>
        <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-bold">آثار ثبت‌شده شما</h2><Button variant="outline" size="sm" onClick={() => loadData(1)} disabled={loading}>بروزرسانی</Button></div>
            {loadError && <ErrorState title="دریافت آثار ناموفق بود" description={loadError} onRetry={() => loadData(1)} />}
            {loading ? <SkeletonLines lines={5} /> : artworks.length === 0 ? <EmptyState title="هنوز اثری ثبت نکرده‌اید" description="با فرم بالا اولین اثر خود را برای بررسی ارسال کنید." /> :
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{artworks.map((item) => <article key={item.id} className="overflow-hidden border border-border bg-card">
                    <div className="flex aspect-[4/3] items-center justify-center bg-muted p-3"><img src={item.image_url} alt={item.title} loading="lazy" decoding="async" className="h-full w-full object-contain" /></div>
                    <div className="space-y-3 p-4"><div className="flex flex-wrap items-start justify-between gap-2"><h3 className="font-bold">{item.title}</h3><Badge variant={item.status === 'approved' ? 'success' : item.status === 'rejected' ? 'danger' : item.status === 'changes_requested' ? 'warning' : 'neutral'}>{statusLabels[item.status] ?? item.status}</Badge></div>
                        <p className="text-xs text-muted-foreground-foreground">{item.category?.name}</p>
                        <p className="text-xs leading-6 text-muted-foreground-foreground">{statusGuidance[item.status] ?? 'وضعیت این اثر از سوی سرور تعیین شده است.'}</p>
                        {item.rejection_note && <div className="border-s-2 border-danger bg-muted p-3 text-xs leading-6 text-destructive"><p className="mb-1 font-bold">بازخورد مدیر</p>{item.rejection_note}</div>}
                        <Button variant="outline" size="sm" onClick={() => editArtwork(item)}>ویرایش اثر</Button></div>
                </article>)}</div>}
            {artworks.length > 0 && !loading && (
                <nav aria-label="صفحه‌بندی آثار ثبت‌شده" className="flex items-center justify-center gap-4">
                    <Button variant="outline" size="sm" disabled={loading || artworkPage <= 1} onClick={() => loadData(artworkPage - 1)}>قبلی</Button>
                    <span className="text-xs text-muted-foreground-foreground">صفحه {artworkPage.toLocaleString('fa-IR')}</span>
                    <Button variant="outline" size="sm" disabled={loading || !hasMoreArtworks} onClick={() => loadData(artworkPage + 1)}>بعدی</Button>
                </nav>
            )}
        </section>
    </section>;
}
