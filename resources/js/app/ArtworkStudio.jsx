import { useEffect, useRef, useState } from 'react';
import { useLanguage } from './LanguageContext';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Badge, Button, EmptyState, ErrorState, FormField, TextInput, TextareaField, FileInput, ArtworkStudioListSkeleton, UploadFeedback, MediaImage, PageHeader, SectionHeader, SelectField } from '../components/ui';

const emptyArtwork = { title: '', title_en: '', description: '', description_en: '', city: '', city_en: '', category_id: '', medium: '', dimensions: '', year: '', price: '', availability: 'available' };
const statusLabels = { pending_review: 'در انتظار بررسی', approved: 'تأیید و منتشرشده', rejected: 'ردشده', changes_requested: 'نیازمند اصلاح' };
const statusGuidance = {
    pending_review: 'اثر ثبت شده و منتظر بررسی مدیر است. تا زمان تأیید، در گالری عمومی نمایش داده نمی‌شود.',
    approved: 'اثر تأیید شده است. اگر پروفایل شما عمومی باشد، این اثر در پورتفولیوی عمومی نمایش داده می‌شود.',
    rejected: 'این اثر رد شده است. بازخورد مدیر را بخوانید و در صورت امکان با ویرایش اثر دوباره ارسال کنید.',
    changes_requested: 'مدیر برای این اثر اصلاحاتی درخواست کرده است. بازخورد را بررسی کنید، اثر را ویرایش و دوباره برای بررسی ارسال کنید.',
};

export default function ArtworkStudio({ user, hasProfile, initialCreate = false }) {
    const { t, locale } = useLanguage();
    const [artworkPage, setArtworkPage] = useState(1);
    const queryClient = useQueryClient();
    const categoriesQuery = useQuery({
        queryKey: ['categories'],
        queryFn: async ({ signal }) => {
            const { data } = await axios.get('/api/v1/categories', { signal });
            return data.data ?? [];
        },
        enabled: user?.role === 'artist' && Boolean(hasProfile),
    });
    const artworksQuery = useQuery({
        queryKey: ['artist', 'artworks', user?.id, artworkPage],
        queryFn: async ({ signal }) => {
            const { data } = await axios.get('/api/v1/artist/artworks', { params: { page: artworkPage }, signal });
            return data;
        },
        enabled: user?.role === 'artist' && Boolean(hasProfile) && Boolean(user?.id),
    });
    const categories = categoriesQuery.data ?? [];
    const artworks = artworksQuery.data?.data ?? [];
    const hasMoreArtworks = Boolean(artworksQuery.data?.next_page_url);
    const loading = artworksQuery.isPending;
    const loadError = artworksQuery.isError
        ? (artworksQuery.error.response?.status === 403 ? t("این حساب اجازه مدیریت آثار را ندارد.") : 'دریافت آثار انجام نشد. دوباره تلاش کنید.')
        : categoriesQuery.isError ? t("دریافت دسته‌بندی‌ها انجام نشد.") : '';
    const [form, setForm] = useState(emptyArtwork);
    const [image, setImage] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState('');
    const [imageError, setImageError] = useState('');
    const [imagePreview, setImagePreview] = useState('');
    const savingArtworkRef = useRef(false);
    const saveArtworkMutation = useMutation({
        mutationKey: ['artist', 'artworks', 'save', user?.id],
        mutationFn: ({ endpoint, payload }) => axios.post(endpoint, payload, {
            onUploadProgress: (event) => { if (event.total) setUploadProgress(Math.round((event.loaded * 100) / event.total)); },
        }),
    });
    const busy = saveArtworkMutation.isPending;

    useEffect(() => {
        if (!image) { setImagePreview(''); return undefined; }
        const url = window.URL.createObjectURL(image);
        setImagePreview(url);
        return () => window.URL.revokeObjectURL(url);
    }, [image]);

    useEffect(() => {
        if (initialCreate && hasProfile) {
            document.getElementById('artwork-editor')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [initialCreate, hasProfile]);


    if (user?.role !== 'artist') return null;
    if (!hasProfile) return <EmptyState title={t("ابتدا پروفایل هنرمند را تکمیل کنید")} description={t("برای ثبت و مدیریت اثر، نام نمایشی پروفایل خود را ذخیره کنید.")} action={<Link to="/dashboard/artist/profile" className="text-sm font-bold text-terracotta-strong underline">{t("تکمیل پروفایل")}</Link>} />;

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
            title: item.title ?? '', title_en: item.title_en ?? '', description: item.description ?? '', description_en: item.description_en ?? '', city: item.city ?? '', city_en: item.city_en ?? '', category_id: String(item.category?.id ?? ''),
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
            setImageError(t("فقط فایل JPG، PNG یا WebP پذیرفته می‌شود.")); input.value = ''; setImage(null); return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setImageError(t("حجم تصویر نباید بیشتر از ۵ مگابایت باشد.")); input.value = ''; setImage(null); return;
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
                setImageError(t("ابعاد تصویر نباید از ۶۰۰۰ × ۶۰۰۰ پیکسل بیشتر باشد. تصویر کوچک‌تری انتخاب کنید."));
                input.value = ''; setImage(null); return;
            }
            setImage(file);
        } catch {
            setImageError(t("خواندن تصویر ممکن نشد. فایل سالم JPG، PNG یا WebP دیگری انتخاب کنید."));
            input.value = ''; setImage(null);
        }
    };
    const saveArtwork = async (event) => {
        event.preventDefault();
        if (savingArtworkRef.current) return;
        savingArtworkRef.current = true;
        setErrors({}); setMessage(''); setUploadProgress(0);
        const payload = new FormData();
        Object.entries(form).forEach(([key, value]) => {
            if (value !== '' || ['title_en', 'description_en', 'city', 'city_en'].includes(key)) payload.append(key, value);
        });
        if (image) payload.append('image', image);
        if (editingId) payload.append('_method', 'PATCH');
        try {
            const endpoint = editingId ? '/api/v1/artist/artworks/' + editingId : '/api/v1/artist/artworks';
            const { data } = await saveArtworkMutation.mutateAsync({ endpoint, payload });
            resetForm();
            setMessage(t(data.message ?? "اثر ذخیره شد."));
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['artist', 'artworks', user?.id] }),
                queryClient.invalidateQueries({ queryKey: ['artist-workspace', 'artworks', user?.id] }),
                queryClient.invalidateQueries({ queryKey: ['home', 'artworks'] }),
                queryClient.invalidateQueries({ queryKey: ['artworks'] }),
            ]);
            setArtworkPage(1);
        } catch (error) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors ?? {}); setMessage(t("لطفاً خطاهای مشخص‌شده را اصلاح کنید."));
            } else if (error.response?.status === 403) setMessage(t("سرور اجازه انجام این عملیات را نداد."));
            else setMessage(t("ذخیره اثر انجام نشد. اطلاعات فرم حفظ شده است؛ دوباره تلاش کنید."));
        } finally {
            savingArtworkRef.current = false;
        }
    };
    const fieldError = (name) => errors[name]?.map((item) => <span key={item} className="mt-1 block text-xs font-normal text-danger">{t(item)}</span>);

    return <section className="min-w-0 mx-auto w-full max-w-content space-y-7">
        <PageHeader bleed={false}
            eyebrow={t("گالری شخصی")}
            title={t("مدیریت آثار")}
            description={t("آثار جدید و ویرایش‌شده پس از ثبت دوباره برای بررسی مدیر ارسال می‌شوند. فقط آثار تأییدشده در گالری عمومی نمایش داده می‌شوند.")}
        />
        <section id="artwork-editor" className="border-y border-border bg-transparent py-6 sm:py-8">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-3"><SectionHeader title={editingId ? t('ویرایش اثر') : t("ثبت اثر جدید")} description={t("فیلدهای الزامی با علامت * مشخص شده‌اند.")} className="min-w-0 flex-1 border-0 pb-0" />{editingId && <Button variant="outline" size="sm" onClick={resetForm}>{t('انصراف از ویرایش')}</Button>}</div>
            <form onSubmit={saveArtwork} className="grid gap-x-5 gap-y-6 sm:grid-cols-2">
                <FormField label={t("عنوان اثر")} required error={t(errors.title?.[0])}><TextInput name="title" value={form.title} onChange={updateForm} required maxLength={160} /></FormField>
                <FormField label={t("عنوان اثر به انگلیسی")} error={t(errors.title_en?.[0])}><TextInput name="title_en" value={form.title_en} onChange={updateForm} maxLength={160} dir="ltr" className="text-start" /></FormField>
                <FormField label={t("دسته‌بندی")} required error={t(errors.category_id?.[0])}><SelectField name="category_id" value={form.category_id} onChange={updateForm} required><option value="">{t("انتخاب دسته‌بندی")}</option>{categories.map((category) => <option key={category.id} value={category.id}>{locale === 'en' ? (category.name_en || category.name) : category.name}</option>)}</SelectField></FormField>
                <FormField label={t("تکنیک / متریال")} error={t(errors.medium?.[0])}><TextInput name="medium" value={form.medium} onChange={updateForm} maxLength={120} placeholder={t("مثلاً رنگ روغن، آبرنگ…")} /></FormField>
                <FormField label={t("ابعاد")} error={t(errors.dimensions?.[0])}><TextInput name="dimensions" value={form.dimensions} onChange={updateForm} maxLength={120} placeholder={t("مثلاً ۵۰ × ۷۰ سانتی‌متر")} /></FormField>
                <FormField label={t("سال خلق اثر")} error={t(errors.year?.[0])}><TextInput name="year" type="number" value={form.year} onChange={updateForm} min="1000" max={new Date().getFullYear() + 1} /></FormField>
                <FormField label={t("قیمت (ریال)")} error={t(errors.price?.[0])}><TextInput name="price" type="number" value={form.price} onChange={updateForm} min="0" step="1" /></FormField>
                <FormField label={t("وضعیت دسترس‌پذیری")} required><SelectField name="availability" value={form.availability} onChange={updateForm}><option value="available">{t("موجود")}</option><option value="sold">{t("فروخته‌شده")}</option><option value="not_for_sale">{t("برای فروش نیست")}</option></SelectField></FormField>
                <FormField label={t("توضیحات اثر")} error={t(errors.description?.[0])} className="sm:col-span-2"><TextareaField name="description" value={form.description} onChange={updateForm} rows={4} maxLength={3000} /></FormField>
                <FormField label={t("توضیحات اثر به انگلیسی")} error={t(errors.description_en?.[0])} className="sm:col-span-2"><TextareaField name="description_en" value={form.description_en} onChange={updateForm} rows={4} maxLength={3000} dir="ltr" className="text-start" /></FormField>
                <FormField label={t("شهر محل اثر")} error={t(errors.city?.[0])}><TextInput name="city" value={form.city} onChange={updateForm} maxLength={120} /></FormField>
                <FormField label={t("شهر محل اثر به انگلیسی")} error={t(errors.city_en?.[0])}><TextInput name="city_en" value={form.city_en} onChange={updateForm} maxLength={120} dir="ltr" className="text-start" /></FormField>
                <div className="sm:col-span-2">
                    <label htmlFor="artwork-image" className="block text-sm font-semibold text-ink">{t("تصویر اثر")} {editingId ? t("(اختیاری؛ برای جایگزینی تصویر)") : '*'}</label>
                    <FileInput id="artwork-image" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" required={!editingId} onChange={chooseImage} aria-describedby="artwork-image-help" className="mt-2 bg-canvas px-3 py-3 file:ms-3" />
                    <p id="artwork-image-help" className="mt-2 text-xs leading-6 text-muted">{t("JPG، JPEG، PNG یا WebP؛ حداکثر ۵ مگابایت و ۶۰۰۰ × ۶۰۰۰ پیکسل. ابعاد تصویر پیش از ارسال بررسی می‌شود.")}</p>
                    {fieldError('image')}{imageError && <p role="alert" className="mt-1 text-xs text-danger">{imageError}</p>}
                    {imagePreview && <div className="mt-4 max-w-sm border-y border-border bg-paper p-2"><MediaImage src={imagePreview} alt={t("پیش‌نمایش تصویر انتخاب‌شده")} className="aspect-[3/4] max-h-64 w-full" imageClassName="object-cover" loading="eager" /></div>}
                    <UploadFeedback fileName={image?.name} status={busy ? 'uploading' : uploadProgress === 100 ? 'success' : 'idle'} progress={uploadProgress} />
                </div>
                <div className="flex flex-wrap items-center gap-3 sm:col-span-2"><Button type="submit" disabled={busy || Boolean(imageError)} loading={busy}>{editingId ? t("ذخیره و ارسال دوباره برای بررسی") : t("ثبت اثر برای بررسی")}</Button>{message && <p role="status" className="text-sm text-muted">{message}</p>}</div>
            </form>
        </section>
        <section className="space-y-4">
            <SectionHeader title={t("آثار ثبت‌شده شما")} actions={<Button variant="outline" size="sm" onClick={() => artworksQuery.refetch()} disabled={loading}>{t("بروزرسانی")}</Button>} />
            {loadError && <ErrorState title={t("دریافت آثار ناموفق بود")} description={t(loadError)} onRetry={() => { artworksQuery.refetch(); categoriesQuery.refetch(); }} />}
            {loading ? <ArtworkStudioListSkeleton count={3} /> : artworks.length === 0 ? <EmptyState title={t("هنوز اثری ثبت نکرده‌اید")} description={t("با فرم بالا اولین اثر خود را برای بررسی ارسال کنید.")} /> :
                <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">{artworks.map((item) => <article key={item.id} className="min-w-0 border-b border-border pb-6">
                    <div className="relative flex aspect-[3/4] items-center justify-center overflow-hidden border border-border bg-[linear-gradient(145deg,var(--color-surface-muted),var(--color-paper))] p-4 sm:p-5"><MediaImage src={item.image_url} alt={locale === 'en' ? (item.title_en || item.title) : item.title} className="h-full w-full" imageClassName="object-cover" loading="lazy" decoding="async" /></div>
                    <div className="space-y-3 pt-4"><div className="flex flex-wrap items-start justify-between gap-2"><h3 className="font-bold">{locale === 'en' ? (item.title_en || item.title) : item.title}</h3><Badge variant={item.status === 'approved' ? 'success' : item.status === 'rejected' ? 'danger' : item.status === 'changes_requested' ? 'warning' : 'neutral'}>{t(statusLabels[item.status] ?? item.status)}</Badge></div>
                        <p className="text-xs text-muted">{locale === 'en' ? (item.category?.name_en || item.category?.name) : item.category?.name}</p>
                        {(item.city || item.city_en) && <p className="text-xs text-muted">{locale === 'en' ? (item.city_en || item.city) : item.city}</p>}
                        <p className="text-xs leading-6 text-muted">{t(statusGuidance[item.status] ?? "وضعیت این اثر از سوی سرور تعیین شده است.")}</p>
                        {item.rejection_note && <div className="border-s-2 border-danger bg-surface-muted p-3 text-xs leading-6 text-danger"><p className="mb-1 font-bold">{t("بازخورد مدیر")}</p>{item.rejection_note}</div>}
                        <Button variant="outline" size="sm" onClick={() => editArtwork(item)}>{t("ویرایش اثر")}</Button></div>
                </article>)}</div>}
            {artworks.length > 0 && !loading && (
                <nav aria-label={t("صفحه‌بندی آثار ثبت‌شده")} className="flex items-center justify-center gap-3 border-t border-border pt-6">
                    <Button variant="outline" size="sm" disabled={loading || artworkPage <= 1} onClick={() => setArtworkPage((current) => Math.max(1, current - 1))}>{t("قبلی")}</Button>
                    <span className="text-xs text-muted">صفحه {(artworksQuery.data?.current_page ?? artworkPage).toLocaleString(locale === 'fa' ? 'fa-IR' : 'en-US')}</span>
                    <Button variant="outline" size="sm" disabled={loading || !hasMoreArtworks} onClick={() => setArtworkPage((current) => current + 1)}>{t("بعدی")}</Button>
                </nav>
            )}
        </section>
    </section>;
}
