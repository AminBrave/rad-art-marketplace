import { useState } from 'react';
import axios from 'axios';
import { Button, FormField, TextInput, Textarea } from '../components/ui';

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
                subject, message, artwork_id: artworkId, honeypot,
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
        <form onSubmit={submit} className="mt-8 grid gap-5 rounded-xl border bg-card p-5 sm:p-6" dir="rtl">
            <div>
                <h2 className="text-lg font-semibold">ارسال پیام به هنرمند</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">اطلاعات تماس خصوصی شما در اختیار هنرمند قرار نمی‌گیرد. پیام در صندوق ورودی حساب او ثبت می‌شود.</p>
            </div>
            <FormField label="موضوع" required error={errors.subject?.[0]}>
                <TextInput value={subject} onChange={(event) => setSubject(event.target.value)} required minLength="4" maxLength="160" />
            </FormField>
            <FormField label="متن پیام" required error={errors.message?.[0]} hint="حداقل ۲۰ و حداکثر ۳۰۰۰ نویسه">
                <Textarea value={message} onChange={(event) => setMessage(event.target.value)} required minLength="20" maxLength="3000" rows="5" className="leading-7" />
            </FormField>
            <div className="hidden" aria-hidden="true">
                <label>وب‌سایت<input tabIndex="-1" autoComplete="off" value={honeypot} onChange={(event) => setHoneypot(event.target.value)} /></label>
            </div>
            <div className="flex flex-wrap items-center gap-3">
                <Button type="submit" loading={busy}>ارسال پیام</Button>
                {feedback && <span role="status" className="text-sm text-muted-foreground">{feedback}</span>}
            </div>
        </form>
    );
}
