import { ConversationInboxSkeleton, Tabs, TabsList, TabsTrigger, TabsContent, Tooltip, DropdownMenu } from '../components/ui';
import { Archive, ArchiveRestore, Bell, BellOff, Inbox, MailOpen, MoreVertical, Search } from 'lucide-react';
import { avatarInitial, avatarTone } from './messagingAvatarUtils';

function dateLabel(value) {
    if (!value) return '';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '' : date.toLocaleString('fa-IR', { dateStyle: 'short', timeStyle: 'short' });
}

export default function MessagingInboxPanel({
    active,
    hasMoreThreads,
    inboxQuery,
    loadThreads,
    loading,
    loadingMoreThreads,
    onSelectThread,
    openPopover,
    search,
    setPopoverOpen,
    setSearch,
    setThreadFilter,
    threadFilter,
    threads,
    updateThreadSetting,
}) {
    return (
                <aside aria-label="فهرست گفتگوها" className={active ? 'hidden h-full min-h-0 flex-col border-e-0 border-border bg-paper md:border-e lg:flex' : 'flex h-full min-h-0 flex-col border-e-0 border-border bg-paper md:border-e'}>
                    <div className="shrink-0 border-b border-border bg-paper px-3 py-2.5">
                        <div className="flex items-start justify-between gap-3"><div className="min-w-0"><h2 className="text-sm font-extrabold leading-6 text-ink">پیام‌ها</h2><p className="mt-0.5 text-[10px] leading-4 text-muted">یک بستر امن برای ارتباط خریدار با هنرمند.</p></div><span className="mt-0.5 shrink-0 rounded-full border border-border bg-surface-muted px-2.5 py-1 text-[10px] font-bold leading-none text-muted">{threads.length} گفتگو</span></div>
                    </div>
                    <Tabs value={threadFilter} onValueChange={setThreadFilter} dir="rtl" className="flex min-h-0 flex-1 flex-col">
                        <div className="shrink-0 space-y-2 border-b border-border bg-surface-muted p-2.5">
                            <div className="relative"><Search size={17} aria-hidden="true" className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-muted" /><input dir="rtl" aria-label="جستجوی گفتگوها" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="جستجو در گفتگوها…" className="min-h-[2.5rem] w-full rounded-md border border-border-strong bg-surface py-2 ps-10 pe-4 text-sm text-ink placeholder:text-muted shadow-none outline-none transition focus:border-focus focus:outline focus:outline-2 focus:outline-[color:var(--color-focus-soft)] focus:outline-offset-1 focus:ring-0" /></div>
                            <TabsList aria-label="فیلتر گفتگوها" className="grid grid-cols-3 gap-0 overflow-hidden rounded-md border border-border bg-surface-muted border-b-0">
                                <TabsTrigger value="all" className="inline-flex flex-row min-w-0 w-full items-center justify-center gap-1.5 rounded-none border-b-0 px-2 py-2 text-xs leading-none text-center data-[state=active]:border-transparent data-[state=active]:bg-ink data-[state=active]:text-inverse">
                                    <Inbox size={14} aria-hidden="true" className="shrink-0" /><span className="truncate leading-none">همه</span>
                                </TabsTrigger>
                                <TabsTrigger value="unread" className="inline-flex flex-row min-w-0 w-full items-center justify-center gap-1.5 rounded-none border-b-0 px-2 py-2 text-xs leading-none text-center data-[state=active]:border-transparent data-[state=active]:bg-ink data-[state=active]:text-inverse">
                                    <MailOpen size={14} aria-hidden="true" className="shrink-0" /><span className="truncate leading-none">خوانده‌نشده</span>
                                </TabsTrigger>
                                <TabsTrigger value="archived" className="inline-flex flex-row min-w-0 w-full items-center justify-center gap-1.5 rounded-none border-b-0 px-2 py-2 text-xs leading-none text-center data-[state=active]:border-transparent data-[state=active]:bg-ink data-[state=active]:text-inverse">
                                    <Archive size={14} aria-hidden="true" className="shrink-0" /><span className="truncate leading-none">بایگانی</span>
                                </TabsTrigger>
                            </TabsList>
                        </div>
                        <TabsContent value={threadFilter} dir="rtl" className="flex min-h-0 flex-1 flex-col p-0 pt-0 focus-visible:ring-0">
                    {loading ? <ConversationInboxSkeleton count={6} /> : threads.length === 0 ? (inboxQuery.isError ? null : <p className="p-5 text-sm leading-7 text-muted">هنوز گفتگویی ندارید. از صفحه هنرمند یا یک اثر، گزینه «پیام مستقیم» را انتخاب کنید.</p>) : (
                        <ul dir="rtl" className="min-h-0 flex-1 divide-y divide-border overflow-y-auto overscroll-contain [scrollbar-width:thin] [scrollbar-color:var(--color-border-strong)_transparent]">
                            {threads.map((thread) => <li key={thread.id} className={'relative transition-colors hover:bg-surface-muted focus-within:bg-surface-muted ' + (Number(active) === Number(thread.id) ? 'bg-surface-muted shadow-[inset_-3px_0_0_var(--color-terracotta)]' : '')}>
                                <button type="button" onClick={() => onSelectThread(thread)} aria-current={Number(active) === Number(thread.id) ? 'true' : undefined} className="flex min-h-[4.25rem] w-full items-center gap-2 bg-transparent px-3 py-2 pe-12 text-start transition"><span aria-hidden="true" className={'flex h-10 w-10 aspect-square shrink-0 items-center justify-center overflow-hidden rounded-full border border-border text-sm font-black [box-shadow:none] ' + avatarTone(thread.participant?.name)}>{avatarInitial(thread.participant?.name)}</span><span className="min-w-0 flex-1">
                                    <span className="flex items-center justify-between gap-2"><strong dir="auto" className="truncate text-sm font-extrabold">{thread.participant?.name ?? 'گفتگو'}</strong>{thread.unread_count > 0 && <span aria-label={`${Number(thread.unread_count).toLocaleString('fa-IR')} پیام خوانده‌نشده`} className={thread.unread_count < 10 ? 'flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-terracotta text-[11px] font-bold tabular-nums text-inverse' : 'flex h-6 min-w-8 max-w-12 shrink-0 items-center justify-center rounded-full bg-terracotta px-2 text-[11px] font-bold tabular-nums text-inverse'}>{thread.unread_count > 99 ? '۹۹+' : Number(thread.unread_count).toLocaleString('fa-IR')}</span>}</span>
                                    <span dir="auto" className="mt-1 block truncate text-xs leading-[1.45] text-muted">{thread.last_message?.body ?? (thread.last_message?.deleted_at ? 'پیام حذف شده است' : 'برای شروع گفتگو پیام بفرستید')}</span>
                                    <span className="mt-1 block text-[11px] tabular-nums text-subtle">{dateLabel(thread.last_message_at)}</span>
                                    </span>
                                </button>
                                <div className="absolute end-1 top-1/2 -translate-y-1/2">
                                    <DropdownMenu.Root dir="rtl" open={openPopover === 'thread:' + thread.id} onOpenChange={(open) => setPopoverOpen('thread:' + thread.id, open)}>
                                        <Tooltip content="گزینه‌های گفتگو"><DropdownMenu.Trigger asChild>
                                            <button type="button" aria-label="گزینه‌های گفتگو" className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus motion-reduce:transition-none"><MoreVertical size={17} aria-hidden="true" /></button>
                                        </DropdownMenu.Trigger></Tooltip>
                                        <DropdownMenu.Portal>
                                            <DropdownMenu.Content dir="rtl" side="bottom" align="end" sideOffset={8} collisionPadding={8} className="z-[60] max-h-[min(20rem,var(--radix-dropdown-menu-content-available-height))] min-w-48 max-w-[calc(100vw-1rem)] overflow-y-auto rounded-lg border border-border bg-paper p-1 shadow-soft">
                                                <DropdownMenu.Item onSelect={() => updateThreadSetting(thread, 'archived', !thread.archived)} className="flex min-h-10 cursor-pointer items-center gap-2.5 rounded-md px-3 text-start text-xs font-semibold text-ink outline-none transition-colors data-[highlighted]:bg-surface-muted motion-reduce:transition-none">{thread.archived ? <ArchiveRestore size={15} aria-hidden="true" /> : <Archive size={15} aria-hidden="true" />}<span>{thread.archived ? 'بازگردانی از بایگانی' : 'بایگانی گفتگو'}</span></DropdownMenu.Item>
                                                <DropdownMenu.Item onSelect={() => updateThreadSetting(thread, 'muted', !thread.muted)} className="flex min-h-10 cursor-pointer items-center gap-2.5 rounded-md px-3 text-start text-xs font-semibold text-ink outline-none transition-colors data-[highlighted]:bg-surface-muted motion-reduce:transition-none">{thread.muted ? <Bell size={15} aria-hidden="true" /> : <BellOff size={15} aria-hidden="true" />}<span>{thread.muted ? 'فعال کردن اعلان‌ها' : 'بی‌صدا کردن گفتگو'}</span></DropdownMenu.Item>
                                            </DropdownMenu.Content>
                                        </DropdownMenu.Portal>
                                    </DropdownMenu.Root>
                                </div>
                            </li>)}
                        </ul>
                    )}
                        </TabsContent>
                    </Tabs>
                    {hasMoreThreads && <button type="button" disabled={loadingMoreThreads} onClick={() => loadThreads({ append: true })} className="mx-4 my-3 min-h-10 rounded-md border border-border bg-surface px-3 py-2 text-xs font-semibold text-terracotta-strong hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus disabled:opacity-50">{loadingMoreThreads ? 'در حال دریافت…' : 'گفتگوهای بیشتر'}</button>}
        </aside>
    );
}
