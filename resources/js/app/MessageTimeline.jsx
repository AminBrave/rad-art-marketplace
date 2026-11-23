import { Fragment } from 'react';
import { MessageHistorySkeleton, MediaImage, Tooltip, DropdownMenu } from '../components/ui';
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
    return (
        <div dir="rtl" ref={containerRef} onScroll={onScroll} className="relative isolate flex min-h-0 flex-1 flex-col gap-2 overflow-x-hidden overflow-y-auto overscroll-contain [scrollbar-gutter:stable] [scrollbar-width:thin] [scrollbar-color:var(--color-border-strong)_transparent] bg-[radial-gradient(circle_at_1px_1px,color-mix(in_srgb,var(--color-ink)_5%,transparent)_1px,transparent_0)] [background-size:22px_22px] px-3 py-5 md:gap-2 md:px-[clamp(.75rem,2vw,1.5rem)] md:py-3 max-md:gap-2 max-md:px-2.5 max-md:py-3" role="log" aria-label="پیام‌های گفتگو" aria-live="polite" aria-relevant="additions">
        {messagesLoading && messages.length === 0 && <MessageHistorySkeleton count={5} className="w-full" />}
        {messagesError && <div role="alert" className="m-auto flex max-w-md flex-col items-center gap-3 rounded-xl border border-[color:color-mix(in_srgb,var(--color-danger)_30%,transparent)] bg-danger-surface p-5 text-center text-sm text-danger"><p>{messagesError}</p><button type="button" onClick={onRetryMessages} className="rounded-lg px-4 py-2 font-bold underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus">تلاش دوباره</button></div>}
        {!messagesLoading && !messagesError && messages.length === 0 && <p className="m-auto py-6 text-center text-sm text-muted">هنوز پیامی در این گفتگو وجود ندارد. می‌توانید گفتگو را با یک پیام شروع کنید.</p>}
        {olderMessagesError && <div role="alert" className="absolute inset-x-3 top-2 z-20 mx-auto flex w-fit max-w-full items-center gap-3 rounded-xl border border-[color:color-mix(in_srgb,var(--color-danger)_30%,transparent)] bg-danger-surface px-4 py-2 text-xs text-danger shadow-soft"><span>{olderMessagesError}</span><button type="button" onClick={onRetryOlderMessages} className="shrink-0 rounded-lg px-2 py-1 font-bold underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus">تلاش دوباره</button></div>}
        {loadingOlder && <p className="absolute inset-x-0 top-2 z-10 mx-auto w-fit rounded-full border border-border bg-[color:color-mix(in_srgb,var(--color-paper)_95%,transparent)] px-3 py-1.5 text-xs text-muted shadow-soft" role="status">در حال دریافت پیام‌های قدیمی‌تر…</p>}
        {newMessageCount > 0 && <button type="button" onClick={onJumpToLatest} className="absolute bottom-4 left-1/2 z-20 inline-flex -translate-x-1/2 items-center gap-2 rounded-full border border-border bg-paper px-4 py-2 text-xs font-bold text-accent-strong shadow-soft hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus" aria-label={`${newMessageCount} پیام جدید؛ رفتن به آخر گفتگو`}><ArrowDown size={15} aria-hidden="true" />{Number(newMessageCount).toLocaleString('fa-IR')} پیام جدید</button>}
        {messages.map((message, index) => {
        const own = Number(message.sender_id) === Number(userId);
        const deleted = Boolean(message.deleted_at);
        const previousMessage = messages[index - 1];
        const showDayDivider = !previousMessage
        || new Date(previousMessage.created_at).toDateString() !== new Date(message.created_at).toDateString();
        return (
        <Fragment key={message.id}>
        {showDayDivider && <div dir="rtl" className="flex shrink-0 justify-center py-1 font-persian"><span className="rounded-full border border-border bg-[color:color-mix(in_srgb,var(--color-paper)_90%,transparent)] px-3 py-1 text-[10px] font-semibold text-muted shadow-soft">{formatDayLabel(message.created_at)}</span></div>}
        <div dir="rtl" className={'flex w-full min-w-0 shrink-0 px-[.15rem] ' + (own ? 'justify-start' : 'justify-end')}>
        <article dir="rtl" className={'relative z-0 min-w-0 w-fit max-w-[88%] rounded-[1.1rem] border px-3 py-2.5 font-persian shadow-[0_2px_8px_color-mix(in_srgb,var(--color-ink)_5%,transparent)] max-md:px-3 max-md:py-2 md:max-w-[min(76%,42rem)] ' + (own ? 'rounded-es-[.35rem] border-[color:color-mix(in_srgb,var(--color-action)_16%,var(--color-border))] bg-[var(--color-message-own)] text-ink' : 'rounded-ee-[.35rem] border-border bg-[var(--color-message-peer)] text-ink')}>
        {message.artwork && <div className="group mb-3 block overflow-hidden rounded-xl border border-border bg-surface shadow-[0_1px_2px_rgba(31,30,27,0.04)]"><div className="grid min-h-32 grid-cols-[5.75rem_minmax(0,1fr)] items-stretch gap-0 md:min-h-[8.5rem] md:grid-cols-[7.25rem_minmax(0,1fr)]"><Tooltip content={message.artwork.title}><Link to={'/artworks/' + message.artwork.slug} aria-label={'مشاهده اثر ' + message.artwork.title} className="relative z-0 block min-w-0 text-inherit no-underline focus-visible:relative focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-[-3px]"><span className="relative block h-full min-h-32 w-full min-w-0 self-stretch overflow-hidden bg-surface-muted md:min-h-[8.5rem]"><MediaImage src={message.artwork.image_url} alt={message.artwork.title} className="absolute inset-0 h-full w-full" imageClassName="object-cover transition-transform duration-200 group-hover:scale-[1.045] motion-reduce:transform-none motion-reduce:transition-none" loading="lazy" decoding="async" /></span></Link></Tooltip><div className="flex min-w-0 flex-1 cursor-default flex-col items-start justify-center gap-[.2rem] p-[.65rem_.7rem] text-start md:p-[.8rem_.9rem]"><span className="inline-flex items-center text-[10px] font-extrabold leading-[1.5] text-accent-strong">اثر مورد گفتگو</span><strong dir="auto" className="[display:-webkit-box] max-w-full overflow-hidden text-xs font-extrabold leading-[1.8] text-ink [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">{message.artwork.title}</strong><span dir="auto" className="[display:-webkit-box] max-w-full overflow-hidden text-[10px] leading-[1.8] text-muted [overflow-wrap:anywhere] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">{[message.artwork.artist_name, message.artwork.category, message.artwork.medium, message.artwork.dimensions, message.artwork.year?.toLocaleString?.('fa-IR')].filter(Boolean).join(' · ')}</span>{message.artwork.price && <span className="block text-[10px] font-bold leading-[1.8] text-muted">قیمت: {Number(message.artwork.price).toLocaleString('fa-IR')} تومان</span>}<Link to={'/artworks/' + message.artwork.slug} className="mt-1 inline-flex w-fit items-center gap-[.3rem] rounded-sm text-[10px] font-extrabold leading-[1.7] text-accent-strong no-underline transition-[gap] duration-150 hover:gap-2 hover:underline hover:underline-offset-[3px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus motion-reduce:transition-none">مشاهده جزئیات اثر <span aria-hidden="true">←</span></Link></div></div></div>}
        {message.attachments?.length > 0 && <ul className="mb-3 space-y-3">{message.attachments.map((attachment) => {
        const isImage = attachment.mime_type?.startsWith('image/');
        return <li key={attachment.id} className="max-w-full overflow-hidden rounded-xl border border-border bg-[color:color-mix(in_srgb,var(--color-paper)_80%,transparent)]">
        {isImage && attachment.preview_url && <a href={attachment.preview_url} target="_blank" rel="noreferrer" aria-label={'نمایش تصویر ' + attachment.name} className="block bg-surface-muted"><MediaImage src={attachment.preview_url} alt={attachment.name} className="aspect-[4/3] max-h-72 w-full" imageClassName="object-contain" loading="lazy" decoding="async" /></a>}
        <div className="flex min-w-0 items-center gap-2 p-2.5"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-accent-strong">{isImage ? <ImageIcon size={17} aria-hidden="true" /> : <FileText size={17} aria-hidden="true" />}</span><div className="min-w-0 flex-1"><p dir="auto" className="truncate text-xs font-semibold text-ink">{attachment.name}</p><p className="mt-0.5 text-[10px] text-muted">{Math.max(1, Math.round(attachment.size_bytes / 1024)).toLocaleString('fa-IR')} کیلوبایت</p></div><Tooltip content={'دانلود فایل'}><a href={attachment.download_url} download className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-lg bg-surface-muted px-2.5 text-[11px] font-bold text-accent-strong transition hover:bg-border" aria-label={'دانلود ' + attachment.name}><Download size={14} aria-hidden="true" /><span>دانلود</span></a></Tooltip></div>
        </li>;
        })}</ul>}
        {message.reply_to && <div className="mb-3 border-s-2 border-accent bg-surface-muted px-3 py-2 text-xs"><strong dir="auto">{message.reply_to.sender_name ?? 'پیام قبلی'}</strong><p dir="auto" className="mt-1 line-clamp-2 text-muted">{message.reply_to.body ?? 'این پیام حذف شده است.'}</p></div>}
        {editingId === message.id ? (
        <form onSubmit={(event) => onSaveEdit(event, message)} className="space-y-2 rounded-lg has-[textarea:focus-visible]:outline has-[textarea:focus-visible]:outline-2 has-[textarea:focus-visible]:outline-focus has-[textarea:focus-visible]:outline-offset-[3px]">
        <textarea dir="auto" aria-label="متن ویرایش‌شده پیام" autoFocus value={editDraft} onChange={(event) => onSetEditDraft(event.target.value)} rows={3} maxLength={5000} className="w-full rounded-sm border border-border bg-surface p-2 text-sm text-ink outline-none focus:border-border focus:outline-none focus-visible:outline-none focus:ring-0" />
        <div className="flex gap-2"><button disabled={!editDraft.trim() || actionId === message.id} className="bg-ink px-3 py-1.5 text-xs font-bold text-inverse disabled:opacity-50">ذخیره</button><button type="button" onClick={() => onSetEditingId(null)} className="px-3 py-1.5 text-xs text-muted">انصراف</button></div>
        </form>
        ) : <p dir="auto" className={'whitespace-pre-wrap break-words text-sm leading-[1.65] ' + (deleted ? 'italic text-muted' : '')}>{message.body ?? 'این پیام حذف شده است.'}</p>}
        <div className="mt-[.55rem] flex flex-wrap items-center justify-between gap-2 text-[10px] text-subtle">
        <span className={own ? 'text-muted' : 'text-muted'}>{formatTimeLabel(message.created_at)} {message.edited_at && !deleted ? '· ویرایش‌شده' : ''}</span>
        {own && !deleted && <span aria-label={message.read_at ? 'پیام خوانده شده' : 'پیام ارسال شده'} className="text-muted">{message.read_at ? '✓✓ خوانده‌شده' : '✓ ارسال‌شده'}</span>}
        </div>
        {!deleted && (
        <>
        <div className="mt-2 flex min-w-0 flex-wrap items-center justify-end gap-1.5"><div className="flex min-w-0 flex-wrap items-center gap-1">
        {message.reactions?.filter((reaction) => reaction.count > 0).map((reaction) => <button key={reaction.emoji} type="button" disabled={actionId === message.id} onClick={() => onToggleReaction(message, reaction.emoji)} aria-label={'واکنش ' + reaction.emoji} aria-pressed={Boolean(reaction.reacted_by_me)} className={'inline-flex min-h-8 items-center gap-1 rounded-full border border-border bg-surface px-2.5 text-[11px] leading-none text-muted transition-colors hover:border-border-strong hover:bg-surface-muted hover:text-ink aria-pressed:border-accent aria-pressed:bg-accent-surface aria-pressed:text-accent-strong motion-reduce:transition-none ' + (reaction.reacted_by_me ? 'border-accent bg-accent-surface text-accent-strong' : '')}>{reaction.emoji}<span className="tabular-nums">{Number(reaction.count).toLocaleString('fa-IR')}</span></button>)}
        <DropdownMenu.Root dir="rtl" open={openPopover === 'reactions:' + message.id} onOpenChange={(open) => onPopoverOpenChange('reactions:' + message.id, open)}>
        <Tooltip content="افزودن واکنش"><DropdownMenu.Trigger asChild>
        <button type="button" aria-label="افزودن واکنش" disabled={actionId === message.id} className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface text-muted transition-colors hover:border-border-strong hover:bg-surface-muted hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus disabled:opacity-50 motion-reduce:transition-none"><SmilePlus size={15} aria-hidden="true" /></button>
        </DropdownMenu.Trigger></Tooltip>
        <DropdownMenu.Portal>
        <DropdownMenu.Content dir="rtl" side="top" align="end" sideOffset={8} collisionPadding={8} className="z-[60] flex max-w-[calc(100vw-1rem)] flex-nowrap items-center gap-1 overflow-x-auto rounded-full border border-border bg-paper p-1.5 shadow-soft [scrollbar-width:none]">
        {reactionOptions.map((emoji) => {
        const reaction = message.reactions?.find((item) => item.emoji === emoji);
        return <DropdownMenu.Item key={emoji} disabled={actionId === message.id} onSelect={() => onToggleReaction(message, emoji)} aria-label={'واکنش ' + emoji} className={'flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-base outline-none transition-colors data-[highlighted]:bg-surface-muted motion-reduce:transition-none ' + (reaction?.reacted_by_me ? 'bg-accent-surface text-accent-strong' : 'text-ink')}>{emoji}</DropdownMenu.Item>;
        })}
        </DropdownMenu.Content>
        </DropdownMenu.Portal>
        </DropdownMenu.Root>
        </div>
        <DropdownMenu.Root dir="rtl" open={openPopover === 'message:' + message.id} onOpenChange={(open) => onPopoverOpenChange('message:' + message.id, open)}>
        <Tooltip content="عملیات پیام"><DropdownMenu.Trigger asChild>
        <button type="button" aria-label="عملیات پیام" className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus motion-reduce:transition-none"><MoreVertical size={16} aria-hidden="true" /></button>
        </DropdownMenu.Trigger></Tooltip>
        <DropdownMenu.Portal>
        <DropdownMenu.Content dir="rtl" side="top" align="end" sideOffset={8} collisionPadding={8} onCloseAutoFocus={(event) => {
        if (!focusComposerAfterMenuCloseRef.current) return;
        event.preventDefault();
        focusComposerAfterMenuCloseRef.current = false;
        draftRef.current?.focus();
        }} className="z-[60] max-h-[min(20rem,var(--radix-dropdown-menu-content-available-height))] min-w-40 max-w-[calc(100vw-1rem)] overflow-y-auto rounded-lg border border-border bg-paper p-1 shadow-soft">
        <DropdownMenu.Item onSelect={() => {
        focusComposerAfterMenuCloseRef.current = true;
        onReplyTo(message);
        onSetEditingId(null);
        }} className="flex min-h-10 cursor-pointer items-center gap-2.5 rounded-md px-3 text-start text-xs font-semibold text-ink outline-none transition-colors data-[highlighted]:bg-surface-muted motion-reduce:transition-none"><Reply size={15} aria-hidden="true" /><span>پاسخ</span></DropdownMenu.Item>
        {!own && <DropdownMenu.Item onSelect={() => onReportMessage(message)} className="flex min-h-10 cursor-pointer items-center gap-2.5 rounded-md px-3 text-start text-xs font-semibold text-ink outline-none transition-colors data-[highlighted]:bg-surface-muted motion-reduce:transition-none"><Flag size={15} aria-hidden="true" /><span>گزارش</span></DropdownMenu.Item>}
        {own && <DropdownMenu.Item onSelect={() => { onSetEditingId(message.id); onSetEditDraft(message.body ?? ''); }} className="flex min-h-10 cursor-pointer items-center gap-2.5 rounded-md px-3 text-start text-xs font-semibold text-ink outline-none transition-colors data-[highlighted]:bg-surface-muted motion-reduce:transition-none"><Pencil size={15} aria-hidden="true" /><span>ویرایش</span></DropdownMenu.Item>}
        {own && <DropdownMenu.Item disabled={actionId === message.id} onSelect={() => onDeleteMessage(message)} className="flex min-h-10 cursor-pointer items-center gap-2.5 rounded-md px-3 text-start text-xs font-semibold text-danger outline-none transition-colors data-[highlighted]:bg-danger-surface data-[disabled]:opacity-50 motion-reduce:transition-none"><Trash2 size={15} aria-hidden="true" /><span>حذف</span></DropdownMenu.Item>}
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
