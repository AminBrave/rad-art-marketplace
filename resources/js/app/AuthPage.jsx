import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { RouteLoading } from './RoutingPages';
import { Alert, AlertDescription, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, FormField, SelectField, TextInput } from '../components/ui';

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
    if (status === 'error') return <p className="mx-auto max-w-xl px-6 py-16 text-center text-sm text-red-700">وضعیت حساب دریافت نشد. صفحه را دوباره بارگذاری کنید.</p>;
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
            <section className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-9">
                <Link to="/" className="text-sm font-bold text-primary">بازگشت به راد آرت</Link>
                <h1 className="mt-5 text-2xl font-black">{mode === 'register' ? 'ساخت حساب کاربری' : 'ورود به حساب'}</h1>
                <div className="mt-6 flex gap-5 border-b border-border pb-4">
                    <button type="button" onClick={() => { setMode('login'); setErrors({}); setMessage(''); }} className={mode === 'login' ? 'font-extrabold text-primary' : 'text-muted-foreground'}>ورود</button>
                    <button type="button" onClick={() => { setMode('register'); setErrors({}); setMessage(''); }} className={mode === 'register' ? 'font-extrabold text-primary' : 'text-muted-foreground'}>ثبت‌نام</button>
                </div>
                <form onSubmit={submit} className="mt-6 space-y-4">
                    {mode === 'register' && <>
                        <label className="block text-sm font-semibold">نوع حساب
                            <select name="role" value={form.role} onChange={update} className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3">
                                <option value="buyer">خریدار</option><option value="artist">هنرمند</option>
                            </select>
                        </label>
                        <label className="block text-sm font-semibold">نام و نام خانوادگی
                            <input name="name" value={form.name} onChange={update} required maxLength="120" autoComplete="name" className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3" />
                            {errors.name?.map((item) => <span key={item} className="mt-1 block text-xs text-red-700">{item}</span>)}
                        </label>
                    </>}
                    <label className="block text-sm font-semibold">ایمیل
                        <input type="email" name="email" value={form.email} onChange={update} required autoComplete="email" dir="ltr" className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-left" />
                        {errors.email?.map((item) => <span key={item} className="mt-1 block text-xs text-red-700">{item}</span>)}
                    </label>
                    <label className="block text-sm font-semibold">گذرواژه
                        <input type="password" name="password" value={form.password} onChange={update} required minLength="10" autoComplete={mode === 'register' ? 'new-password' : 'current-password'} dir="ltr" className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-left" />
                        {errors.password?.map((item) => <span key={item} className="mt-1 block text-xs text-red-700">{item}</span>)}
                    </label>
                    {mode === 'register' && <label className="block text-sm font-semibold">تکرار گذرواژه
                        <input type="password" name="password_confirmation" value={form.password_confirmation} onChange={update} required minLength="10" autoComplete="new-password" dir="ltr" className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-left" />
                    </label>}
                    {errors.form?.map((item) => <p key={item} role="alert" className="text-sm text-red-700">{item}</p>)}
                    {message && <p role="status" className="text-sm text-muted-foreground">{message}</p>}
                    <button disabled={busy} className="w-full rounded-xl bg-primary px-6 py-3.5 font-bold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-wait disabled:opacity-60">{busy ? 'لطفاً صبر کنید…' : mode === 'register' ? 'ایجاد حساب' : 'ورود به حساب'}</button>
                </form>
                <p className="mt-5 text-xs leading-6 text-muted-foreground">ثبت‌نام عمومی فقط برای خریدار و هنرمند فعال است. حساب مدیر باید از سمت سرور ایجاد شود.</p>
            </section>
        </main>
    );
}    return (
        <main className="mx-auto flex min-h-[65vh] max-w-xl items-start justify-center px-4 py-12 sm:px-6 sm:py-16" dir="rtl">
            <Card className="w-full overflow-hidden">
                <CardHeader className="border-b bg-muted/30">
                    <Link to="/" className="text-sm font-medium text-primary underline-offset-4 hover:underline">بازگشت به راد آرت</Link>
                    <CardTitle className="mt-3 text-2xl">{mode === 'register' ? 'ساخت حساب کاربری' : 'ورود به حساب'}</CardTitle>
                    <CardDescription>برای ادامه و دسترسی به فضای شخصی خود وارد شوید.</CardDescription>
                </CardHeader>
                <CardContent className="p-6 sm:p-8">
                    <div role="tablist" aria-label="نوع دسترسی" className="mb-6 grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
                        <button type="button" role="tab" aria-selected={mode === 'login'} onClick={() => { setMode('login'); setErrors({}); setMessage(''); }} className={mode === 'login' ? 'h-9 rounded-md bg-background text-sm font-semibold text-foreground shadow-sm' : 'h-9 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground'}>ورود</button>
                        <button type="button" role="tab" aria-selected={mode === 'register'} onClick={() => { setMode('register'); setErrors({}); setMessage(''); }} className={mode === 'register' ? 'h-9 rounded-md bg-background text-sm font-semibold text-foreground shadow-sm' : 'h-9 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground'}>ثبت‌نام</button>
                    </div>
                    <form onSubmit={submit} className="grid gap-5">
                        {mode === 'register' && <>
                            <FormField label="نوع حساب" required>
                                <SelectField name="role" value={form.role} onChange={update}>
                                    <option value="buyer">خریدار</option><option value="artist">هنرمند</option>
                                </SelectField>
                            </FormField>
                            <FormField label="نام و نام خانوادگی" required error={errors.name?.[0]}>
                                <TextInput name="name" value={form.name} onChange={update} required maxLength="120" autoComplete="name" />
                            </FormField>
                        </>}
                        <FormField label="ایمیل" required error={errors.email?.[0]}>
                            <TextInput type="email" name="email" value={form.email} onChange={update} required autoComplete="email" dir="ltr" className="text-left" />
                        </FormField>
                        <FormField label="گذرواژه" required error={errors.password?.[0]}>
                            <TextInput type="password" name="password" value={form.password} onChange={update} required minLength="10" autoComplete={mode === 'register' ? 'new-password' : 'current-password'} dir="ltr" className="text-left" />
                        </FormField>
                        {mode === 'register' && <FormField label="تکرار گذرواژه" required>
                            <TextInput type="password" name="password_confirmation" value={form.password_confirmation} onChange={update} required minLength="10" autoComplete="new-password" dir="ltr" className="text-left" />
                        </FormField>}
                        {errors.form?.length > 0 && <Alert variant="destructive"><AlertDescription>{errors.form.join('، ')}</AlertDescription></Alert>}
                        {message && !errors.form?.length && <p role="status" className="text-sm text-muted-foreground">{message}</p>}
                        <Button type="submit" block size="lg" loading={busy}>{busy ? 'لطفاً صبر کنید…' : mode === 'register' ? 'ایجاد حساب' : 'ورود به حساب'}</Button>
                    </form>
                    <p className="mt-6 text-xs leading-6 text-muted-foreground">ثبت‌نام عمومی فقط برای خریدار و هنرمند فعال است. حساب مدیر باید از سمت سرور ایجاد شود.</p>
                </CardContent>
            </Card>
        </main>
    );{ useEffect, useState } from 'react';
import axios from 'axios';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { RouteLoading } from './RoutingPages';
import { Alert, AlertDescription, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, FormField, SelectField, TextInput } from '../components/ui';

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
    if (status === 'error') return <p className="mx-auto max-w-xl px-6 py-16 text-center text-sm text-red-700">وضعیت حساب دریافت نشد. صفحه را دوباره بارگذاری کنید.</p>;
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
        <main className="mx-auto flex min-h-[65vh] max-w-xl items-start justify-center px-4 py-12 sm:px-6 sm:py-16" dir="rtl">
            <Card className="w-full overflow-hidden">
                <CardHeader className="border-b bg-muted/30">
                    <Link to="/" className="text-sm font-medium text-primary underline-offset-4 hover:underline">بازگشت به راد آرت</Link>
                    <CardTitle className="mt-3 text-2xl">{mode === 'register' ? 'ساخت حساب کاربری' : 'ورود به حساب'}</CardTitle>
                    <CardDescription>برای ادامه و دسترسی به فضای شخصی خود وارد شوید.</CardDescription>
                </CardHeader>
                <CardContent className="p-6 sm:p-8">
                    <div role="tablist" aria-label="نوع دسترسی" className="mb-6 grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
                        <button type="button" role="tab" aria-selected={mode === 'login'} onClick={() => { setMode('login'); setErrors({}); setMessage(''); }} className={mode === 'login' ? 'h-9 rounded-md bg-background text-sm font-semibold text-foreground shadow-sm' : 'h-9 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground'}>ورود</button>
                        <button type="button" role="tab" aria-selected={mode === 'register'} onClick={() => { setMode('register'); setErrors({}); setMessage(''); }} className={mode === 'register' ? 'h-9 rounded-md bg-background text-sm font-semibold text-foreground shadow-sm' : 'h-9 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground'}>ثبت‌نام</button>
                    </div>
                    <form onSubmit={submit} className="grid gap-5">
                        {mode === 'register' && <>
                            <FormField label="نوع حساب" required>
                                <SelectField name="role" value={form.role} onChange={update}>
                                    <option value="buyer">خریدار</option><option value="artist">هنرمند</option>
                                </SelectField>
                            </FormField>
                            <FormField label="نام و نام خانوادگی" required error={errors.name?.[0]}>
                                <TextInput name="name" value={form.name} onChange={update} required maxLength="120" autoComplete="name" />
                            </FormField>
                        </>}
                        <FormField label="ایمیل" required error={errors.email?.[0]}>
                            <TextInput type="email" name="email" value={form.email} onChange={update} required autoComplete="email" dir="ltr" className="text-left" />
                        </FormField>
                        <FormField label="گذرواژه" required error={errors.password?.[0]}>
                            <TextInput type="password" name="password" value={form.password} onChange={update} required minLength="10" autoComplete={mode === 'register' ? 'new-password' : 'current-password'} dir="ltr" className="text-left" />
                        </FormField>
                        {mode === 'register' && <FormField label="تکرار گذرواژه" required>
                            <TextInput type="password" name="password_confirmation" value={form.password_confirmation} onChange={update} required minLength="10" autoComplete="new-password" dir="ltr" className="text-left" />
                        </FormField>}
                        {errors.form?.length > 0 && <Alert variant="destructive"><AlertDescription>{errors.form.join('، ')}</AlertDescription></Alert>}
                        {message && !errors.form?.length && <p role="status" className="text-sm text-muted-foreground">{message}</p>}
                        <Button type="submit" block size="lg" loading={busy}>{busy ? 'لطفاً صبر کنید…' : mode === 'register' ? 'ایجاد حساب' : 'ورود به حساب'}</Button>
                    </form>
                    <p className="mt-6 text-xs leading-6 text-muted-foreground">ثبت‌نام عمومی فقط برای خریدار و هنرمند فعال است. حساب مدیر باید از سمت سرور ایجاد شود.</p>
                </CardContent>
            </Card>
        </main>
    );
}
}
