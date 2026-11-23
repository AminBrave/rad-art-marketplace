import { Tooltip, DropdownMenu, Button } from '../components/ui';
import { Link } from 'react-router-dom';
import { Ban, ChevronRight, Flag, MoreVertical, ShieldCheck } from 'lucide-react';

export default function ConversationHeader({
    avatarInitial,
    avatarTone,
    onBack,
    onPopoverOpenChange,
    onReportConversation,
    onToggleBlock,
    openPopover,
    role,
    safety,
    selected,
    children,
}) {
    return (
        <header className="relative z-20 shrink-0 border-b border-border bg-[color:color-mix(in_srgb,var(--color-paper)_96%,transparent)] shadow-soft backdrop-blur after:absolute after:inset-x-0 after:top-0 after:h-1 after:bg-terracotta">
            <div className="flex min-h-[3.5rem] min-w-0 items-center gap-2 px-3 py-2 pt-3 md:min-h-[3.75rem] md:gap-3 md:px-4">
                <Tooltip content="بازگشت به گفتگوها">
                    <Button variant="ghost"
                        type="button"
                        aria-label="بازگشت به گفتگوها"
                        className="min-h-0 p-0 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-canvas text-ink transition hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus lg:hidden"
                        onClick={onBack}
                    >
                        <ChevronRight size={19} aria-hidden="true" />
                    </Button>
                </Tooltip>
                {selected?.artist?.slug ? (
                    <Tooltip content="مشاهده پروفایل هنرمند">
                        <Link
                            to={'/artists/' + selected.artist.slug}
                            aria-label={'مشاهده صفحه هنرمند ' + (selected?.participant?.name ?? '')}
                            className="min-h-0 p-0 group flex h-11 w-11 aspect-square shrink-0 items-center justify-center rounded-full text-inherit no-underline transition-[transform,opacity] hover:-translate-y-px hover:opacity-[.88] focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus motion-reduce:transition-none"
                        >
                            <span
                                aria-hidden="true"
                                className={'flex h-full w-full items-center justify-center overflow-hidden rounded-full border border-border-strong outline outline-[3px] outline-surface-muted [outline-offset:1px] text-sm font-black [box-shadow:0_1px_2px_color-mix(in_srgb,var(--color-ink)_8%,transparent)] ' + avatarTone(selected?.participant?.name)}
                            >
                                {avatarInitial(selected?.participant?.name)}
                            </span>
                        </Link>
                    </Tooltip>
                ) : (
                    <div
                        aria-hidden="true"
                        className={'flex h-11 w-11 aspect-square shrink-0 items-center justify-center overflow-hidden rounded-full border border-border-strong outline outline-[3px] outline-surface-muted [outline-offset:1px] text-sm font-black [box-shadow:0_1px_2px_color-mix(in_srgb,var(--color-ink)_8%,transparent)] ' + avatarTone(selected?.participant?.name)}
                    >
                        {avatarInitial(selected?.participant?.name)}
                    </div>
                )}
                <div className="min-w-0 flex-1">
                    {role === 'buyer' && selected?.artist?.slug ? (
                        <Tooltip content={'مشاهده صفحه هنرمند ' + (selected.participant.name ?? '')}>
                            <Link
                                to={'/artists/' + selected.artist.slug}
                                dir="auto"
                                className="block w-fit max-w-full truncate text-sm font-extrabold leading-6 text-ink transition hover:text-terracotta-strong focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus sm:text-base"
                            >
                                {selected.participant.name ?? 'مشاهده هنرمند'}
                            </Link>
                        </Tooltip>
                    ) : (
                        <h2
                            dir="auto"
                            title={selected?.participant?.name ?? 'گفتگوی خصوصی'}
                            className="truncate text-sm font-extrabold leading-6 text-ink sm:text-base"
                        >
                            {selected?.participant?.name ?? 'گفتگوی خصوصی'}
                        </h2>
                    )}
                    <p className="truncate text-[11px] leading-5 text-muted">گفتگوی خصوصی مستقیم</p>
                </div>
                <DropdownMenu.Root dir="rtl" open={openPopover === 'conversation'} onOpenChange={onPopoverOpenChange}>
                    <Tooltip content="گزینه‌های بیشتر">
                        <DropdownMenu.Trigger asChild>
                            <Button variant="ghost"
                                type="button"
                                aria-label="گزینه‌های بیشتر گفتگو"
                                className="min-h-0 p-0 flex h-10 w-10 items-center justify-center rounded-full border border-transparent bg-surface-muted text-muted transition-colors hover:border-border-strong hover:bg-surface hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus motion-reduce:transition-none"
                            >
                                <MoreVertical size={19} aria-hidden="true" />
                            </Button>
                        </DropdownMenu.Trigger>
                    </Tooltip>
                    <DropdownMenu.Portal>
                        <DropdownMenu.Content
                            dir="rtl"
                            side="bottom"
                            align="end"
                            sideOffset={8}
                            collisionPadding={8}
                            className="z-[60] max-h-[min(20rem,var(--radix-dropdown-menu-content-available-height))] min-w-52 max-w-[calc(100vw-1rem)] overflow-y-auto rounded-lg border border-border bg-paper p-1 shadow-soft"
                        >
                            <DropdownMenu.Item
                                onSelect={onReportConversation}
                                className="flex min-h-10 cursor-pointer items-center gap-2.5 rounded-md px-3 text-start text-xs font-semibold text-ink outline-none transition-colors data-[highlighted]:bg-surface-muted motion-reduce:transition-none"
                            >
                                <Flag size={15} className="shrink-0 text-muted" aria-hidden="true" />
                                <span>گزارش گفتگو</span>
                            </DropdownMenu.Item>
                            <DropdownMenu.Item
                                onSelect={onToggleBlock}
                                className="flex min-h-10 cursor-pointer items-center gap-2.5 rounded-md px-3 text-start text-xs font-semibold text-danger outline-none transition-colors data-[highlighted]:bg-danger-surface motion-reduce:transition-none"
                            >
                                {safety.blocked_by_me ? (
                                    <ShieldCheck size={15} className="shrink-0" aria-hidden="true" />
                                ) : (
                                    <Ban size={15} className="shrink-0" aria-hidden="true" />
                                )}
                                <span>{safety.blocked_by_me ? 'رفع مسدودسازی کاربر' : 'مسدودسازی کاربر'}</span>
                            </DropdownMenu.Item>
                        </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                </DropdownMenu.Root>
            </div>
            {children}
        </header>
    );
}
