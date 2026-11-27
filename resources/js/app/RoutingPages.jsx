import { useState } from 'react';
import { useLanguage } from './LanguageContext';
import axios from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useOutletContext } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useTheme } from './useTheme';
import { RouteLoading } from './router/guards';

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

export { RouteLoading, RequireAuth, RequireRole, DashboardIndex, UnauthorizedPage, NotFoundPage } from './router/guards';
export { ArtistWorkspaceLayout } from './layouts/ArtistLayout';
export { BuyerWorkspaceLayout } from './layouts/BuyerLayout';
export { AdminWorkspaceLayout } from './layouts/AdminLayout';
