import { Skeleton } from './feedback';
import { Container, Section } from './layout';

export function ArtworkCardSkeleton({ className = '' }) {
    return (
        <article aria-hidden="true" className={`group min-w-0 ${className}`}>
            <div className="relative overflow-hidden bg-[linear-gradient(145deg,var(--color-surface-muted),var(--color-paper))]">
                <Skeleton className="aspect-[3/4] w-full " />
                <span aria-hidden="true" className="pointer-events-none absolute inset-0 border border-[color:color-mix(in_srgb,var(--color-ink)_5%,transparent)]" />
            </div>
            <div className="grid gap-1.5 border-b border-border px-0.5 pb-4 pt-4">
                <div className="flex min-h-5 items-center justify-between gap-3"><Skeleton className="h-3 w-20 " /><Skeleton className="h-3 w-3 " /></div>
                <div className="grid gap-1.5"><Skeleton className="h-5 w-4/5 " /><Skeleton className="h-5 w-3/5 " /></div>
                <Skeleton className="mt-1 h-4 w-2/5 " />
                <Skeleton className="mt-1 h-4 w-1/3 " />
            </div>
        </article>
    );
}

export function ArtistCardSkeleton({ className = '' }) {
    return (
        <article aria-hidden="true" className={`grid min-w-0 content-start gap-3 border-y border-border bg-transparent py-5 sm:py-6 ${className}`} dir="rtl">
            <div className="flex items-start justify-between gap-4">
                <Skeleton className="h-16 w-16 shrink-0 " />
                <Skeleton className="mt-1 h-3 w-24 " />
            </div>
            <div className="mt-2 grid gap-2"><Skeleton className="h-7 w-2/3 " /><Skeleton className="h-3 w-1/3 " /></div>
            <div className="mt-1 grid gap-2"><Skeleton className="h-3 w-full " /><Skeleton className="h-3 w-11/12 " /><Skeleton className="h-3 w-3/4 " /></div>
            <div className="mt-3 flex items-center justify-between border-t border-border pt-4"><Skeleton className="h-4 w-28 " /><Skeleton className="h-3 w-3 " /></div>
        </article>
    );
}

export function FormFieldSkeleton({ className = '', controlClassName = 'h-11' }) {
    return (
        <div aria-hidden="true" className={`grid min-w-0 gap-2 ${className}`}>
            <Skeleton className="h-4 w-28 " />
            <Skeleton className={`w-full  ${controlClassName}`} />
        </div>
    );
}

export function ArtworkStudioListSkeleton({ count = 3, className = '', announce = true }) {
    return (
        <section
            role={announce ? 'status' : undefined}
            aria-live={announce ? 'polite' : undefined}
            aria-busy={announce ? 'true' : undefined}
            aria-label={announce ? 'در حال دریافت آثار هنرمند' : undefined}
            aria-hidden={announce ? undefined : 'true'}
            className={`grid gap-4 sm:grid-cols-2 xl:grid-cols-3 ${className}`}
        >
            {Array.from({ length: count }, (_, index) => (
                <article key={index} className="min-w-0 overflow-hidden border-y border-border bg-transparent">
                    <div className="flex aspect-[3/4] items-center justify-center bg-surface-muted p-3">
                        <Skeleton className="h-full w-full " />
                    </div>
                    <div className="space-y-3 p-4">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                            <Skeleton className="h-5 w-2/3 " />
                            <Skeleton className="h-6 w-20 " />
                        </div>
                        <Skeleton className="h-3 w-1/3 " />
                        <div className="grid gap-2">
                            <Skeleton className="h-3 w-full " />
                            <Skeleton className="h-3 w-4/5 " />
                        </div>
                        <Skeleton className="h-9 w-28 " />
                    </div>
                </article>
            ))}
        </section>
    );
}

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
                dir="rtl"
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
            dir="rtl"
            className={`grid content-end gap-5 p-4 sm:p-6 ${className}`}
        >
            {Array.from({ length: count }, (_, index) => {
                const own = index % 2 === 1;
                return (
                    <div key={index} dir="rtl" className={`flex ${own ? 'justify-start' : 'justify-end'}`}>
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

export function AdminRecordListSkeleton({ count = 5, columns = 3, className = '' }) {
    return (
        <div role="status" aria-live="polite" aria-busy="true" aria-label="در حال دریافت فهرست مدیریت" className={`overflow-hidden border-y border-border bg-transparent ${className}`}>
            <div className="flex items-center justify-between gap-4 border-b border-border p-5"><Skeleton className="h-6 w-40 " /><Skeleton className="h-9 w-28 " /></div>
            <div className="grid gap-0 px-5">
                {Array.from({ length: count }, (_, index) => <div key={index} className="grid items-center gap-3 border-b border-border py-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: columns }, (_, cell) => <Skeleton key={cell} className={cell === 0 ? 'h-5 w-4/5 ' : 'h-4 w-3/4 '} />)}</div>)}
            </div>
        </div>
    );
}

export function DashboardMetricSkeleton({ count = 4, className = '', announce = true }) {
    return (
        <div
            role={announce ? 'status' : undefined}
            aria-live={announce ? 'polite' : undefined}
            aria-busy={announce ? 'true' : undefined}
            aria-label={announce ? 'در حال دریافت شاخص‌ها' : undefined}
            aria-hidden={announce ? undefined : 'true'}
            className={`grid gap-3 sm:grid-cols-2 ${count === 3 ? 'xl:grid-cols-3' : 'xl:grid-cols-4'} ${className}`}
        >
            {Array.from({ length: count }, (_, index) => (
                <article key={index} className="grid min-h-32 content-between gap-4 border-y border-border bg-transparent p-5">
                    <div className="flex items-center justify-between gap-3"><Skeleton className="h-4 w-28 " /><Skeleton className="h-3 w-16 " /></div>
                    <Skeleton className="h-8 w-2/5 " />
                    <Skeleton className="h-3 w-4/5 " />
                </article>
            ))}
        </div>
    );
}

export function ArtistRecentWorkSkeleton({ announce = true }) {
    return (
        <div
            role={announce ? 'status' : undefined}
            aria-live={announce ? 'polite' : undefined}
            aria-busy={announce ? 'true' : undefined}
            aria-label={announce ? 'در حال دریافت آثار اخیر' : undefined}
            aria-hidden={announce ? undefined : 'true'}
        >
            <ul aria-hidden="true" className="divide-y divide-border">
                {[0, 1, 2, 3].map((item) => (
                    <li key={item} className="flex items-center justify-between gap-3 py-4">
                        <div className="grid min-w-0 flex-1 gap-2"><Skeleton className="h-4 w-2/3 " /><Skeleton className="h-3 w-1/3 " /></div>
                        <Skeleton className="h-6 w-20 shrink-0 " />
                    </li>
                ))}
            </ul>
        </div>
    );
}
export function AdminDashboardSkeleton() {
    return (
        <div role="status" aria-live="polite" aria-busy="true" aria-label="در حال دریافت پنل مدیریت" className="w-full grid gap-8" dir="rtl">
            <Section as="header" bleed className="overflow-hidden border-y border-divider-section bg-ink"><Container width="wide" className="grid gap-4 p-6 sm:p-8">
                <Skeleton className="h-3 w-28 " />
                <Skeleton className="h-9 w-2/3 max-w-xl  sm:h-11" />
                <div className="grid max-w-3xl gap-2"><Skeleton className="h-3 w-full " /><Skeleton className="h-3 w-4/5 " /></div>
                <Skeleton className="h-11 w-40 " />
            </Container></Section>
            <Container width="wide" className="grid gap-8">
            <DashboardMetricSkeleton count={3} announce={false} />
            <section className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(18rem,.8fr)]">
                <div className="border-y border-border bg-transparent py-5 sm:p-7">
                    <div className="grid gap-2 border-b border-border pb-4"><Skeleton className="h-3 w-24 " /><Skeleton className="h-6 w-40 " /></div>
                    <div className="mt-5 grid gap-5 sm:grid-cols-[8rem_minmax(0,1fr)]">
                        <Skeleton className="aspect-square w-full  sm:max-w-32" />
                        <div className="grid content-start gap-3"><Skeleton className="h-6 w-24 " /><Skeleton className="h-5 w-2/3 " /><Skeleton className="h-3 w-1/2 " /><Skeleton className="mt-2 h-4 w-36 " /></div>
                    </div>
                </div>
                <aside className="border-y border-border bg-surface-muted px-5 py-5 sm:py-7">
                    <div className="grid gap-2"><Skeleton className="h-3 w-24 " /><Skeleton className="h-6 w-2/3 " /></div>
                    <div className="mt-3 grid gap-2"><Skeleton className="h-3 w-full " /><Skeleton className="h-3 w-5/6 " /><Skeleton className="h-3 w-4/5 " /></div>
                    <Skeleton className="mt-5 h-11 w-40 " />
                </aside>
            </section>
            <section>
                <div className="grid gap-2"><Skeleton className="h-3 w-24 " /><Skeleton className="h-6 w-40 " /></div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {[0, 1, 2, 3].map((item) => (
                        <article key={item} className="grid min-h-44 content-start gap-4 border border-border bg-paper p-5">
                            <div className="flex items-center justify-between gap-3"><Skeleton className="h-10 w-10 " /><Skeleton className="h-3 w-20 " /></div>
                            <Skeleton className="h-5 w-2/3 " /><Skeleton className="h-3 w-full " /><Skeleton className="h-3 w-4/5 " /><Skeleton className="mt-2 h-3 w-24 " />
                        </article>
                    ))}
                </div>
            </section>
        </Container></div>
    );
}

export function ArtworkModerationSkeleton({ count = 4, announce = true }) {
    return (
        <div role={announce ? 'status' : undefined} aria-live={announce ? 'polite' : undefined} aria-busy={announce ? 'true' : undefined} aria-label={announce ? 'در حال دریافت آثار برای بررسی' : undefined} aria-hidden={announce ? undefined : 'true'} className="grid gap-4 xl:grid-cols-2">
            {Array.from({ length: count }, (_, index) => <article key={index} className="overflow-hidden border border-border bg-paper">
                <div className="grid sm:grid-cols-[minmax(0,.85fr)_minmax(0,1.15fr)]">
                    <Skeleton className="h-56 w-full  sm:h-full sm:min-h-64" />
                    <div className="grid content-start gap-3 p-5"><div className="flex items-start justify-between gap-3"><Skeleton className="h-5 w-2/3 " /><Skeleton className="h-6 w-20 " /></div><Skeleton className="h-3 w-1/2 " /><div className="grid grid-cols-2 gap-3"><Skeleton className="h-8 w-full " /><Skeleton className="h-8 w-full " /><Skeleton className="h-8 w-full " /><Skeleton className="h-8 w-full " /></div><div className="grid gap-2"><Skeleton className="h-3 w-full " /><Skeleton className="h-3 w-11/12 " /><Skeleton className="h-3 w-4/5 " /></div></div>
                </div>
                <div className="grid gap-3 border-t border-border p-5"><Skeleton className="h-4 w-36 " /><Skeleton className="h-20 w-full " /><div className="flex gap-2"><Skeleton className="h-9 w-24 " /><Skeleton className="h-9 w-24 " /><Skeleton className="h-9 w-20 " /></div></div>
            </article>)}
        </div>
    );
}

export function WorkspaceIdentitySkeleton({ announce = true }) {
    return (
        <section
            role={announce ? 'status' : undefined}
            aria-live={announce ? 'polite' : undefined}
            aria-busy={announce ? 'true' : undefined}
            aria-label={announce ? 'در حال دریافت اطلاعات پروفایل هنرمند' : undefined}
            aria-hidden={announce ? undefined : 'true'}
            className="grid gap-5 border-y border-divider-section bg-transparent py-6 sm:py-7 lg:grid-cols-[1fr_15rem] lg:items-center"
        >
            <div className="grid gap-3">
                <div className="flex items-center gap-3"><Skeleton className="h-3 w-24 " /><Skeleton className="h-6 w-24 " /></div>
                <Skeleton className="h-7 w-2/3 max-w-sm " />
                <Skeleton className="h-4 w-full max-w-2xl " />
                <Skeleton className="h-4 w-4/5 max-w-xl " />
                <div className="mt-2 flex gap-3"><Skeleton className="h-10 w-32 " /><Skeleton className="h-10 w-28 " /></div>
            </div>
            <div className="grid justify-items-center gap-3 border-t border-border pt-5 lg:border-r lg:border-t-0 lg:pt-0">
                <Skeleton className="h-3 w-20 " /><Skeleton className="h-10 w-20 " /><Skeleton className="h-1.5 w-full " />
            </div>
        </section>
    );
}

export function MessageReportsSkeleton({ count = 3, announce = true }) {
    return (
        <div
            role={announce ? 'status' : undefined}
            aria-live={announce ? 'polite' : undefined}
            aria-busy={announce ? 'true' : undefined}
            aria-label={announce ? 'در حال دریافت گزارش‌های پیام' : undefined}
            aria-hidden={announce ? undefined : 'true'}
            className="grid gap-4"
        >
            {Array.from({ length: count }, (_, index) => (
                <article key={index} className="overflow-hidden border border-border bg-paper">
                    <div className="flex items-start justify-between gap-3 border-b border-border bg-surface-muted p-4 sm:p-5">
                        <div className="grid flex-1 gap-2"><Skeleton className="h-3 w-24 " /><Skeleton className="h-5 w-2/3 " /><Skeleton className="h-3 w-1/2 " /></div>
                        <Skeleton className="h-6 w-24 " />
                    </div>
                    <div className="grid gap-3 p-5">
                        <Skeleton className="h-4 w-28 " /><Skeleton className="h-16 w-full " />
                        <Skeleton className="h-4 w-36 " /><Skeleton className="h-20 w-full " />
                        <Skeleton className="h-11 w-full " />
                        <div className="flex flex-wrap gap-2"><Skeleton className="h-9 w-24 " /><Skeleton className="h-9 w-24 " /></div>
                    </div>
                </article>
            ))}
        </div>
    );
}

export function AdminUserCardsSkeleton({ count = 4, announce = true }) {
    return (
        <div role={announce ? 'status' : undefined} aria-live={announce ? 'polite' : undefined} aria-busy={announce ? 'true' : undefined} aria-label={announce ? 'در حال دریافت کاربران' : undefined} aria-hidden={announce ? undefined : 'true'} className="grid gap-3 xl:grid-cols-2">
            {Array.from({ length: count }, (_, index) => <article key={index} className="grid gap-4 border-y border-border bg-transparent py-5"><div className="flex items-start justify-between gap-3"><div className="grid min-w-0 flex-1 gap-2"><Skeleton className="h-5 w-2/3 " /><Skeleton className="h-3 w-4/5 " /></div><Skeleton className="h-6 w-20 " /></div><div className="grid gap-2 border-t border-border pt-4"><Skeleton className="h-4 w-28 " /><Skeleton className="h-11 w-full " /><Skeleton className="h-3 w-3/4 " /><div className="flex gap-2"><Skeleton className="h-9 w-24 " /><Skeleton className="h-9 w-24 " /></div></div></article>)}
        </div>
    );
}

export function CollectionCardSkeleton({ count = 3, announce = true }) {
    return (
        <div
            role={announce ? 'status' : undefined}
            aria-live={announce ? 'polite' : undefined}
            aria-busy={announce ? 'true' : undefined}
            aria-label={announce ? 'در حال دریافت مجموعه‌ها' : undefined}
            aria-hidden={announce ? undefined : 'true'}
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
            {Array.from({ length: count }, (_, index) => (
                <article key={index} className="grid content-start gap-3 border-y border-border bg-transparent py-6">
                    <Skeleton className="h-3 w-24 " /><Skeleton className="mt-1 h-7 w-4/5 " />
                    <div className="mt-1 grid gap-2"><Skeleton className="h-3 w-full " /><Skeleton className="h-3 w-full " /><Skeleton className="h-3 w-11/12 " /><Skeleton className="h-3 w-4/5 " /></div>
                    <Skeleton className="mt-3 h-4 w-28 " />
                </article>
            ))}
        </div>
    );
}

export function AdminEditorialSkeleton({ announce = true }) {
    return (
        <div role={announce ? 'status' : undefined} aria-live={announce ? 'polite' : undefined} aria-busy={announce ? 'true' : undefined} aria-label={announce ? 'در حال دریافت محتوای سردبیری' : undefined} aria-hidden={announce ? undefined : 'true'} className="grid gap-8">
            <section className="grid gap-4 border-y border-divider-section bg-transparent py-5 sm:py-7">
                <Skeleton className="h-7 w-44 " />
                <div className="grid gap-2"><Skeleton className="h-4 w-28 " /><Skeleton className="h-11 w-full " /></div>
                <div className="grid gap-2"><Skeleton className="h-4 w-32 " /><Skeleton className="h-28 w-full " /><Skeleton className="h-3 w-2/3 " /></div>
                <div className="grid gap-2"><Skeleton className="h-4 w-48 " /><div className="grid max-h-72 gap-3 overflow-hidden border border-border p-3">{[0, 1, 2, 3, 4, 5].map((item) => <div key={item} className="flex items-center gap-3"><Skeleton className="h-4 w-4 " /><div className="grid flex-1 gap-2"><Skeleton className="h-4 w-2/3 " /><Skeleton className="h-3 w-1/3 " /></div></div>)}</div></div>
                <div className="flex gap-2"><Skeleton className="h-10 w-32 " /><Skeleton className="h-10 w-32 " /></div>
            </section>
            <section className="grid gap-4"><div className="flex items-center justify-between gap-3"><Skeleton className="h-6 w-40 " /><Skeleton className="h-9 w-28 " /></div>{[0, 1, 2].map((item) => <article key={item} className="grid gap-4 border border-border bg-paper p-5"><div className="flex items-start justify-between gap-3"><div className="grid flex-1 gap-2"><Skeleton className="h-5 w-2/3 " /><Skeleton className="h-3 w-1/3 " /><Skeleton className="h-3 w-1/2 " /></div><Skeleton className="h-4 w-16 " /></div><div className="flex flex-wrap gap-2 border-t border-border pt-4"><Skeleton className="h-9 w-24 " /><Skeleton className="h-9 w-24 " /><Skeleton className="h-9 w-24 " /><Skeleton className="h-9 w-24 " /></div></article>)}</section>
            <section className="grid gap-4 border-y border-divider-section bg-transparent py-5 sm:py-7"><Skeleton className="h-6 w-40 " /><Skeleton className="h-4 w-full max-w-xl " /><div className="grid gap-3 sm:grid-cols-2">{[0, 1, 2, 3].map((item) => <div key={item} className="grid gap-3 border border-border p-3"><div className="flex items-center gap-3"><Skeleton className="h-4 w-4 " /><Skeleton className="h-4 w-2/3 " /></div><Skeleton className="h-10 w-full " /></div>)}</div><Skeleton className="h-10 w-40 " /></section>
        </div>
    );
}

export function CollectionDetailSkeleton() {
    return (
        <Container as="div" width="wide" className="min-h-[65vh] py-12" dir="rtl" role="status" aria-busy="true" aria-label="در حال دریافت مجموعه منتخب">
            <span className="sr-only">در حال دریافت مجموعه منتخب…</span>
            <nav aria-hidden="true" className="flex items-center gap-2"><Skeleton className="h-3 w-10 " /><Skeleton className="h-3 w-2 " /><Skeleton className="h-3 w-20 " /></nav>
            <header className="mt-7 max-w-3xl border-b border-border pb-8"><Skeleton className="h-3 w-28 " /><Skeleton className="mt-3 h-10 w-2/3 " /><div className="mt-5 grid gap-2"><Skeleton className="h-3 w-full " /><Skeleton className="h-3 w-full " /><Skeleton className="h-3 w-4/5 " /></div></header>
            <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2, 3, 4, 5].map((item) => <ArtworkCardSkeleton key={item} />)}</div>
        </Container>
    );
}

export function NotificationListSkeleton({ count = 3 }) {
    return (
        <div role="status" aria-live="polite" aria-busy="true" aria-label="در حال دریافت اعلان‌ها" className="divide-y divide-border">
            {Array.from({ length: count }, (_, index) => <div key={index} className="flex items-start gap-2 py-3"><Skeleton className="mt-1 h-2 w-2 shrink-0 " /><div className="grid min-w-0 flex-1 gap-2"><Skeleton className="h-4 w-4/5 " /><Skeleton className="h-3 w-1/3 " /></div></div>)}
        </div>
    );
}

export function ArtistWorkspaceOverviewSkeleton() {
    return (
        <div role="status" aria-live="polite" aria-busy="true" aria-label="در حال آماده‌سازی فضای هنرمند" className="w-full grid gap-8" dir="rtl">
            <Section as="header" bleed className="overflow-hidden border-y border-divider-section bg-ink"><Container width="wide" className="grid gap-4 p-6 sm:p-8">
                <Skeleton className="h-3 w-36 " />
                <Skeleton className="h-9 w-2/3 max-w-xl  sm:h-11" />
                <div className="grid max-w-3xl gap-2"><Skeleton className="h-3 w-full " /><Skeleton className="h-3 w-4/5 " /></div>
                <Skeleton className="h-11 w-40 " />
            </Container></Section>
            <Container width="wide">
            <WorkspaceIdentitySkeleton announce={false} />
            </Container>
        </div>
    );
}
export function BuyerDashboardSkeleton() {
    return (
        <div role="status" aria-live="polite" aria-busy="true" aria-label="در حال آماده‌سازی فضای خریدار" className="w-full grid gap-7" dir="rtl">
            <Section as="header" bleed className="overflow-hidden border-y border-divider-section bg-ink"><Container width="wide" className="grid gap-4 p-6 sm:p-8">
                <Skeleton className="h-3 w-36 " />
                <Skeleton className="h-9 w-full max-w-2xl  sm:h-11" />
                <div className="grid max-w-3xl gap-2"><Skeleton className="h-3 w-full " /><Skeleton className="h-3 w-4/5 " /></div>
                <div className="flex flex-wrap gap-3"><Skeleton className="h-11 w-36 " /><Skeleton className="h-11 w-40 " /></div>
            </Container></Section>
            <Container width="wide" className="grid gap-7">
            <section className="border-y border-divider-section bg-transparent py-5 sm:py-7">
                <div className="flex items-start justify-between gap-4"><div className="grid min-w-0 flex-1 gap-2"><Skeleton className="h-3 w-28 " /><Skeleton className="h-6 w-40 " /><Skeleton className="h-3 w-full max-w-2xl " /><Skeleton className="h-3 w-4/5 max-w-xl " /></div><Skeleton className="h-12 w-12 shrink-0 " /></div>
                <Skeleton className="mt-6 h-11 w-40 " />
            </section>
            <section className="border-t border-border pt-6">
                <div className="grid gap-2"><Skeleton className="h-3 w-36 " /><Skeleton className="h-6 w-48 " /><Skeleton className="h-3 w-full max-w-2xl " /></div>
                <div className="mt-5 grid gap-4 md:grid-cols-3">
                    {[0, 1, 2].map((item) => <article key={item} className="grid gap-3 border-t border-divider-group bg-transparent pt-4"><Skeleton className="h-3 w-24 " /><Skeleton className="h-5 w-3/4 " /><Skeleton className="h-3 w-full " /><Skeleton className="h-3 w-5/6 " /></article>)}
                </div>
            </section>
        </Container></div>
    );
}

export function HomePageSkeleton() {
    return (
        <div role="status" aria-live="polite" aria-busy="true" aria-label="در حال آماده‌سازی صفحه اصلی" className="w-full overflow-hidden">
            <Container as="section" width="wide" className="grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-[1fr_.9fr] lg:gap-16 lg:py-24">
                <div className="grid max-w-2xl content-center gap-5"><Skeleton className="h-4 w-56 " /><Skeleton className="h-12 w-11/12  sm:h-14" /><Skeleton className="h-12 w-3/4  sm:h-14" /><div className="mt-2 grid gap-2"><Skeleton className="h-4 w-full max-w-xl " /><Skeleton className="h-4 w-4/5 " /></div><div className="mt-4 flex flex-wrap gap-3"><Skeleton className="h-12 w-40 " /><Skeleton className="h-12 w-36 " /></div><Skeleton className="mt-2 h-3 w-64 " /></div>
                <div className="relative mx-auto w-full max-w-xl lg:me-0"><Skeleton className="aspect-[3/4] w-full " /><div className="flex items-center justify-between gap-4 px-2 py-4"><div className="grid flex-1 gap-2"><Skeleton className="h-3 w-20 " /><Skeleton className="h-5 w-2/3 " /><Skeleton className="h-3 w-1/3 " /></div><Skeleton className="h-4 w-24 " /></div></div>
            </Container>
            <section className="border-y border-border bg-surface-muted"><Container className="grid gap-8 py-12 sm:grid-cols-3">{[0, 1, 2].map((item) => <div key={item} className="grid content-start gap-3"><Skeleton className="h-3 w-24 " /><Skeleton className="h-6 w-3/4 " /><Skeleton className="h-3 w-full " /><Skeleton className="h-3 w-11/12 " /><Skeleton className="h-3 w-4/5 " /></div>)}</Container></section>
            <Container as="section" width="wide" className="py-16"><div className="grid gap-3 border-b border-border pb-5"><Skeleton className="h-3 w-24 " /><Skeleton className="h-8 w-48 " /><Skeleton className="h-3 w-64 max-w-full " /></div><div className="mt-8 grid gap-x-5 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2, 3, 4, 5].map((item) => <ArtworkCardSkeleton key={item} />)}</div></Container>
            <section className="border-y border-border bg-paper"><Container className="py-14"><Skeleton className="h-3 w-28 " /><Skeleton className="mt-2 h-7 w-52 " /><div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[0, 1, 2, 3, 4, 5, 6, 7].map((item) => <Skeleton key={item} className="h-24 w-full " />)}</div></Container></section>
            <Container as="section" width="wide" className="py-16"><div className="flex items-end justify-between gap-4 border-b border-border pb-5"><div className="grid gap-2"><Skeleton className="h-3 w-24 " /><Skeleton className="h-8 w-52 " /><Skeleton className="h-3 w-64 max-w-full " /></div><Skeleton className="h-4 w-20 " /></div><div className="mt-8 grid gap-4 sm:grid-cols-3">{[0, 1, 2].map((item) => <ArtistCardSkeleton key={item} />)}</div></Container>
            <section className="border-y border-border bg-surface-muted"><Container className="py-14"><Skeleton className="h-7 w-48 " /><div className="mt-6 grid gap-4 sm:grid-cols-3">{[0, 1, 2].map((item) => <div key={item} className="grid gap-3 border border-border bg-paper p-5"><Skeleton className="h-3 w-20 " /><Skeleton className="h-5 w-4/5 " /><Skeleton className="h-3 w-full " /><Skeleton className="h-3 w-4/5 " /></div>)}</div></Container></section>
            <section className="bg-ink"><Container className="flex flex-col items-start justify-between gap-6 py-14 md:flex-row md:items-center"><div className="grid flex-1 gap-3"><Skeleton className="h-3 w-24 " /><Skeleton className="h-8 w-2/3 max-w-lg " /><Skeleton className="h-3 w-full max-w-2xl " /><Skeleton className="h-3 w-4/5 " /></div><Skeleton className="h-12 w-40 " /></Container></section>
        </div>
    );
}

export function ArtworkDetailSkeleton() {
    return (
        <Container as="div" width="wide" className="min-h-[65vh] py-10 lg:py-14" dir="rtl" role="status" aria-busy="true" aria-label="در حال دریافت اثر هنری">
            <span className="sr-only">در حال دریافت اثر هنری…</span>
            <nav aria-hidden="true" className="flex items-center gap-2"><Skeleton className="h-3 w-10 " /><Skeleton className="h-3 w-2 " /><Skeleton className="h-3 w-20 " /><Skeleton className="h-3 w-2 " /><Skeleton className="h-3 w-16 " /></nav>
            <article className="mt-7 grid items-start gap-8 lg:grid-cols-[1.15fr_.85fr] lg:gap-10">
                <div className="flex aspect-[3/4] items-center justify-center overflow-hidden border border-border bg-surface-muted p-3 sm:p-6 lg:aspect-[3/4] lg:p-8"><Skeleton className="h-full w-full " /></div>
                <div className="border-y border-border bg-transparent py-6 sm:py-9 lg:sticky lg:top-28 lg:border-y-0 lg:py-2">
                    <Skeleton className="h-4 w-24 " />
                    <Skeleton className="mt-3 h-10 w-4/5 max-w-md  sm:h-12" />
                    <Skeleton className="mt-3 h-4 w-2/5 " />
                    <div className="mt-7 grid gap-2"><Skeleton className="h-3 w-full " /><Skeleton className="h-3 w-full " /><Skeleton className="h-3 w-11/12 " /><Skeleton className="h-3 w-4/5 " /></div>
                    <dl className="mt-7 grid grid-cols-2 gap-x-5 gap-y-6 border-y border-border py-6">{[0, 1, 2, 3].map((item) => <div key={item} className="grid gap-2"><Skeleton className="h-3 w-2/3 " /><Skeleton className="h-4 w-4/5 " /></div>)}</dl>
                    <Skeleton className="mt-5 h-4 w-2/3 " />
                    <Skeleton className="mt-7 h-12 w-52 " />
                </div>
            </article>
        </Container>
    );
}

export function ArtistProfileSkeleton() {
    return (
        <Container as="div" width="wide" className="min-h-[65vh] pb-16 pt-8 sm:pt-12" dir="rtl" role="status" aria-busy="true" aria-label="در حال دریافت پروفایل هنرمند">
            <span className="sr-only">در حال دریافت پروفایل هنرمند…</span>
            <nav aria-hidden="true" className="flex items-center gap-2"><Skeleton className="h-3 w-10 " /><Skeleton className="h-3 w-2 " /><Skeleton className="h-3 w-16 " /><Skeleton className="h-3 w-2 " /><Skeleton className="h-3 w-24 " /></nav>
            <section className="relative mt-6 overflow-hidden border-y border-divider-section bg-paper">
                <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5 bg-terracotta" />
                <div className="grid lg:grid-cols-[minmax(0,1fr)_18rem]">
                    <div className="relative px-6 pb-8 pt-9 sm:px-10 sm:pb-10 sm:pt-12 lg:px-12">
                        <Skeleton className="h-3 w-24 " />
                        <Skeleton className="mt-4 h-11 w-2/3 max-w-lg  sm:h-14" />
                        <Skeleton className="mt-4 h-4 w-24 " />
                        <div className="mt-7 grid max-w-3xl gap-2 border-r-2 border-sand pr-5"><Skeleton className="h-3 w-full " /><Skeleton className="h-3 w-full " /><Skeleton className="h-3 w-11/12 " /><Skeleton className="h-3 w-4/5 " /></div>
                        <div className="mt-7 flex gap-5"><Skeleton className="h-4 w-24 " /><Skeleton className="h-4 w-28 " /></div>
                    </div>
                    <aside className="grid content-between gap-6 border-t border-border bg-surface-muted p-6 sm:p-8 lg:border-r lg:border-t-0">
                        <div><Skeleton className="h-3 w-28 " /><Skeleton className="mt-3 h-9 w-20 " /><Skeleton className="mt-2 h-3 w-32 " /></div>
                        <Skeleton className="h-12 w-full " />
                    </aside>
                </div>
            </section>
            <section className="mt-12">
                <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5"><div className="grid gap-2"><Skeleton className="h-3 w-24 " /><Skeleton className="h-8 w-44 " /><Skeleton className="h-3 w-64 max-w-full " /></div><Skeleton className="h-3 w-24 " /></div>
                <div className="mt-6 flex gap-2"><Skeleton className="h-10 w-24 " /><Skeleton className="h-10 w-20 " /><Skeleton className="h-10 w-28 " /></div>
                <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{[0, 1, 2, 3, 4, 5, 6, 7].map((item) => <ArtworkCardSkeleton key={item} />)}</div>
            </section>
        </Container>
    );
}
