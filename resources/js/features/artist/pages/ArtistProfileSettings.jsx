import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../../../shared/i18n';
import axios from '../../../shared/api/httpClient';
import { useMutation } from '@tanstack/react-query';
import { Link, useOutletContext } from 'react-router-dom';
import { RouteLoading } from './router/guards';

const emptyProfile = { display_name: '', display_name_en: '', bio: '', bio_en: '', city: '', city_en: '', website_url: '', instagram_handle: '', is_public: true };

export function ArtistProfileSettings() {
    const { t, locale } = useLanguage();
    const { profile, setProfile, profileLoading, profileError } = useOutletContext();
    const [form, setForm] = useState(emptyProfile);
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState('');
    const [avatar, setAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState('');
    const [avatarError, setAvatarError] = useState('');
    const savingRef = useRef(false);
    const profileMutation = useMutation({
        mutationKey: ['artist-profile', 'update'],
        mutationFn: (nextProfile) => axios.post('/api/v1/artist-profile/me', nextProfile),
    });
    const busy = profileMutation.isPending;

    useEffect(() => {
        if (profile) setForm({ ...emptyProfile, ...profile });
    }, [profile]);

    useEffect(() => () => { if (avatarPreview.startsWith('blob:')) window.URL.revokeObjectURL(avatarPreview); }, [avatarPreview]);

    const chooseAvatar = (event) => {
        const file = event.target.files?.[0] ?? null;
        setAvatarError('');
        if (!file) { setAvatar(null); setAvatarPreview(''); return; }
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 2 * 1024 * 1024) {
            setAvatarError(t('تصویر باید JPG، PNG یا WebP و حداکثر ۲ مگابایت باشد.'));
            event.target.value = ''; setAvatar(null); setAvatarPreview(''); return;
        }
        setAvatar(file); setAvatarPreview(window.URL.createObjectURL(file));
    };

    const update = (event) => {
        const { name, value, type, checked } = event.target;
        setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
    };

    const save = async (event) => {
        event.preventDefault();
        if (savingRef.current) return;
        savingRef.current = true;
        setErrors({});
        setMessage('');
        try {
            const payload = new FormData();
            Object.entries(form).forEach(([key, value]) => payload.append(key, typeof value === 'boolean' ? (value ? '1' : '0') : (value ?? '')));
            if (avatar) payload.append('avatar', avatar);
            payload.append('_method', 'PUT');
            const { data } = await profileMutation.mutateAsync(payload);
            setProfile(data.data);
            setForm({ ...emptyProfile, ...data.data });
            setAvatar(null); setAvatarPreview('');
            setMessage(t(data.message));
        } catch (error) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors ?? {});
                setMessage(t('لطفاً خطاهای فرم را بررسی کنید.'));
            } else if (error.response?.status === 403) {
                setMessage(t('این عملیات از سمت سرور مجاز شناخته نشد.'));
            } else {
                setMessage(t('ذخیره پروفایل انجام نشد. دوباره تلاش کنید.'));
            }
        } finally {
            savingRef.current = false;
        }
    };

    if (profileLoading) return <RouteLoading label={t("در حال دریافت پروفایل هنرمند…")} />;

    return (
        <section className="min-w-0 mx-auto w-full max-w-content space-y-6">
            <PageHeader bleed={false}
                eyebrow={t("استودیوی هنرمند")}
                title={t("پروفایل هنرمند")}
                description={t("اطلاعات معرفی و وضعیت نمایش عمومی پروفایل خود را مدیریت کنید.")}
            />
            {profileError && <p role="alert" className="mt-4 text-sm text-warning">{t(profileError)}</p>}
            <form onSubmit={save} encType="multipart/form-data" className="mt-6 grid gap-5 border-y border-border py-6 sm:grid-cols-2">
                <div className="sm:col-span-2 flex flex-wrap items-center gap-5 border-b border-divider-group pb-5">
                    <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full border border-border bg-surface-muted">{(avatarPreview || profile?.avatar_url) ? <MediaImage src={avatarPreview || profile.avatar_url} alt={t("تصویر نمایه هنرمند")} className="h-full w-full" imageClassName="object-cover" loading="eager" /> : <div className="grid h-full w-full place-items-center text-3xl font-black text-terracotta-strong">{(profile?.display_name || "ه").slice(0, 1)}</div>}</div>
                    <div className="min-w-0 flex-1"><label htmlFor="artist-avatar" className="mb-2 block text-sm font-semibold text-ink">{t("تصویر نمایه هنرمند")}</label><FileInput id="artist-avatar" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" onChange={chooseAvatar} className="bg-canvas px-3 py-3 file:ms-3" aria-describedby="artist-avatar-help" /><p id="artist-avatar-help" className="mt-2 text-xs leading-6 text-muted">{t("JPG، PNG یا WebP؛ حداکثر ۲ مگابایت. تصویر در پروفایل عمومی شما نمایش داده می‌شود.")}</p>{avatarError && <p role="alert" className="mt-1 text-xs text-danger">{avatarError}</p>}</div>
                </div>
                <FormField label={t("نام نمایشی")} required error={errors.display_name?.map(t).join(' ')}><TextInput name="display_name" value={form.display_name ?? ''} onChange={update} required maxLength="120" /></FormField>
                <FormField label={t("نام هنری به انگلیسی")} error={errors.display_name_en?.map(t).join(' ')}><TextInput name="display_name_en" value={form.display_name_en ?? ''} onChange={update} maxLength="120" dir="ltr" className="text-start" /></FormField>
                <FormField label={t("درباره هنرمند")} error={errors.bio?.map(t).join(' ')} className="sm:col-span-2"><TextareaField name="bio" value={form.bio ?? ''} onChange={update} rows={4} maxLength="2000" /></FormField>
                <FormField label={t("درباره هنرمند به انگلیسی")} error={errors.bio_en?.map(t).join(' ')} className="sm:col-span-2"><TextareaField name="bio_en" value={form.bio_en ?? ''} onChange={update} rows={4} maxLength="2000" dir="ltr" className="text-start" /></FormField>
                <FormField label={t("شهر")} error={errors.city?.map(t).join(' ')}><TextInput name="city" value={form.city ?? ''} onChange={update} maxLength="120" /></FormField>
                <FormField label={t("شهر به انگلیسی")} error={errors.city_en?.map(t).join(' ')}><TextInput name="city_en" value={form.city_en ?? ''} onChange={update} maxLength="120" dir="ltr" className="text-start" /></FormField>
                <FormField label={t("شناسه اینستاگرام")} error={errors.instagram_handle?.map(t).join(' ')}><TextInput name="instagram_handle" value={form.instagram_handle ?? ''} onChange={update} maxLength="30" dir="ltr" className="text-start" /></FormField>
                <FormField label={t("وب‌سایت")} error={errors.website_url?.map(t).join(' ')} className="sm:col-span-2"><TextInput name="website_url" type="url" value={form.website_url ?? ''} onChange={update} dir="ltr" className="text-start" placeholder="https://example.com" /></FormField>
                <Checkbox name="is_public" checked={Boolean(form.is_public)} onChange={update} className="flex min-h-11 items-center gap-3 text-sm font-semibold sm:col-span-2">{t("نمایش عمومی پروفایل")}</Checkbox>
                <div className="sm:col-span-2">
                    <Button type="submit" disabled={busy || Boolean(avatarError)} loading={busy}>{busy ? t('در حال ذخیره…') : t('ذخیره پروفایل')}</Button>
                    {profile?.slug && <Link to={'/artists/' + profile.slug} className="ms-4 text-sm font-semibold text-terracotta-strong underline">{t(profile.is_public ? 'پیش‌نمایش پروفایل عمومی' : 'پیش‌نمایش خصوصی پروفایل')}</Link>}
                    {profile?.slug && !profile.is_public && <p className="mt-3 text-xs leading-6 text-muted sm:col-span-2">{t("این پیش‌نمایش فقط برای شما و مدیران مجاز قابل مشاهده است؛ بازدیدکنندگان عمومی به پروفایل خصوصی دسترسی ندارند.")}</p>}
                    <p className="mt-2 text-xs text-muted sm:col-span-2">{(form.bio?.length ?? 0).toLocaleString(locale === 'fa' ? 'fa-IR' : 'en-US')} {t('از ۲۰۰۰ نویسه برای معرفی هنری استفاده شده است.')}</p>
                </div>
            </form>
            {message && <p role="status" className="mt-4 text-sm text-muted">{t(message)}</p>}
        </section>
    );
}
