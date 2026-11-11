import { Button, Input, Select } from '../components/ui';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { RouteLoading } from './RoutingPages';

export default function AuthPage({ initialMode = 'login' }) {
    const [mode, setMode] = useState(initialMode);
    const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '', role: 'artist' });
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState('');
    const [busy, setBusy] = useState(false);
    const { user, status, setUser } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => { setMode(initialMode); }, [initialMode]);

    if (status === 'loading') return <RouteLoading label="در حال بررسی حساب کاربری…" />;
    if (status === 'error') return <p className="mx-auto max-w-xl px-6 py-16 text-center text-sm text-destructive">وضعیت حساب دریافت نشد. صفحه را دوباره بارگذاری کنید.</p>;
    if (user) return <Navigate to={location.state?.from?.pathname ?? (user.role === 'admin' ? '/admin' : user.role === 'buyer' ? '/dashboard/buyer' : '/dashboard/artist')} replace />;

    const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

    const submit = async (event) => {
        event.preventDefault();
        setBusy(true);
        setErrors({});
        setMessage('');
        try {
            const endpoint = mode === 'register' ? '/api/v1/auth/register' : '/api/v1/auth/login';
            const payload = mode === 'register' ? form : { email: form.email, password: form.password };
            const { data } = await axios.post(endpoint, payload);
            setUser(data.data);
            const target = location.state?.from?.pathname ?? (data.data.role === 'admin' ? '/admin' : data.data.role === 'buyer' ? '/dashboard/buyer' : '/dashboard/artist');
            navigate(target, { replace: true });
        } catch (error) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors ?? { form: [error.response.data.message] });
                setMessage(error.response.data.message ?? 'لطفاً اطلاعات ورود را بررسی کنید.');
            } else if (error.response?.status === 429) {
                setMessage('تعداد تلاش‌ها زیاد است. کمی بعد دوباره امتحان کنید.');
            } else {
                setMessage('ورود یا ثبت‌نام انجام نشد. اتصال را بررسی و دوباره تلاش کنید.');
            }
        } finally {
            setBusy(false);
        }
    };

    return (
        <main className="mx-auto max-w-xl px-5 py-12 sm:px-8" dir="rtl">
            <section className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-9">
                <Link to="/" className="text-sm font-bold text-[#9a452b]">بازگشت به راد آرت</Link>
                <h1 className="mt-5 text-2xl font-black">{mode === 'register' ? 'ساخت حساب کاربری' : 'ورود به حساب'}</h1>
                <div className="mt-6 flex gap-5 border-b border-border pb-4">
                    <Button type="button" onClick={() => { setMode('login'); setErrors({}); setMessage(''); }} variant="ghost" size="default">ورود</Button>
                    <Button type="button" onClick={() => { setMode('register'); setErrors({}); setMessage(''); }} variant="ghost" size="default">ثبت‌نام</Button>
                </div>
                <form onSubmit={submit} className="mt-6 space-y-4">
                    {mode === 'register' && <>
                        <label className="block text-sm font-semibold">نوع حساب
                            <Select name="role" value={form.role} onChange={update} className="w-full">
                                <option value="buyer">خریدار</option><option value="artist">هنرمند</option>
                            </Select>
                        </label>
                        <label className="block text-sm font-semibold">نام و نام خانوادگی
                            <Input name="name" value={form.name} onChange={update} required maxLength="120" autoComplete="name" / className="w-full" />
                            {errors.name?.map((item) => <span key={item} className="mt-1 block text-xs text-destructive">{item}</span>)}
                        </label>
                    </>}
                    <label className="block text-sm font-semibold">ایمیل
                        <Input type="email" name="email" value={form.email} onChange={update} required autoComplete="email" dir="ltr" / className="w-full" />
                        {errors.email?.map((item) => <span key={item} className="mt-1 block text-xs text-destructive">{item}</span>)}
                    </label>
                    <label className="block text-sm font-semibold">گذرواژه
                        <Input type="password" name="password" value={form.password} onChange={update} required minLength="10" autoComplete={mode === 'register' ? 'new-password' : 'current-password'} dir="ltr" / className="w-full" />
                        {errors.password?.map((item) => <span key={item} className="mt-1 block text-xs text-destructive">{item}</span>)}
                    </label>
                    {mode === 'register' && <label className="block text-sm font-semibold">تکرار گذرواژه
                        <Input type="password" name="password_confirmation" value={form.password_confirmation} onChange={update} required minLength="10" autoComplete="new-password" dir="ltr" / className="w-full" />
                    </label>}
                    {errors.form?.map((item) => <p key={item} role="alert" className="text-sm text-destructive">{item}</p>)}
                    {message && <p role="status" className="text-sm text-[#80513d]">{message}</p>}
                    <Button disabled={busy} variant="default" size="default" type="submit" className="w-full">{busy ? 'لطفاً صبر کنید…' : mode === 'register' ? 'ایجاد حساب' : 'ورود به حساب'}</Button>
                </form>
                <p className="mt-5 text-xs leading-6 text-muted-foreground">ثبت‌نام عمومی فقط برای خریدار و هنرمند فعال است. حساب مدیر باید از سمت سرور ایجاد شود.</p>
            </section>
        </main>
    );
}
