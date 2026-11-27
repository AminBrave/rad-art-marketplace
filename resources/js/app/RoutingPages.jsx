import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { useLanguage } from './LanguageContext';
import axios from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useOutletContext } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useTheme } from './useTheme';
import { RouteLoading } from './router/guards';
import {
    PageHeader, SectionHeader, WorkspaceHero, Checkbox, FormField, TextInput,
    TextareaField, Button, Container, FileInput, MediaImage,
} from '../shared/ui';

const ArtworkStudio = lazy(() => import('./ArtworkStudio'));

const emptyProfile = { display_name: '', display_name_en: '', bio: '', bio_en: '', city: '', city_en: '', website_url: '', instagram_handle: '', is_public: true };


export function ArtistDashboardHome() {
    const { t } = useLanguage();
    const { user, profile, profileLoading, profileError } = useOutletContext();
    return (
        <div className="w-full space-y-6">
            <WorkspaceHero
                eyebrow={t('فضای هنرمند')}
                title={<>{t('خوش آمدید، ')}{user.name}</>}
                description={t('پروفایل و آثار ارسالی خود را مدیریت کنید و از بخش پیام‌های مستقیم با خریداران در ارتباط باشید.')}
            />
            <Container width="wide" className="space-y-6">
            {profileError && <p role="alert" className="mt-5 text-sm text-warning">{t(profileError)}</p>}
            {profileLoading ? <p className="mt-5 text-sm text-muted">{t('در حال دریافت پروفایل…')}</p> : (
                <div className="mt-6 rounded-xl bg-canvas p-4">
                    <p className="font-semibold">{t(profile?.slug ? 'پروفایل هنرمند شما آماده است.' : 'برای شروع، پروفایل هنرمند خود را تکمیل کنید.')}</p>
                    <Link to="/dashboard/artist/profile" className="mt-3 inline-block text-sm font-bold text-terracotta-strong underline">{t('مدیریت پروفایل')}</Link>
                </div>
            )}
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <Link to="/dashboard/artist/artworks" className="rounded-xl border border-border p-5 font-bold hover:border-terracotta">{t('مدیریت آثار')}</Link>
                <Link to="/dashboard/artist/messages" className="rounded-xl border border-border p-5 font-bold hover:border-terracotta">{t('پیام‌های مستقیم')}</Link>
            </div>
            </Container>
        </div>
    );
}


export function WorkspaceSettingsPage() {
    const { t } = useLanguage();
    const { user } = useAuth();
    const { theme, cycleTheme } = useTheme();
    const queryClient = useQueryClient();
    const preferenceKey = ['notifications', user?.id, 'preferences'];
    const preferencesQuery = useQuery({
        queryKey: preferenceKey,
        queryFn: async ({ signal }) => {
            const { data } = await axios.get('/api/v1/notifications/preferences', { signal });
            return data.data ?? {
                in_app_messages: true,
                in_app_follows: true,
                in_app_artwork_likes: true,
                in_app_artwork_comments: true,
                in_app_comment_replies: true,
                email_available: false,
            };
        },
        enabled: Boolean(user?.id) && user?.role !== 'admin',
    });
    const updatePreference = useMutation({
        mutationKey: ['notifications', 'update-preference', user?.id],
        mutationFn: ({ key, enabled }) => axios.patch('/api/v1/notifications/preferences', { [key]: enabled }),
        onMutate: async ({ key, enabled }) => {
            await queryClient.cancelQueries({ queryKey: preferenceKey });
            const previous = queryClient.getQueryData(preferenceKey);
            queryClient.setQueryData(preferenceKey, (current) => ({ ...(current ?? {}), [key]: enabled }));
            return { previous };
        },
        onError: (_, __, context) => {
            if (context?.previous) queryClient.setQueryData(preferenceKey, context.previous);
        },
        onSuccess: ({ data }) => queryClient.setQueryData(preferenceKey, data.data),
    });
    const preferences = preferencesQuery.data ?? {
        in_app_messages: true, in_app_follows: true, in_app_artwork_likes: true,
        in_app_artwork_comments: true, in_app_comment_replies: true,
    };
    const preferenceOptions = [
        ['in_app_messages', t('پیام‌های جدید'), t('هنگامی که پیام تازه‌ای در فضای کاربری دریافت می‌کنید')],
        ['in_app_follows', t('دنبال‌کننده‌های تازه'), t('هنگامی که کاربری شما را دنبال می‌کند')],
        ['in_app_artwork_likes', t('پسندیدن آثار'), t('هنگامی که کسی یکی از آثار شما را می‌پسندد')],
        ['in_app_artwork_comments', t('دیدگاه‌های آثار'), t('هنگامی که کسی درباره یکی از آثار شما دیدگاه می‌نویسد')],
        ['in_app_comment_replies', t('پاسخ به دیدگاه‌ها'), t('هنگامی که کسی به دیدگاه شما پاسخ می‌دهد')],
    ];
    const [error, setError] = useState('');
    const changePreference = async (key, enabled) => {
        setError('');
        try {
            await updatePreference.mutateAsync({ key, enabled });
        } catch {
            setError(t('ذخیره تنظیمات انجام نشد. دوباره تلاش کنید.'));
        }
    };

    return (
        <section className="min-w-0 mx-auto w-full max-w-content space-y-8">
            <PageHeader bleed={false} eyebrow={t('حساب کاربری')} title={t('تنظیمات')} description={t('ترجیحات نمایش و اعلان‌های فضای کاربری را از یک بخش مدیریت کنید.')} />

            <section className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_16rem]" aria-labelledby="appearance-settings-title">
                <div className="min-w-0 border border-divider-group bg-paper p-5 sm:p-6">
                    <SectionHeader id="appearance-settings-title" eyebrow={t('نمایش')} title={t('پوسته محیط کاربری')} description={t('ظاهر راد آرت را با نور محیط یا ترجیح خود هماهنگ کنید.')} />
                </div>
                <div className="flex flex-col justify-center gap-3 border border-divider-group bg-surface-muted p-5">
                    <div>
                        <p className="text-[11px] font-semibold text-muted">{t('حالت فعلی')}</p>
                        <p className="mt-1 text-sm font-bold text-ink">{t(theme === 'dark' ? 'تیره' : theme === 'light' ? 'روشن' : 'هماهنگ با دستگاه')}</p>
                    </div>
                    <Button type="button" variant="outline" onClick={cycleTheme}>{t('تغییر پوسته')}</Button>
                </div>
            </section>

            {user?.role !== 'admin' && (
                <section className="space-y-4" aria-labelledby="notification-settings-title">
                    <SectionHeader
                        id="notification-settings-title"
                        eyebrow={t('اعلان‌ها')}
                        title={t('اعلان‌های درون‌برنامه‌ای')}
                        description={t('رویدادهایی را که می‌خواهید در صندوق اعلان‌ها ببینید انتخاب کنید.')}
                        actions={<span className="text-[11px] font-semibold text-muted">{updatePreference.isPending ? 'در حال ذخیره…' : t('ذخیره خودکار')}</span>}
                    />
                    {preferencesQuery.isError ? <p role="alert" className="text-sm text-danger">{t('دریافت تنظیمات اعلان‌ها انجام نشد. صفحه را دوباره بارگذاری کنید.')}</p> : preferencesQuery.isPending ? <p className="text-sm text-muted">{t('در حال دریافت تنظیمات…')}</p> : (
                        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                            {preferenceOptions.map(([key, label, description]) => (
                                <Checkbox
                                    key={key}
                                    checked={Boolean(preferences[key])}
                                    disabled={updatePreference.isPending || preferencesQuery.isPending || preferencesQuery.isError}
                                    onChange={(event) => changePreference(key, event.target.checked)}
                                    className="flex min-h-24 w-full items-start gap-3 border border-divider-group bg-paper p-4 text-sm leading-6 transition-colors hover:border-terracotta focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                                >
                                    <span className="min-w-0 flex-1">
                                        <strong className="block font-bold text-ink">{label}</strong>
                                        <span className="mt-1 block text-xs leading-6 text-muted">{description}</span>
                                    </span>
                                </Checkbox>
                            ))}
                        </div>
                    )}
                    <p className="text-xs leading-6 text-muted">{t('اعلان ایمیلی و پیامکی در این نسخه غیرفعال است.')}</p>
                </section>
            )}
            {error && <p role="alert" className="text-sm text-danger">{t(error)}</p>}
        </section>
    );
}

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

export function ArtistArtworkPage({ initialCreate = false }) {
    const { user, profile, profileLoading } = useOutletContext();
    if (profileLoading) return <RouteLoading label="در حال آماده‌سازی فضای آثار…" />;
    return <Suspense fallback={<RouteLoading label="در حال آماده‌سازی فضای آثار…" />}><ArtworkStudio user={user} hasProfile={Boolean(profile?.slug)} initialCreate={initialCreate} /></Suspense>;
}


export function PublicInfoPage({ title, description }) {
    const { t } = useLanguage();
    return (
        <Container as="div" width="reading" className="py-16">
            <p className="text-sm font-bold text-terracotta-strong">راد آرت</p>
            <h1 className="mt-3 text-3xl font-black">{t(title)}</h1>
            <p className="mt-5 leading-8 text-muted">{t(description)}</p>
            <p className="mt-6 border-y border-border bg-surface-muted px-5 py-5 text-sm text-muted">{t('این صفحه در نقشه مسیرهای MVP 2 ثبت شده و محتوای کامل آن در مرحله محتوای عمومی تکمیل می‌شود.')}</p>
        </Container>
    );
}



// Compatibility exports for legacy imports; route composition uses the focused modules directly.
export { RouteLoading, RequireAuth, RequireRole, DashboardIndex, UnauthorizedPage, NotFoundPage } from './router/guards';
export { ArtistWorkspaceLayout } from './layouts/ArtistLayout';
export { BuyerWorkspaceLayout } from './layouts/BuyerLayout';
export { AdminWorkspaceLayout } from './layouts/AdminLayout';
