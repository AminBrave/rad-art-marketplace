import { Fragment } from 'react';
import { useLanguage } from './LanguageContext';
import { MessageHistorySkeleton, MediaImage, Tooltip, DropdownMenu, Button, TextareaField } from '../components/ui';
import { Link } from 'react-router-dom';
import { ArrowDown, Download, FileText, Flag, Image as ImageIcon, MoreVertical, Pencil, Reply, SmilePlus, Trash2 } from 'lucide-react';

const reactionOptions = ['👍', '❤️', '😂', '😮', '🙏', '🎨'];

export default function MessageTimeline({
    actionId,
    containerRef,
    draftRef,
    editDraft,
    editingId,
    focusComposerAfterMenuCloseRef,
    formatDayLabel,
    formatTimeLabel,
    loadingOlder,
    messages,
    messagesError,
    messagesLoading,
    newMessageCount,
    olderMessagesError,
    onDeleteMessage,
    onJumpToLatest,
    onPopoverOpenChange,
    onReplyTo,
    onReportMessage,
    onRetryMessages,
    onRetryOlderMessages,
    onSaveEdit,
    onScroll,
    onSetEditDraft,
    onSetEditingId,
    onToggleReaction,
    openPopover,
    userId,
}) {
    const { t, locale } = useLanguage();
    return (
        <div ref={containerRef} onScroll={onScroll} className="relative isolate flex min-h-0 flex-1 flex-col gap-2 overflow-x-hidden overflow-y-auto overscroll-contain [scrollbar-gutter:stable] [scrollbar-width:thin] [scrollbar-color:var(--color-border-strong)_transparent] bg-canvas px-3 py-5 md:gap-3 md:px-[clamp(1rem,2.5vw,2rem)] md:py-5 max-md:gap-2 max-md:px-2.5 max-md:py-3" role="log" aria-label={t("پیام‌های گفتگو")} aria-live="polite" aria-relevant="additions">
        {messagesLoading && messages.length === 0 && <MessageHistorySkeleton count={5} className="w-full" />}
        {messagesError && <div role="alert" className="m-auto flex max-w-md flex-col items-center gap-3  border border-[color:color-mix(in_srgb,var(--color-danger)_30%,transparent)] bg-danger-surface p-5 text-center text-sm text-danger"><p>{t(messagesError)}</p><Button variant="ghost" type="button" onClick={onRetryMessages} className=" px-4 py-2 font-bold underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus">{t("تلاش دوباره")}</Button></div>}
        {!messagesLoading && !messagesError && messages.length === 0 && <p className="m-auto py-6 text-center text-sm text-muted">{t("هنوز پیامی در این گفتگو وجود ندارد. می‌توانید گفتگو را با یک پیام شروع کنید.")}</p>}
        {olderMessagesError && <div role="alert" className="absolute inset-x-3 top-2 z-20 mx-auto flex w-fit max-w-full items-center gap-3  border border-[color:color-mix(in_srgb,var(--color-danger)_30%,transparent)] bg-danger-surface px-4 py-2 text-xs text-danger shadow-soft"><span>{t(olderMessagesError)}</span><Button variant="ghost" type="button" onClick={onRetryOlderMessages} className="shrink-0  px-2 py-1 font-bold underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus">{t("تلاش دوباره")}</Button></div>}
        {loadingOlder && <p className="absolute inset-x-0 top-2 z-10 mx-auto w-fit  border border-border bg-[color:color-mix(in_srgb,var(--color-paper)_95%,transparent)] px-3 py-1.5 text-xs text-muted shadow-soft" role="status">{t("در حال دریافت پیام‌های قدیمی‌تر…")}</p>}
        {newMessageCount > 0 && <Button variant="ghost" type="button" onClick={onJumpToLatest} className="absolute bottom-4 start-1/2 z-20 inline-flex -translate-x-1/2 items-center gap-2  border border-border bg-paper px-4 py-2 text-xs font-bold text-terracotta-strong shadow-soft hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus" aria-label={`${newMessageCount} پیام جدید؛ رفتن به آخر گفتگو`}><ArrowDown size={15} aria-hidden="true" />{Number(newMessageCount).toLocaleString(locale === 'fa' ? 'fa-IR' : 'en-US')} پیام جدید</Button>}
        {messages.map((message, index) => {
        const own = Number(message.sender_id) === Number(userId);
        const deleted = Boolean(message.deleted_at);
        const previousMessage = messages[index - 1];
        const showDayDivider = !previousMessage
        || new Date(previousMessage.created_at).toDateString() !== new Date(message.created_at).toDateString();
        return (
        <Fragment key={message.id}>
        {showDayDivider && <div className="flex shrink-0 justify-center py-1 font-sans"><span className="border border-border bg-paper px-3 py-1 text-[10px] font-semibold text-muted">{formatDayLabel(message.created_at)}</span></div>}
        <div className={'flex w-full min-w-0 shrink-0 px-0.5 ' + (own ? 'justify-end' : 'justify-start')}>
        <article className={'rd-message-bubble relative z-0 min-w-0 w-fit max-w-[88%] border px-3.5 py-3 font-sans shadow-none max-md:px-3 max-md:py-2.5 md:max-w-[min(76%,42rem)] ' + (own ? ' rd-message-bubble--own border-[color:color-mix(in_srgb,var(--color-action)_16%,var(--color-border))] bg-[var(--color-message-own)] text-ink' : ' rd-message-bubble--peer border-border bg-[var(--color-message-peer)] text-ink')}>
        {message.artwork && <div className="group mb-3 block overflow-hidden  border border-border bg-surface shadow-[0_1px_2px_rgba(31,30,27,0.04)]"><div className="grid min-h-32 grid-cols-[5.75rem_minmax(0,1fr)] items-stretch gap-0 md:min-h-[8.5rem] md:grid-cols-[7.25rem_minmax(0,1fr)]"><Tooltip content={message.artwork.title}><Link to={'/artworks/' + message.artwork.slug} aria-label={'مشاهده اثر ' + message.artwork.title} className="relative z-0 block min-w-0 text-inherit no-underline focus-visible:relative focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-[-3px]"><span className="relative block h-full min-h-32 w-full min-w-0 self-stretch overflow-hidden bg-surface-muted md:min-h-[8.5rem]"><MediaImage src={message.artwork.image_url} alt={message.artwork.title} className="absolute inset-0 h-full w-full" imageClassName="object-cover transition-transform duration-200 group-hover:scale-[1.045] motion-reduce:transform-none motion-reduce:transition-none" loading="lazy" decoding="async" /></span></Link></Tooltip><div className="flex min-w-0 flex-1 cursor-default flex-col items-start justify-center gap-[.2rem] p-[.65rem_.7rem] text-start md:p-[.8rem_.9rem]"><span className="inline-flex items-center text-[10px] font-extrabold leading-[1.5] text-terracotta-strong">{t("اثر مورد گفتگو")}</span><strong dir="auto" className="[display:-webkit-box] max-w-full overflow-hidden text-xs font-extrabold leading-[1.8] text-ink [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">{message.artwork.title}</strong><span dir="auto" className="[display:-webkit-box] max-w-full overflow-hidden text-[10px] leading-[1.8] text-muted [overflow-wrap:anywhere] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">{[message.artwork.artist_name, message.artwork.category, message.artwork.medium, message.artwork.dimensions, message.artwork.year?.toLocaleString?.('fa-IR')].filter(Boolean).join(' · ')}</span>{message.artwork.price && <span className="block text-[10px] font-bold leading-[1.8] text-muted">قیمت: {Number(message.artwork.price).toLocaleString(locale === 'fa' ? 'fa-IR' : 'en-US')} تومان</span>}<Link to={'/artworks/' + message.artwork.slug} className="mt-1 inline-flex w-fit items-center gap-[.3rem]  text-[10px] font-extrabold leading-[1.7] text-terracotta-strong no-underline transition-[gap] duration-150 hover:gap-2 hover:underline hover:underline-offset-[3px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus motion-reduce:transition-none">مشاهده جزئیات اثر <span aria-hidden="true">←</span></Link></div></div></div>}
        {message.attachments?.length > 0 && <ul className="mb-3 space-y-3">{message.attachments.map((attachment) => {
        const isImage = attachment.mime_type?.startsWith('image/');
        return <li key={attachment.id} className="max-w-full overflow-hidden  border border-border bg-[color:color-mix(in_srgb,var(--color-paper)_80%,transparent)]">
        {isImage && attachment.preview_url && <a href={attachment.preview_url} target="_blank" rel="noreferrer" aria-label={t("نمایش تصویر ") + attachment.name} className="block bg-surface-muted"><MediaImage src={attachment.preview_url} alt={attachment.name} className="aspect-[4/3] max-h-72 w-full" imageClassName="object-contain" loading="lazy" decoding="async" /></a>}
        <div className="flex min-w-0 items-center gap-2 p-2.5"><span className="min-h-0 p-0 flex h-9 w-9 shrink-0 items-center justify-center  bg-surface-muted text-terracotta-strong">{isImage ? <ImageIcon size={17} aria-hidden="true" /> : <FileText size={17} aria-hidden="true" />}</span><div className="min-w-0 flex-1"><p dir="auto" className="truncate text-xs font-semibold text-ink">{attachment.name}</p><p className="mt-0.5 text-[10px] text-muted">{Math.max(1, Math.round(attachment.size_bytes / 1024)).toLocaleString(locale === 'fa' ? 'fa-IR' : 'en-US')} کیلوبایت</p></div><Tooltip content={t("دانلود فایل")}><a href={attachment.download_url} download className="inline-flex min-h-9 shrink-0 items-center gap-1.5  bg-surface-muted px-2.5 text-[11px] font-bold text-terracotta-strong transition hover:bg-border" aria-label={t("دانلود ") + attachment.name}><Download size={14} aria-hidden="true" /><span>{t("دانلود")}</span></a></Tooltip></div>
        </li>;
        })}</ul>}
        {message.reply_to && <div className="mb-3 border-s-2 border-terracotta bg-surface-muted px-3 py-2 text-xs"><strong dir="auto">{message.reply_to.sender_name ?? t("پیام قبلی")}</strong><p dir="auto" className="mt-1 line-clamp-2 text-muted">{message.reply_to.body ?? t("این پیام حذف شده است.")}</p></div>}
        {editingId === message.id ? (
        <form onSubmit={(event) => onSaveEdit(event, message)} className="space-y-2  has-[textarea:focus-visible]:outline has-[textarea:focus-visible]:outline-2 has-[textarea:focus-visible]:outline-focus has-[textarea:focus-visible]:outline-offset-[3px]">
        <TextareaField dir="auto" aria-label={t("متن ویرایش‌شده پیام")} autoFocus value={editDraft} onChange={(event) => onSetEditDraft(event.target.value)} rows={3} maxLength={5000} className="w-full  border border-border bg-surface p-2 text-sm text-ink outline-none focus:border-border focus:outline-none focus-visible:outline-none focus:ring-0" />
        <div className="flex gap-2"><Button variant="ghost" type="submit" disabled={!editDraft.trim() || actionId === message.id} className="bg-ink px-3 py-1.5 text-xs font-bold text-inverse disabled:opacity-50">{t("ذخیره")}</Button><Button variant="ghost" type="button" onClick={() => onSetEditingId(null)} className="px-3 py-1.5 text-xs text-muted">انصراف</Button></div>
        </form>
        ) : <p dir="auto" className={'whitespace-pre-wrap break-words text-sm leading-[1.65] ' + (deleted ? 'italic text-muted' : '')}>{message.body ?? t("این پیام حذف شده است.")}</p>}
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[10px] text-subtle">
        <span className={own ? 'text-muted' : 'text-muted'}>{formatTimeLabel(message.created_at)} {message.edited_at && !deleted ? '· ' + t('ویرایش‌شده') : ''}</span>
        {own && !deleted && <span aria-label={message.read_at ? t("پیام خوانده شده") : t("پیام ارسال شده")} className="text-muted">{message.read_at ? t("✓✓ خوانده‌شده") : t("✓ ارسال‌شده")}</span>}
        </div>
        {!deleted && (
        <>
        <div className="mt-2 flex min-w-0 flex-wrap items-center justify-end gap-1.5"><div className="flex min-w-0 flex-wrap items-center gap-1">
        {message.reactions?.filter((reaction) => reaction.count > 0).map((reaction) => <Button variant="ghost" key={reaction.emoji} type="button" disabled={actionId === message.id} onClick={() => onToggleReaction(message, reaction.emoji)} aria-label={t("واکنش ") + reaction.emoji} aria-pressed={Boolean(reaction.reacted_by_me)} className={'inline-flex min-h-8 items-center gap-1  border border-border bg-surface px-2.5 text-[11px] leading-none text-muted transition-colors hover:border-border-strong hover:bg-surface-muted hover:text-ink aria-pressed:border-terracotta aria-pressed:bg-accent-surface aria-pressed:text-terracotta-strong motion-reduce:transition-none ' + (reaction.reacted_by_me ? 'border-terracotta bg-accent-surface text-terracotta-strong' : '')}>{reaction.emoji}<span className="tabular-nums">{Number(reaction.count).toLocaleString(locale === 'fa' ? 'fa-IR' : 'en-US')}</span></Button>)}
        <DropdownMenu.Root open={openPopover === 'reactions:' + message.id} onOpenChange={(open) => onPopoverOpenChange('reactions:' + message.id, open)}>
        <Tooltip content={t("افزودن واکنش")}><DropdownMenu.Trigger asChild>
        <Button variant="ghost" type="button" aria-label={t("افزودن واکنش")} disabled={actionId === message.id} className="min-h-0 p-0 flex h-8 w-8 items-center justify-center  border border-border bg-surface text-muted transition-colors hover:border-border-strong hover:bg-surface-muted hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus disabled:opacity-50 motion-reduce:transition-none"><SmilePlus size={15} aria-hidden="true" /></Button>
        </DropdownMenu.Trigger></Tooltip>
        <DropdownMenu.Portal>
        <DropdownMenu.Content side="top" align="end" sideOffset={8} collisionPadding={8} className="z-[60] flex max-w-[calc(100vw-1rem)] flex-nowrap items-center gap-1 overflow-x-auto  border border-border bg-paper p-1.5 shadow-soft [scrollbar-width:none]">
        {reactionOptions.map((emoji) => {
        const reaction = message.reactions?.find((item) => item.emoji === emoji);
        return <DropdownMenu.Item key={emoji} disabled={actionId === message.id} onSelect={() => onToggleReaction(message, emoji)} aria-label={t("واکنش ") + emoji} className={'flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center  text-base outline-none transition-colors data-[highlighted]:bg-surface-muted motion-reduce:transition-none ' + (reaction?.reacted_by_me ? 'bg-accent-surface text-terracotta-strong' : 'text-ink')}>{emoji}</DropdownMenu.Item>;
        })}
        </DropdownMenu.Content>
        </DropdownMenu.Portal>
        </DropdownMenu.Root>
        </div>
        <DropdownMenu.Root open={openPopover === 'message:' + message.id} onOpenChange={(open) => onPopoverOpenChange('message:' + message.id, open)}>
        <DropdownMenu.Trigger asChild>
        <Button variant="outline" type="button" title={t("عملیات پیام")} aria-label={t("عملیات پیام")} aria-haspopup="menu" className="min-h-9 h-9 w-9 min-w-9 shrink-0 border-border-strong bg-paper p-0 text-ink shadow-soft hover:border-terracotta hover:bg-surface-muted hover:text-terracotta-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus motion-reduce:transition-none"><MoreVertical size={18} strokeWidth={2.25} aria-hidden="true" /></Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
        <DropdownMenu.Content side="top" align="end" sideOffset={8} collisionPadding={8} onCloseAutoFocus={(event) => {
        if (!focusComposerAfterMenuCloseRef.current) return;
        event.preventDefault();
        focusComposerAfterMenuCloseRef.current = false;
        draftRef.current?.focus();
        }} className="z-[60] max-h-[min(20rem,var(--radix-dropdown-menu-content-available-height))] min-w-40 max-w-[calc(100vw-1rem)] overflow-y-auto  border border-border bg-paper p-1 shadow-soft">
        <DropdownMenu.Item onSelect={() => {
        focusComposerAfterMenuCloseRef.current = true;
        onReplyTo(message);
        onSetEditingId(null);
        }} className="flex min-h-10 cursor-pointer items-center gap-2.5  px-3 text-start text-xs font-semibold text-ink outline-none transition-colors data-[highlighted]:bg-surface-muted motion-reduce:transition-none"><Reply size={15} aria-hidden="true" /><span>{t("پاسخ")}</span></DropdownMenu.Item>
        {!own && <DropdownMenu.Item onSelect={() => onReportMessage(message)} className="flex min-h-10 cursor-pointer items-center gap-2.5  px-3 text-start text-xs font-semibold text-ink outline-none transition-colors data-[highlighted]:bg-surface-muted motion-reduce:transition-none"><Flag size={15} aria-hidden="true" /><span>{t('گزارش')}</span></DropdownMenu.Item>}
        {own && <DropdownMenu.Item onSelect={() => { onSetEditingId(message.id); onSetEditDraft(message.body ?? ''); }} className="flex min-h-10 cursor-pointer items-center gap-2.5  px-3 text-start text-xs font-semibold text-ink outline-none transition-colors data-[highlighted]:bg-surface-muted motion-reduce:transition-none"><Pencil size={15} aria-hidden="true" /><span>{t('ویرایش')}</span></DropdownMenu.Item>}
        {own && <DropdownMenu.Item disabled={actionId === message.id} onSelect={() => onDeleteMessage(message)} className="flex min-h-10 cursor-pointer items-center gap-2.5  px-3 text-start text-xs font-semibold text-danger outline-none transition-colors data-[highlighted]:bg-danger-surface data-[disabled]:opacity-50 motion-reduce:transition-none"><Trash2 size={15} aria-hidden="true" /><span>{t('حذف')}</span></DropdownMenu.Item>}
        </DropdownMenu.Content>
        </DropdownMenu.Portal>
        </DropdownMenu.Root>
        </div>
        </>
        )}
        </article>
        </div>
        </Fragment>
        );
        })}
        
        </div>
    );
}
