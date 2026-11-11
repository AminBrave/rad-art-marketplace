import { Button, Input, Textarea } from '../components/ui';
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
        <form onSubmit={submit} className="mt-8 rounded-lg border border-border bg-muted p-5" dir="rtl">
            <h2 className="text-lg font-semibold">ارسال پیام به هنرمند</h2>
            <p className="mt-2 text-xs leading-6 text-muted-foreground">اطلاعات تماس خصوصی شما در اختیار هنرمند قرار نمی‌گیرد. پیام در صندوق ورودی حساب او ثبت می‌شود.</p>
            <label className="mt-4 block text-sm font-semibold">
                موضوع
                <Input value={subject} onChange={(event) => setSubject(event.target.value)} required minLength="4" maxLength="160" / className="w-full" />
                {errors.subject?.map((item) => <span key={item} className="mt-1 block text-xs text-destructive">{item}</span>)}
            </label>
            <label className="mt-4 block text-sm font-semibold">
                متن پیام
                <Textarea value={message} onChange={(event) => setMessage(event.target.value)} required minLength="20" maxLength="3000" rows="5" / className="w-full">
                <span className="mt-1 block text-xs font-normal text-muted-foreground">حداقل ۲۰ و حداکثر ۳۰۰۰ نویسه</span>
                {errors.message?.map((item) => <span key={item} className="mt-1 block text-xs text-destructive">{item}</span>)}
            </label>
            <div className="hidden" aria-hidden="true">
                <label>وب‌سایت<Input tabIndex="-1" autoComplete="off" value={honeypot} onChange={(event) => setHoneypot(event.target.value)} /></label>
            </div>
            <Button disabled={busy} variant="default" size="default" type="submit" className="mt-4">
                {busy ? 'در حال ارسال…' : 'ارسال پیام'}
            </Button>
            {feedback && <p role="status" className="mt-3 text-sm text-primary">{feedback}</p>}
        </form>
    );
}
