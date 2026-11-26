import { MediaImage, TextareaField, FileInput, Button } from '../components/ui';
import { useLanguage } from './LanguageContext';
import { Link } from 'react-router-dom';
import { FileText, LoaderCircle, Paperclip, Send, X } from 'lucide-react';

export default function MessageComposer({
    draft,
    draftRef,
    fileInputRef,
    filePreview,
    onCancelReply,
    onDraftChange,
    onFileChange,
    onRemoveArtwork,
    onRemoveFile,
    onSubmit,
    pendingArtwork,
    replyTo,
    safety,
    safetyLoading,
    selectedFile,
    sending,
    sendingInAnotherConversation,
    uploadProgress,
    uploading,
}) {
    const { t, locale } = useLanguage();
    return (
        <form dir="ltr" onSubmit={onSubmit} aria-label={t("ارسال پیام")} className="shrink-0 border-t border-border bg-paper px-2.5 pb-[max(.5rem,env(safe-area-inset-bottom))] pt-2 sm:px-3 sm:py-2">
            {pendingArtwork && <div role="group" aria-label={t("ارجاع به اثر")} className="mb-3 flex min-w-0 items-center gap-3 border-s border-terracotta border-[color:color-mix(in_srgb,var(--color-terracotta)_30%,transparent)] bg-surface-muted p-2.5"><Link to={'/artworks/' + pendingArtwork.slug} className="flex min-w-0 flex-1 items-center gap-3  focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus"><MediaImage src={pendingArtwork.image_url} alt={pendingArtwork.title} className="h-16 w-16 shrink-0 bg-paper" imageClassName="object-cover" loading="eager" /><span className="min-w-0"><span className="block text-[10px] font-bold text-terracotta-strong">{t("پاسخ درباره این اثر")}</span><strong dir="auto" className="mt-1 block truncate text-xs text-ink">{pendingArtwork.title}</strong><span dir="auto" className="mt-1 block truncate text-[10px] text-muted">{[pendingArtwork.artist_name, pendingArtwork.category, pendingArtwork.medium, pendingArtwork.dimensions].filter(Boolean).join(' · ')}</span>{pendingArtwork.price && <span className="mt-1 block text-[10px] font-semibold text-muted">{t('قیمت:')} {Number(pendingArtwork.price).toLocaleString(locale === 'fa' ? 'fa-IR' : 'en-US')} {t('تومان')}</span>}</span></Link><button title={t("حذف ارجاع به اثر")} type="button" onClick={onRemoveArtwork} aria-label={t("حذف ارجاع به اثر")} className="inline-flex h-8 w-8 shrink-0 items-center justify-center border-0 bg-transparent p-0 text-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus"><X size={16} aria-hidden="true" /></button></div>}
            {replyTo && <div role="group" aria-label={t("پاسخ انتخاب‌شده")} className="mb-3 flex items-start justify-between gap-3 border-s-2 border-terracotta bg-surface-muted p-3 text-xs"><div><strong>{t('پاسخ به')} <span dir="auto">{replyTo.sender_name ?? 'پیام'}</span></strong><p dir="auto" className="mt-1 line-clamp-2 text-muted">{replyTo.body}</p></div><button title={t("لغو پاسخ")} type="button" onClick={onCancelReply} aria-label={t("لغو پاسخ")} className="inline-flex h-8 w-8 items-center justify-center border-0 bg-transparent p-0 text-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus"><X size={16} aria-hidden="true" /></button></div>}
            <div className="relative flex min-w-0 items-center gap-1.5 border border-border bg-surface p-2 shadow-none max-sm:gap-1.5 max-sm:p-1.5">
                <div className="min-w-0 flex-1"><TextareaField dir="auto" aria-label={t("متن پیام")} ref={draftRef} value={draft} disabled={sending || safetyLoading || safety.blocked_by_me || safety.blocked_by_other} onChange={(event) => onDraftChange(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} rows={1} maxLength={5000} placeholder={t("پیام بنویسید…")} className="max-h-28 min-h-[2.35rem] max-sm:min-h-9 w-full resize-none overflow-y-auto border-0 bg-transparent ps-10 pe-3 py-[.4rem] font-sans text-[14px] leading-[1.65] text-ink outline-none placeholder:text-subtle focus:outline-none focus-visible:outline-none focus:ring-0" />
                    <div className="mt-0 flex flex-wrap items-center gap-1.5"><label title={t("افزودن تصویر یا PDF")} htmlFor="message-attachment-input" className="absolute start-2 top-1/2 -translate-y-1/2 z-10 flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center  border border-transparent bg-transparent text-muted transition-colors hover:border-border hover:bg-surface-muted hover:text-terracotta-strong focus-within:outline focus-within:outline-2 focus-within:outline-focus focus-within:outline-offset-2 motion-reduce:transition-none"><Paperclip size={18} aria-hidden="true" /><span className="sr-only">{t("افزودن تصویر یا فایل PDF")}</span><FileInput id="message-attachment-input" ref={fileInputRef} aria-label={t("انتخاب تصویر یا فایل PDF")} aria-describedby="message-attachment-help" disabled={sending || safetyLoading || safety.blocked_by_me || safety.blocked_by_other} accept="image/jpeg,image/png,image/webp,application/pdf" className="sr-only min-h-0" onChange={onFileChange} /></label><span id="message-attachment-help" className="sr-only">{t("حداکثر حجم ۱۰ مگابایت؛ فرمت‌های مجاز: JPG، PNG، WebP و PDF")}</span>{selectedFile && <div className="mt-3 flex w-full max-w-md items-center gap-3  border border-border bg-paper p-2.5"><span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden  bg-surface-muted text-terracotta-strong">{filePreview ? <MediaImage src={filePreview} alt="" className="h-full w-full" imageClassName="object-cover" loading="eager" /> : <FileText size={18} aria-hidden="true" />}</span><span className="min-w-0 flex-1"><span dir="auto" className="block truncate text-xs font-semibold text-ink">{selectedFile.name}</span><span role="status" aria-live="polite" aria-atomic="true" className="sr-only">{t('پیوست انتخاب شد:')} {selectedFile.name}</span><span className="text-[10px] text-muted">{Math.max(1, Math.round(selectedFile.size / 1024)).toLocaleString(locale === 'fa' ? 'fa-IR' : 'en-US')} {t('کیلوبایت')}</span></span><button title={t("حذف پیوست")} type="button" onClick={onRemoveFile} className="inline-flex h-8 w-8 items-center justify-center border-0 bg-transparent p-0 text-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus" aria-label={t("حذف پیوست")}><X size={16} aria-hidden="true" /></button></div>}{sending && (sendingInAnotherConversation
                        ? <span role="status" aria-live="polite" className="text-xs text-muted">{t("در حال ارسال در گفتگوی دیگر؛ تا پایان ارسال نمی‌توانید پیام دیگری بفرستید.")}</span>
                        : selectedFile && <span role="status" aria-live="polite" className="text-xs text-muted">{uploading ? `${t('بارگذاری')} ${uploadProgress}%` : t('در حال آماده‌سازی پیام…')}</span>)}</div>
                </div>
                <button type="submit" title={t("ارسال پیام")} aria-label={sending ? t('در حال ارسال پیام') : t('ارسال پیام')} aria-busy={sending} disabled={(!draft.trim() && !selectedFile) || sending || safetyLoading || safety.blocked_by_me || safety.blocked_by_other} className="inline-flex h-[2.35rem] w-[2.35rem] shrink-0 items-center justify-center border border-border bg-surface p-0 text-ink disabled:cursor-not-allowed disabled:opacity-50 max-sm:h-9 max-sm:w-9">{sending ? <LoaderCircle size={19} className="animate-spin" aria-hidden="true" /> : <Send size={18} aria-hidden="true" />}</button>
            </div>
        </form>
    );
}
