import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useMutation } from '@tanstack/react-query';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';
import { RouteLoading } from './RoutingPages';
import { SelectField, FormField, TextInput, Button, Container } from '../components/ui';

export default function AuthPage({ initialMode = 'login' }) {
    const [mode, setMode] = useState(initialMode);
    const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '', role: 'artist' });
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState('');
    const submittingRef = useRef(false);
    const { user, status, setUser } = useAuth();
    const { t } = useLanguage();
    const location = useLocation();
    const navigate = useNavigate();
    const authMutation = useMutation({
        mutationKey: ['auth', 'authenticate'],
        mutationFn: ({ endpoint, payload }) => axios.post(endpoint, payload),
    });
    const busy = authMutation.isPending;

    useEffect(() => { setMode(initialMode); }, [initialMode]);

    if (status === 'loading') return <RouteLoading label={t('در حال بررسی حساب کاربری…')} />;
    if (status === 'error') return <p className="mx-auto max-w-xl px-6 py-16 text-center text-sm text-danger">{t("وضعیت حساب دریافت نشد. صفحه را دوباره بارگذاری کنید.")}</p>;
    if (user) return <Navigate to={location.state?.from?.pathname ?? (user.role === 'admin' ? '/admin' : user.role === 'buyer' ? '/dashboard/buyer' : '/dashboard/artist')} replace />;

    const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

    const submit = async (event) => {
        event.preventDefault();
        if (submittingRef.current) return;

        submittingRef.current = true;
        setErrors({});
        setMessage('');
        try {
            const endpoint = mode === 'register' ? '/api/v1/auth/register' : '/api/v1/auth/login';
            const payload = mode === 'register' ? form : { email: form.email, password: form.password };
            const { data } = await authMutation.mutateAsync({ endpoint, payload });
            setUser(data.data);
            const target = location.state?.from?.pathname ?? (data.data.role === 'admin' ? '/admin' : data.data.role === 'buyer' ? '/dashboard/buyer' : '/dashboard/artist');
            navigate(target, { replace: true });
        } catch (error) {
            if (error.response?.status === 422) {
                setErrors(Object.fromEntries(Object.entries(error.response.data.errors ?? { form: [error.response.data.message] }).map(([key, messages]) => [key, messages.map(t)])));
                setMessage(t(error.response.data.message ?? 'لطفاً اطلاعات ورود را بررسی کنید.'));
            } else if (error.response?.status === 429) {
                setMessage(t('تعداد تلاش‌ها زیاد است. کمی بعد دوباره امتحان کنید.'));
            } else {
                setMessage(t('ورود یا ثبت‌نام انجام نشد. اتصال را بررسی و دوباره تلاش کنید.'));
            }
        } finally {
            submittingRef.current = false;
        }
    };

    return (
        <Container as="div" width="reading" className="py-page">
            <section className="border-y border-ink bg-paper p-6 sm:p-9">
                <Link to="/" className="text-sm font-bold text-terracotta-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-2">{t("بازگشت به راد آرت")}</Link>
                <h1 className="mt-5 text-3xl font-black tracking-tight">{mode === 'register' ? t('ساخت حساب کاربری') : t('ورود به حساب')}</h1>
                <div className="mt-7 flex gap-5 border-b-2 border-ink pb-4">
                    <Button variant="ghost" type="button" onClick={() => { setMode('login'); setErrors({}); setMessage(''); }} className={`focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-2 ${mode === 'login' ? 'font-extrabold text-terracotta-strong' : 'text-muted'}`}>{t("ورود")}</Button>
                    <Button variant="ghost" type="button" onClick={() => { setMode('register'); setErrors({}); setMessage(''); }} className={`focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-2 ${mode === 'register' ? 'font-extrabold text-terracotta-strong' : 'text-muted'}`}>{t("ثبت‌نام")}</Button>
                </div>
                <form onSubmit={submit} className="mt-6 space-y-4">
                    {mode === 'register' && <>
                        <FormField label={t("نوع حساب")}><SelectField name="role" value={form.role} onChange={update}><option value="buyer">{t("خریدار")}</option><option value="artist">{t("هنرمند")}</option></SelectField></FormField>
                        <FormField label={t("نام و نام خانوادگی")} required error={errors.name?.join(' ')}><TextInput name="name" value={form.name} onChange={update} required maxLength="120" autoComplete="name" /></FormField>
                    </>}
                    <FormField label={t("ایمیل")} required error={errors.email?.join(' ')}><TextInput type="email" name="email" value={form.email} onChange={update} required autoComplete="email" dir="ltr" className="text-start" /></FormField>
                    <FormField label={t("گذرواژه")} required error={errors.password?.join(' ')}><TextInput type="password" name="password" value={form.password} onChange={update} required minLength="10" autoComplete={mode === 'register' ? 'new-password' : 'current-password'} dir="ltr" className="text-start" /></FormField>
                    {mode === 'register' && <FormField label={t("تکرار گذرواژه")} required><TextInput type="password" name="password_confirmation" value={form.password_confirmation} onChange={update} required minLength="10" autoComplete="new-password" dir="ltr" className="text-start" /></FormField>}
                    {errors.form?.map((item) => <p key={item} role="alert" className="text-sm text-danger">{t(item)}</p>)}
                    {message && <p role="status" className="text-sm text-muted">{t(message)}</p>}
                    <Button variant="ghost" type="submit" disabled={busy} className="w-full rounded-sm bg-ink px-6 py-3.5 font-bold text-inverse transition hover:bg-terracotta focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-2 disabled:cursor-wait disabled:opacity-60">{busy ? t('لطفاً صبر کنید…') : mode === 'register' ? t('ایجاد حساب') : t('ورود به حساب')}</Button>
                </form>
                <p className="mt-5 text-xs leading-6 text-subtle">{t("ثبت‌نام عمومی فقط برای خریدار و هنرمند فعال است. حساب مدیر باید از سمت سرور ایجاد شود.")}</p>
            </section>
        </Container>
    );
}
