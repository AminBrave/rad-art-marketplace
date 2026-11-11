import { useState } from 'react';
import axios from 'axios';

export default function ContactArtistForm({ artistSlug, artworkId = null }) {
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [honeypot, setHoneypot] = useState('');
    const [busy, setBusy] = useState(false);
    const [errors, setErrors] = useState({});
    const [feedback, setFeedback] = useState('');

    const submit = async (event) => {
        event.preventDefault();
        setBusy(true);
        setErrors({});
        setFeedback('');

        try {
            const { data } = await axios.post('/api/v1/artists/' + encodeURIComponent(artistSlug) + '/inquiries', {
                subject,
                message,
                artwork_id: artworkId,
                honeypot,
            });
            setSubject('');
            setMessage('');
            setFeedback(data.message);
        } catch (error) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors ?? {});
                setFeedback('لطفاً اطلاعات فرم را بررسی کنید.');
            } else if (error.response?.status === 429) {
                setFeedback('تعداد درخواست‌ها زیاد است. کمی بعد دوباره تلاش کنید.');
            } else {
                setFeedback('ارسال پیام انجام نشد. دوباره تلاش کنید.');
            }
        } finally {
            setBusy(false);
        }
    };

    return (
        <form onSubmit={submit} className="mt-8 rounded-2xl border border-border bg-muted p-5" dir="rtl">
            <h2 className="text-lg font-extrabold">ارسال پیام به هنرمند</h2>
            <p className="mt-2 text-xs leading-6 text-muted-foreground">اطلاعات تماس خصوصی شما در اختیار هنرمند قرار نمی‌گیرد. پیام در صندوق ورودی حساب او ثبت می‌شود.</p>
            <label className="mt-4 block text-sm font-semibold">
                موضوع
                <input value={subject} onChange={(event) => setSubject(event.target.value)} required minLength="4" maxLength="160" className="mt-2 w-full rounded-xl border border-border bg-card px-4 py-3 outline-none focus:border-terracotta" />
                {errors.subject?.map((item) => <span key={item} className="mt-1 block text-xs text-destructive">{item}</span>)}
            </label>
            <label className="mt-4 block text-sm font-semibold">
                متن پیام
                <textarea value={message} onChange={(event) => setMessage(event.target.value)} required minLength="20" maxLength="3000" rows="5" className="mt-2 w-full rounded-xl border border-border bg-card px-4 py-3 leading-7 outline-none focus:border-terracotta" />
                <span className="mt-1 block text-xs font-normal text-muted-foreground">حداقل ۲۰ و حداکثر ۳۰۰۰ نویسه</span>
                {errors.message?.map((item) => <span key={item} className="mt-1 block text-xs text-destructive">{item}</span>)}
            </label>
            <div className="hidden" aria-hidden="true">
                <label>وب‌سایت<input tabIndex="-1" autoComplete="off" value={honeypot} onChange={(event) => setHoneypot(event.target.value)} /></label>
            </div>
            <button disabled={busy} className="mt-4 rounded-full bg-ink px-6 py-3 text-sm font-bold text-white hover:bg-terracotta disabled:opacity-60">
                {busy ? 'در حال ارسال…' : 'ارسال پیام'}
            </button>
            {feedback && <p role="status" className="mt-3 text-sm text-terracotta-strong">{feedback}</p>}
        </form>
    );
}
