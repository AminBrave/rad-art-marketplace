import { ConversationInboxSkeleton } from '..';
import { Tabs, TabsList, TabsTrigger, TabsContent, Tooltip, DropdownMenu, TextInput, Button } from '../../../shared/ui';
import { useLanguage } from '../../../shared/i18n';
import { Archive, ArchiveRestore, Bell, BellOff, Inbox, LoaderCircle, MailOpen, MoreVertical, Search } from 'lucide-react';
import { avatarInitial, avatarTone } from '../utils/messagingAvatarUtils';

function dateLabel(value, locale) {
    if (!value) return '';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '' : date.toLocaleString(locale === 'fa' ? 'fa-IR' : 'en-US', { dateStyle: 'short', timeStyle: 'short' });
}

export default function MessagingInboxPanel({
    active,
    sendingConversationId,
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
    const { t, locale } = useLanguage();
    return (
                <aside aria-label={t("فهرست گفتگوها")} className={active ? 'hidden h-full min-h-0 flex-col border-e-0 border-border bg-paper md:border-e lg:flex' : 'flex h-full min-h-0 flex-col border-e-0 border-border bg-paper md:border-e'}>
                    <div className="shrink-0 border-b border-border bg-paper px-4 py-4 sm:px-5">
                        <div className="flex items-start justify-between gap-3"><div className="min-w-0"><h2 className="text-sm font-extrabold leading-6 text-ink">{t("پیام‌ها")}</h2><p className="mt-0.5 text-[10px] leading-4 text-muted">{t("یک بستر امن برای ارتباط خریدار با هنرمند.")}</p></div><span className="mt-1 shrink-0 border-s border-border ps-3 text-[10px] font-bold leading-none text-muted">{threads.length} گفتگو</span></div>
                    </div>
                    <Tabs value={threadFilter} onValueChange={setThreadFilter} className="flex min-h-0 flex-1 flex-col">
                        <div className="shrink-0 space-y-3 border-b border-border bg-paper px-3 py-3 sm:px-4">
                            <div className="relative"><Search size={17} aria-hidden="true" className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-muted" /><TextInput aria-label={t("جستجوی گفتگوها")} value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t("جستجو در گفتگوها…")} className="min-h-11 rounded-sm border-border bg-surface-muted py-2 ps-10 pe-4 text-sm placeholder:text-muted shadow-none" /></div>
                            <TabsList aria-label={t("فیلتر گفتگوها")} className="grid grid-cols-3 gap-0 border-b border-border bg-transparent">
                                <TabsTrigger value="all" className="inline-flex min-h-10 min-w-0 w-full flex-row items-center justify-center gap-1.5 border-b-2 border-transparent px-2 py-2 text-xs leading-none text-center text-muted data-[state=active]:border-terracotta data-[state=active]:bg-transparent data-[state=active]:font-bold data-[state=active]:text-terracotta-strong">
                                    <Inbox size={14} aria-hidden="true" className="shrink-0" /><span className="truncate leading-none">{t("همه")}</span>
                                </TabsTrigger>
                                <TabsTrigger value="unread" className="inline-flex min-h-10 min-w-0 w-full flex-row items-center justify-center gap-1.5 border-b-2 border-transparent px-2 py-2 text-xs leading-none text-center text-muted data-[state=active]:border-terracotta data-[state=active]:bg-transparent data-[state=active]:font-bold data-[state=active]:text-terracotta-strong">
                                    <MailOpen size={14} aria-hidden="true" className="shrink-0" /><span className="truncate leading-none">{t("خوانده‌نشده")}</span>
                                </TabsTrigger>
                                <TabsTrigger value="archived" className="inline-flex min-h-10 min-w-0 w-full flex-row items-center justify-center gap-1.5 border-b-2 border-transparent px-2 py-2 text-xs leading-none text-center text-muted data-[state=active]:border-terracotta data-[state=active]:bg-transparent data-[state=active]:font-bold data-[state=active]:text-terracotta-strong">
                                    <Archive size={14} aria-hidden="true" className="shrink-0" /><span className="truncate leading-none">{t("بایگانی")}</span>
                                </TabsTrigger>
                            </TabsList>
                        </div>
                        <TabsContent value={threadFilter} className="flex min-h-0 flex-1 flex-col p-0 pt-0 focus-visible:ring-0">
                    {loading ? <ConversationInboxSkeleton count={6} /> : threads.length === 0 ? (inboxQuery.isError ? null : <p className="p-5 text-sm leading-7 text-muted">{t("هنوز گفتگویی ندارید. از صفحه هنرمند یا یک اثر، گزینه «پیام مستقیم» را انتخاب کنید.")}</p>) : (
                        <ul className="min-h-0 flex-1 divide-y divide-border/70 overflow-y-auto overscroll-contain [scrollbar-width:thin] [scrollbar-color:var(--color-border-strong)_transparent]">
                            {threads.map((thread) => <li key={thread.id} className={'relative transition-colors hover:bg-surface-muted/70 focus-within:bg-surface-muted/70 ' + (Number(active) === Number(thread.id) ? 'bg-surface-muted shadow-[inset_-3px_0_0_var(--color-terracotta)]' : '')}>
                                <Button variant="ghost" type="button" onClick={() => onSelectThread(thread)} aria-current={Number(active) === Number(thread.id) ? 'true' : undefined} className="flex min-h-[4.75rem] w-full items-center gap-3 bg-transparent px-3 py-3 pe-12 text-start transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus"><span aria-hidden="true" className={'flex h-10 w-10 aspect-square shrink-0 items-center justify-center relative overflow-hidden border border-border text-sm font-black [box-shadow:none] ' + avatarTone(thread.participant?.name)} >{avatarInitial(thread.participant?.name)}</span><span className="min-w-0 flex-1">
                                    <span className="flex items-center justify-between gap-2"><strong dir="auto" className="truncate text-sm font-extrabold">{thread.participant?.name ?? t('گفتگو')}</strong>{thread.unread_count > 0 && <span aria-label={`${Number(thread.unread_count).toLocaleString(locale === 'fa' ? 'fa-IR' : 'en-US')} پیام خوانده‌نشده`} className={thread.unread_count < 10 ? 'flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-terracotta text-[11px] font-bold tabular-nums text-inverse' : 'flex h-6 min-w-8 max-w-12 shrink-0 items-center justify-center rounded-full bg-terracotta px-2 text-[11px] font-bold tabular-nums text-inverse'}>{thread.unread_count > 99 ? '۹۹+' : Number(thread.unread_count).toLocaleString(locale === 'fa' ? 'fa-IR' : 'en-US')}</span>}</span>
                                    <span dir="auto" className="mt-1 block truncate text-xs leading-[1.45] text-muted">{thread.last_message?.body ?? (thread.last_message?.deleted_at ? t('پیام حذف شده است') : t('برای شروع گفتگو پیام بفرستید'))}</span>
                                    {Number(sendingConversationId) === Number(thread.id) && <span role="status" aria-live="polite" className="mt-1 inline-flex items-center gap-1.5 text-[11px] font-semibold text-terracotta-strong"><LoaderCircle size={12} className="animate-spin motion-reduce:animate-none" aria-hidden="true" />{t('در حال ارسال پیام و پیوست…')}</span>}
                                    <span className="mt-1 block text-[11px] tabular-nums text-subtle">{dateLabel(thread.last_message_at, locale)}</span>
                                    </span>
                                </Button>
                                <div className="absolute end-1 top-1/2 -translate-y-1/2">
                                    <DropdownMenu.Root open={openPopover === 'thread:' + thread.id} onOpenChange={(open) => setPopoverOpen('thread:' + thread.id, open)}>
                                        <Tooltip content={t("گزینه‌های گفتگو")}><DropdownMenu.Trigger asChild>
                                            <Button variant="ghost" type="button" aria-label={t("گزینه‌های گفتگو")} className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus motion-reduce:transition-none"><MoreVertical size={17} aria-hidden="true" /></Button>
                                        </DropdownMenu.Trigger></Tooltip>
                                        <DropdownMenu.Portal>
                                            <DropdownMenu.Content side="bottom" align="end" sideOffset={8} collisionPadding={8} className="z-[60] max-h-[min(20rem,var(--radix-dropdown-menu-content-available-height))] min-w-48 max-w-[calc(100vw-1rem)] overflow-y-auto rounded-lg border border-border bg-paper p-1 shadow-soft">
                                                <DropdownMenu.Item onSelect={() => updateThreadSetting(thread, 'archived', !thread.archived)} className="flex min-h-10 cursor-pointer items-center gap-2.5 rounded-md px-3 text-start text-xs font-semibold text-ink outline-none transition-colors data-[highlighted]:bg-surface-muted motion-reduce:transition-none">{thread.archived ? <ArchiveRestore size={15} aria-hidden="true" /> : <Archive size={15} aria-hidden="true" />}<span>{thread.archived ? 'بازگردانی از بایگانی' : t("بایگانی گفتگو")}</span></DropdownMenu.Item>
                                                <DropdownMenu.Item onSelect={() => updateThreadSetting(thread, 'muted', !thread.muted)} className="flex min-h-10 cursor-pointer items-center gap-2.5 rounded-md px-3 text-start text-xs font-semibold text-ink outline-none transition-colors data-[highlighted]:bg-surface-muted motion-reduce:transition-none">{thread.muted ? <Bell size={15} aria-hidden="true" /> : <BellOff size={15} aria-hidden="true" />}<span>{thread.muted ? t('فعال کردن اعلان‌ها') : t('بی‌صدا کردن گفتگو')}</span></DropdownMenu.Item>
                                            </DropdownMenu.Content>
                                        </DropdownMenu.Portal>
                                    </DropdownMenu.Root>
                                </div>
                            </li>)}
                        </ul>
                    )}
                        </TabsContent>
                    </Tabs>
                    {hasMoreThreads && <Button variant="ghost" type="button" disabled={loadingMoreThreads} onClick={() => loadThreads({ append: true })} className="mx-4 my-3 min-h-10 rounded-md border border-border bg-surface px-3 py-2 text-xs font-semibold text-terracotta-strong hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus disabled:opacity-50">{loadingMoreThreads ? t('در حال دریافت…') : t('گفتگوهای بیشتر')}</Button>}
        </aside>
    );
}
