import { Skeleton } from '../../../shared/ui';
export function ConversationInboxSkeleton({ count = 6, className = '', announce = true }) {
    return (
        <div
            role={announce ? 'status' : undefined}
            aria-live={announce ? 'polite' : undefined}
            aria-busy={announce ? 'true' : undefined}
            aria-label={announce ? 'در حال دریافت گفتگوها' : undefined}
            aria-hidden={announce ? undefined : 'true'}
            className={`min-h-0 flex-1 ${className}`}
        >
            <ul
                aria-hidden="true"
               
                className="min-h-0 h-full divide-y divide-border overflow-y-auto overscroll-contain [scrollbar-width:thin] [scrollbar-color:var(--color-border-strong)_transparent]"
            >
                {Array.from({ length: count }, (_, index) => (
                    <li key={index} className="relative min-w-0">
                        <div className="flex min-h-[4.25rem] items-center gap-2 px-3 py-2 pe-12">
                            <Skeleton className="h-10 w-10 shrink-0 " />
                            <div className="grid min-w-0 flex-1 gap-1.5">
                                <div className="flex items-center justify-between gap-2">
                                    <Skeleton className="h-4 w-2/5 " />
                                    <Skeleton className="h-5 w-5 shrink-0 " />
                                </div>
                                <Skeleton className="h-3 w-4/5 " />
                                <Skeleton className="h-2.5 w-16 " />
                            </div>
                        </div>
                        <Skeleton className="absolute end-2 top-1/2 h-7 w-7 -translate-y-1/2 " />
                    </li>
                ))}
            </ul>
        </div>
    );
}

export function MessageHistorySkeleton({ count = 5, className = '', announce = true }) {
    return (
        <div
            role={announce ? 'status' : undefined}
            aria-live={announce ? 'polite' : undefined}
            aria-busy={announce ? 'true' : undefined}
            aria-label={announce ? 'در حال دریافت پیام‌ها' : undefined}
            aria-hidden={announce ? undefined : 'true'}
           
            className={`grid content-end gap-5 p-4 sm:p-6 ${className}`}
        >
            {Array.from({ length: count }, (_, index) => {
                const own = index % 2 === 1;
                return (
                    <div key={index} className={`flex ${own ? 'justify-start' : 'justify-end'}`}>
                        <div className={`grid w-[min(78%,28rem)] gap-2  border border-border p-4 ${own ? 'bg-[var(--color-message-own)]' : 'bg-[var(--color-message-peer)]'}`}>
                            <Skeleton className={`h-3 ${index % 2 ? 'w-4/5' : 'w-full'} `} />
                            <Skeleton className="h-3 w-3/5 " />
                            <Skeleton className="h-2 w-12 justify-self-start " />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export function NotificationListSkeleton({ count = 3 }) {
    return (
        <div role="status" aria-live="polite" aria-busy="true" aria-label="در حال دریافت اعلان‌ها" className="divide-y divide-border">
            {Array.from({ length: count }, (_, index) => <div key={index} className="flex items-start gap-2 py-3"><Skeleton className="mt-1 h-2 w-2 shrink-0 " /><div className="grid min-w-0 flex-1 gap-2"><Skeleton className="h-4 w-4/5 " /><Skeleton className="h-3 w-1/3 " /></div></div>)}
        </div>
    );
}
