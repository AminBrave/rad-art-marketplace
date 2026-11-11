import { Skeleton } from './feedback';
import { PageContainer } from './primitives';

export function ArtworkCardSkeleton({ className = '' }) {
    return (
        <article aria-hidden="true" className={`group min-w-0 ${className}`}>
            <div className="relative overflow-hidden bg-surface-muted">
                <Skeleton className="aspect-[4/5] w-full rounded-none" />
                <span aria-hidden="true" className="pointer-events-none absolute inset-0 border border-ink/5" />
            </div>
            <div className="grid gap-1.5 px-0.5 pb-2 pt-4">
                <div className="flex min-h-5 items-center justify-between gap-3"><Skeleton className="h-3 w-20 rounded-sm" /><Skeleton className="h-3 w-3 rounded-full" /></div>
                <div className="grid gap-1.5"><Skeleton className="h-5 w-4/5 rounded-sm" /><Skeleton className="h-5 w-3/5 rounded-sm" /></div>
                <Skeleton className="mt-1 h-4 w-2/5 rounded-sm" />
                <Skeleton className="mt-1 h-4 w-1/3 rounded-sm" />
            </div>
        </article>
    );
}

export function ArtistCardSkeleton({ className = '' }) {
    return (
        <article aria-hidden="true" className={`grid min-w-0 content-start gap-3 border border-border bg-paper p-5 sm:p-6 ${className}`} dir="rtl">
            <div className="flex items-start justify-between gap-4">
                <Skeleton className="h-14 w-14 shrink-0 rounded-full" />
                <Skeleton className="mt-1 h-3 w-24 rounded-sm" />
            </div>
            <div className="mt-2 grid gap-2"><Skeleton className="h-7 w-2/3 rounded-sm" /><Skeleton className="h-3 w-1/3 rounded-sm" /></div>
            <div className="mt-1 grid gap-2"><Skeleton className="h-3 w-full rounded-sm" /><Skeleton className="h-3 w-11/12 rounded-sm" /><Skeleton className="h-3 w-3/4 rounded-sm" /></div>
            <div className="mt-3 flex items-center justify-between border-t border-border pt-4"><Skeleton className="h-4 w-28 rounded-sm" /><Skeleton className="h-3 w-3 rounded-full" /></div>
        </article>
    );
}

export function FormFieldSkeleton({ className = '', controlClassName = 'h-11' }) {
    return (
        <div aria-hidden="true" className={`grid min-w-0 gap-2 ${className}`}>
            <Skeleton className="h-4 w-28 rounded-sm" />
            <Skeleton className={`w-full rounded-sm ${controlClassName}`} />
        </div>
    );
}

export function ArtworkStudioListSkeleton({ count = 3 }) {
    return (
        <section aria-hidden="true" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: count }, (_, index) => (
                <article key={index} className="min-w-0 overflow-hidden border border-border bg-paper">
                    <Skeleton className="aspect-[4/3] w-full rounded-none" />
                    <div className="grid gap-3 p-4">
                        <div className="flex items-start justify-between gap-3"><Skeleton className="h-5 w-2/3 rounded-sm" /><Skeleton className="h-6 w-20 rounded-full" /></div>
                        <Skeleton className="h-3 w-1/3 rounded-sm" />
                        <div className="grid gap-2"><Skeleton className="h-3 w-full rounded-sm" /><Skeleton className="h-3 w-11/12 rounded-sm" /><Skeleton className="h-3 w-4/5 rounded-sm" /></div>
                        <Skeleton className="h-9 w-28 rounded-sm" />
                    </div>
                </article>
            ))}
        </section>
    );
}

export function ConversationInboxSkeleton({ count = 6, className = '' }) {
    return (
        <div aria-hidden="true" className={`min-h-0 flex-1 divide-y divide-border overflow-hidden ${className}`}>
            {Array.from({ length: count }, (_, index) => <div key={index} className="flex items-center gap-3 px-4 py-4"><Skeleton className="h-11 w-11 shrink-0 rounded-full" /><div className="grid min-w-0 flex-1 gap-2"><div className="flex items-center justify-between gap-3"><Skeleton className="h-4 w-2/5 rounded-sm" /><Skeleton className="h-3 w-12 rounded-sm" /></div><Skeleton className="h-3 w-4/5 rounded-sm" /></div></div>)}
        </div>
    );
}

export function MessageHistorySkeleton({ count = 5, className = '' }) {
    return (
        <div aria-hidden="true" className={`grid content-end gap-5 p-4 sm:p-6 ${className}`}>
            {Array.from({ length: count }, (_, index) => {
                const own = index % 2 === 1;
                return <div key={index} className={`flex ${own ? 'justify-end' : 'justify-start'}`}><div className={`grid w-[min(78%,28rem)] gap-2 rounded-[20px] border border-border p-4 ${own ? 'bg-[var(--color-message-own)]' : 'bg-[var(--color-message-peer)]'}`}><Skeleton className={`h-3 ${index % 2 ? 'w-4/5' : 'w-full'} rounded-sm`} /><Skeleton className="h-3 w-3/5 rounded-sm" /><Skeleton className="h-2 w-12 justify-self-end rounded-sm" /></div></div>;
            })}
        </div>
    );
}

export function AdminRecordListSkeleton({ count = 5, className = '' }) {
    return (
        <div aria-hidden="true" className={`overflow-hidden border border-border bg-paper ${className}`}>
            <div className="flex items-center justify-between gap-4 border-b border-border p-5"><Skeleton className="h-6 w-40 rounded-sm" /><Skeleton className="h-9 w-28 rounded-sm" /></div>
            <div className="grid gap-0 px-5">
                {Array.from({ length: count }, (_, index) => <div key={index} className="grid items-center gap-3 border-b border-border py-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: columns }, (_, cell) => <Skeleton key={cell} className={cell === 0 ? 'h-5 w-4/5 rounded-sm' : 'h-4 w-3/4 rounded-sm'} />)}</div>)}
            </div>
        </div>
    );
}

export function DashboardMetricSkeleton({ count = 4, className = '' }) {
    return (
        <div aria-hidden="true" className={`grid gap-3 sm:grid-cols-2 ${count === 3 ? 'xl:grid-cols-3' : 'xl:grid-cols-4'} ${className}`}>
            {Array.from({ length: count }, (_, index) => <article key={index} className="grid min-h-32 content-between gap-4 border border-border bg-paper p-5"><div className="flex items-center justify-between gap-3"><Skeleton className="h-4 w-28 rounded-sm" /><Skeleton className="h-3 w-16 rounded-sm" /></div><Skeleton className="h-8 w-2/5 rounded-sm" /><Skeleton className="h-3 w-4/5 rounded-sm" /></article>)}
        </div>
    );
}

export function ArtistRecentWorkSkeleton() {
    return (
        <div aria-hidden="true" className="divide-y divide-border">
            {[0, 1, 2, 3].map((item) => <div key={item} className="flex items-center justify-between gap-3 py-4"><div className="grid min-w-0 flex-1 gap-2"><Skeleton className="h-4 w-2/3 rounded-sm" /><Skeleton className="h-3 w-1/3 rounded-sm" /></div><Skeleton className="h-6 w-20 shrink-0 rounded-full" /></div>)}
        </div>
    );
}

export function AdminDashboardSkeleton() {
    return (
        <section aria-hidden="true" className="grid gap-5">
            <DashboardMetricSkeleton count={3} />
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(18rem,.8fr)]">
                <div className="border border-border bg-paper p-5 sm:p-7"><div className="border-b border-border pb-4"><Skeleton className="h-3 w-24 rounded-sm" /><Skeleton className="mt-2 h-6 w-40 rounded-sm" /></div>{[0, 1, 2, 3].map((item) => <div key={item} className="flex items-center justify-between gap-4 border-b border-border py-5"><div className="grid flex-1 gap-2"><Skeleton className="h-4 w-2/3 rounded-sm" /><Skeleton className="h-3 w-1/3 rounded-sm" /></div><Skeleton className="h-8 w-24 rounded-sm" /></div>)}</div>
                <div className="border border-border bg-paper p-5 sm:p-7"><Skeleton className="h-5 w-36 rounded-sm" /><div className="mt-5 grid gap-4">{[0, 1, 2].map((item) => <div key={item} className="grid gap-2"><Skeleton className="h-4 w-3/4 rounded-sm" /><Skeleton className="h-3 w-full rounded-sm" /></div>)}</div></div>
            </div>
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><div className="sm:col-span-2 xl:col-span-4"><Skeleton className="h-6 w-40 rounded-sm" /></div>{[0, 1, 2, 3].map((item) => <article key={item} className="grid min-h-44 content-start gap-4 border border-border bg-paper p-5"><div className="flex items-center justify-between gap-3"><Skeleton className="h-10 w-10 rounded-sm" /><Skeleton className="h-3 w-20 rounded-sm" /></div><Skeleton className="h-5 w-2/3 rounded-sm" /><Skeleton className="h-3 w-full rounded-sm" /><Skeleton className="h-3 w-4/5 rounded-sm" /></article>)}</section>
        </section>
    );
}

export function ArtworkModerationSkeleton({ count = 4 }) {
    return (
        <div aria-hidden="true" className="grid gap-4 xl:grid-cols-2">
            {Array.from({ length: count }, (_, index) => <article key={index} className="overflow-hidden border border-border bg-paper">
                <div className="grid sm:grid-cols-[minmax(0,.85fr)_minmax(0,1.15fr)]">
                    <Skeleton className="h-56 w-full rounded-none sm:h-full sm:min-h-64" />
                    <div className="grid content-start gap-3 p-5"><div className="flex items-start justify-between gap-3"><Skeleton className="h-5 w-2/3 rounded-sm" /><Skeleton className="h-6 w-20 rounded-full" /></div><Skeleton className="h-3 w-1/2 rounded-sm" /><div className="grid grid-cols-2 gap-3"><Skeleton className="h-8 w-full rounded-sm" /><Skeleton className="h-8 w-full rounded-sm" /><Skeleton className="h-8 w-full rounded-sm" /><Skeleton className="h-8 w-full rounded-sm" /></div><div className="grid gap-2"><Skeleton className="h-3 w-full rounded-sm" /><Skeleton className="h-3 w-11/12 rounded-sm" /><Skeleton className="h-3 w-4/5 rounded-sm" /></div></div>
                </div>
                <div className="grid gap-3 border-t border-border p-5"><Skeleton className="h-4 w-36 rounded-sm" /><Skeleton className="h-20 w-full rounded-sm" /><div className="flex gap-2"><Skeleton className="h-9 w-24 rounded-sm" /><Skeleton className="h-9 w-24 rounded-sm" /><Skeleton className="h-9 w-20 rounded-sm" /></div></div>
            </article>)}
        </div>
    );
}

export function WorkspaceIdentitySkeleton() {
    return (
        <section aria-hidden="true" className="grid gap-5 border border-border bg-paper p-5 sm:p-7 lg:grid-cols-[1fr_15rem] lg:items-center">
            <div className="grid gap-3"><div className="flex items-center gap-3"><Skeleton className="h-3 w-24 rounded-sm" /><Skeleton className="h-6 w-24 rounded-full" /></div><Skeleton className="h-7 w-2/3 max-w-sm rounded-sm" /><Skeleton className="h-4 w-full max-w-2xl rounded-sm" /><Skeleton className="h-4 w-4/5 max-w-xl rounded-sm" /><div className="mt-2 flex gap-3"><Skeleton className="h-10 w-32 rounded-sm" /><Skeleton className="h-10 w-28 rounded-sm" /></div></div>
            <div className="grid justify-items-center gap-3 border-t border-border pt-5 lg:border-r lg:border-t-0 lg:pt-0"><Skeleton className="h-3 w-20 rounded-sm" /><Skeleton className="h-10 w-20 rounded-sm" /><Skeleton className="h-2 w-full rounded-full" /></div>
        </section>
    );
}

export function MessageReportsSkeleton({ count = 3 }) {
    return (
        <div aria-hidden="true" className="grid gap-4">
            {Array.from({ length: count }, (_, index) => <article key={index} className="overflow-hidden border border-border bg-paper">
                <div className="flex items-start justify-between gap-3 border-b border-border bg-surface-muted p-4 sm:p-5"><div className="grid flex-1 gap-2"><Skeleton className="h-3 w-24 rounded-sm" /><Skeleton className="h-5 w-2/3 rounded-sm" /><Skeleton className="h-3 w-1/2 rounded-sm" /></div><Skeleton className="h-6 w-24 rounded-full" /></div>
                <div className="grid gap-3 p-5"><Skeleton className="h-4 w-28 rounded-sm" /><Skeleton className="h-16 w-full rounded-sm" /><Skeleton className="h-4 w-36 rounded-sm" /><Skeleton className="h-20 w-full rounded-sm" /><div className="flex flex-wrap gap-2"><Skeleton className="h-9 w-24 rounded-sm" /><Skeleton className="h-9 w-24 rounded-sm" /></div></div>
            </article>)}
        </div>
    );
}

export function AdminUserCardsSkeleton({ count = 4 }) {
    return (
        <div aria-hidden="true" className="grid gap-3 xl:grid-cols-2">
            {Array.from({ length: count }, (_, index) => <article key={index} className="grid gap-4 border border-border bg-paper p-5"><div className="flex items-start justify-between gap-3"><div className="grid min-w-0 flex-1 gap-2"><Skeleton className="h-5 w-2/3 rounded-sm" /><Skeleton className="h-3 w-4/5 rounded-sm" /></div><Skeleton className="h-6 w-20 rounded-full" /></div><div className="grid gap-2 border-t border-border pt-4"><Skeleton className="h-4 w-28 rounded-sm" /><Skeleton className="h-11 w-full rounded-sm" /><Skeleton className="h-3 w-3/4 rounded-sm" /><div className="flex gap-2"><Skeleton className="h-9 w-24 rounded-sm" /><Skeleton className="h-9 w-24 rounded-sm" /></div></div></article>)}
        </div>
    );
}

export function CollectionCardSkeleton({ count = 3 }) {
    return (
        <div aria-hidden="true" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: count }, (_, index) => <article key={index} className="grid content-start gap-3 border border-border bg-paper p-6"><Skeleton className="h-3 w-24 rounded-sm" /><Skeleton className="mt-1 h-7 w-4/5 rounded-sm" /><div className="mt-1 grid gap-2"><Skeleton className="h-3 w-full rounded-sm" /><Skeleton className="h-3 w-full rounded-sm" /><Skeleton className="h-3 w-11/12 rounded-sm" /><Skeleton className="h-3 w-4/5 rounded-sm" /></div><Skeleton className="mt-3 h-4 w-28 rounded-sm" /></article>)}
        </div>
    );
}

export function AdminEditorialSkeleton() {
    return (
        <div aria-hidden="true" className="grid gap-8">
            <section className="grid gap-4 border border-border bg-paper p-5 sm:p-7">
                <Skeleton className="h-7 w-44 rounded-sm" />
                <div className="grid gap-2"><Skeleton className="h-4 w-28 rounded-sm" /><Skeleton className="h-11 w-full rounded-sm" /></div>
                <div className="grid gap-2"><Skeleton className="h-4 w-32 rounded-sm" /><Skeleton className="h-28 w-full rounded-sm" /><Skeleton className="h-3 w-2/3 rounded-sm" /></div>
                <div className="grid gap-2"><Skeleton className="h-4 w-48 rounded-sm" /><div className="grid max-h-72 gap-3 overflow-hidden border border-border p-3">{[0, 1, 2, 3, 4, 5].map((item) => <div key={item} className="flex items-center gap-3"><Skeleton className="h-4 w-4 rounded-sm" /><div className="grid flex-1 gap-2"><Skeleton className="h-4 w-2/3 rounded-sm" /><Skeleton className="h-3 w-1/3 rounded-sm" /></div></div>)}</div></div>
                <div className="flex gap-2"><Skeleton className="h-10 w-32 rounded-sm" /><Skeleton className="h-10 w-32 rounded-sm" /></div>
            </section>
            <section className="grid gap-4"><div className="flex items-center justify-between gap-3"><Skeleton className="h-6 w-40 rounded-sm" /><Skeleton className="h-9 w-28 rounded-sm" /></div>{[0, 1, 2].map((item) => <article key={item} className="grid gap-4 border border-border bg-paper p-5"><div className="flex items-start justify-between gap-3"><div className="grid flex-1 gap-2"><Skeleton className="h-5 w-2/3 rounded-sm" /><Skeleton className="h-3 w-1/3 rounded-sm" /><Skeleton className="h-3 w-1/2 rounded-sm" /></div><Skeleton className="h-4 w-16 rounded-sm" /></div><div className="flex flex-wrap gap-2 border-t border-border pt-4"><Skeleton className="h-9 w-24 rounded-sm" /><Skeleton className="h-9 w-24 rounded-sm" /><Skeleton className="h-9 w-24 rounded-sm" /><Skeleton className="h-9 w-24 rounded-sm" /></div></article>)}</section>
            <section className="grid gap-4 border border-border bg-paper p-5 sm:p-7"><Skeleton className="h-6 w-40 rounded-sm" /><Skeleton className="h-4 w-full max-w-xl rounded-sm" /><div className="grid gap-3 sm:grid-cols-2">{[0, 1, 2, 3].map((item) => <div key={item} className="grid gap-3 border border-border p-3"><div className="flex items-center gap-3"><Skeleton className="h-4 w-4 rounded-sm" /><Skeleton className="h-4 w-2/3 rounded-sm" /></div><Skeleton className="h-10 w-full rounded-sm" /></div>)}</div><Skeleton className="h-10 w-40 rounded-sm" /></section>
        </div>
    );
}

export function CollectionDetailSkeleton() {
    return (
        <PageContainer as="main" className="min-h-[65vh] py-12" dir="rtl" role="status" aria-busy="true" aria-label="در حال دریافت مجموعه منتخب">
            <span className="sr-only">در حال دریافت مجموعه منتخب…</span>
            <nav aria-hidden="true" className="flex items-center gap-2"><Skeleton className="h-3 w-10 rounded-sm" /><Skeleton className="h-3 w-2 rounded-sm" /><Skeleton className="h-3 w-20 rounded-sm" /></nav>
            <header className="mt-7 max-w-3xl border-b border-border pb-8"><Skeleton className="h-3 w-28 rounded-sm" /><Skeleton className="mt-3 h-10 w-2/3 rounded-sm" /><div className="mt-5 grid gap-2"><Skeleton className="h-3 w-full rounded-sm" /><Skeleton className="h-3 w-full rounded-sm" /><Skeleton className="h-3 w-4/5 rounded-sm" /></div></header>
            <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2, 3, 4, 5].map((item) => <ArtworkCardSkeleton key={item} />)}</div>
        </PageContainer>
    );
}

export function NotificationListSkeleton({ count = 3 }) {
    return (
        <div aria-hidden="true" className="divide-y divide-border">
            {Array.from({ length: count }, (_, index) => <div key={index} className="flex items-start gap-2 py-3"><Skeleton className="mt-1 h-2 w-2 shrink-0 rounded-full" /><div className="grid min-w-0 flex-1 gap-2"><Skeleton className="h-4 w-4/5 rounded-sm" /><Skeleton className="h-3 w-1/3 rounded-sm" /></div></div>)}
        </div>
    );
}

export function HomePageSkeleton() {
    return (
        <main aria-hidden="true" className="overflow-hidden">
            <section className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[1fr_.9fr] lg:gap-16 lg:px-10 lg:py-24">
                <div className="grid max-w-2xl content-center gap-5"><Skeleton className="h-4 w-56 rounded-sm" /><Skeleton className="h-12 w-11/12 rounded-sm sm:h-14" /><Skeleton className="h-12 w-3/4 rounded-sm sm:h-14" /><div className="mt-2 grid gap-2"><Skeleton className="h-4 w-full max-w-xl rounded-sm" /><Skeleton className="h-4 w-4/5 rounded-sm" /></div><div className="mt-4 flex flex-wrap gap-3"><Skeleton className="h-12 w-40 rounded-sm" /><Skeleton className="h-12 w-36 rounded-sm" /></div><Skeleton className="mt-2 h-3 w-64 rounded-sm" /></div>
                <div className="relative mx-auto w-full max-w-xl lg:me-0"><Skeleton className="aspect-[4/5] w-full rounded-none" /><div className="flex items-center justify-between gap-4 px-2 py-4"><div className="grid flex-1 gap-2"><Skeleton className="h-3 w-20 rounded-sm" /><Skeleton className="h-5 w-2/3 rounded-sm" /><Skeleton className="h-3 w-1/3 rounded-sm" /></div><Skeleton className="h-4 w-24 rounded-sm" /></div></div>
            </section>
            <section className="border-y border-border bg-surface-muted"><div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:grid-cols-3 sm:px-8 lg:px-10">{[0, 1, 2].map((item) => <div key={item} className="grid content-start gap-3"><Skeleton className="h-3 w-24 rounded-sm" /><Skeleton className="h-6 w-3/4 rounded-sm" /><Skeleton className="h-3 w-full rounded-sm" /><Skeleton className="h-3 w-11/12 rounded-sm" /><Skeleton className="h-3 w-4/5 rounded-sm" /></div>)}</div></section>
            <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10"><div className="grid gap-3 border-b border-border pb-5"><Skeleton className="h-3 w-24 rounded-sm" /><Skeleton className="h-8 w-48 rounded-sm" /><Skeleton className="h-3 w-64 max-w-full rounded-sm" /></div><div className="mt-8 grid gap-x-5 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2, 3, 4, 5].map((item) => <ArtworkCardSkeleton key={item} />)}</div></section>
            <section className="border-y border-border bg-white"><div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10"><Skeleton className="h-3 w-28 rounded-sm" /><Skeleton className="mt-2 h-7 w-52 rounded-sm" /><div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[0, 1, 2, 3, 4, 5, 6, 7].map((item) => <Skeleton key={item} className="h-24 w-full rounded-none" />)}</div></div></section>
            <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10"><div className="flex items-end justify-between gap-4 border-b border-border pb-5"><div className="grid gap-2"><Skeleton className="h-3 w-24 rounded-sm" /><Skeleton className="h-8 w-52 rounded-sm" /><Skeleton className="h-3 w-64 max-w-full rounded-sm" /></div><Skeleton className="h-4 w-20 rounded-sm" /></div><div className="mt-8 grid gap-4 sm:grid-cols-3">{[0, 1, 2].map((item) => <ArtistCardSkeleton key={item} />)}</div></section>
            <section className="border-y border-border bg-surface-muted"><div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10"><Skeleton className="h-7 w-48 rounded-sm" /><div className="mt-6 grid gap-4 sm:grid-cols-3">{[0, 1, 2].map((item) => <div key={item} className="grid gap-3 border border-border bg-paper p-5"><Skeleton className="h-3 w-20 rounded-sm" /><Skeleton className="h-5 w-4/5 rounded-sm" /><Skeleton className="h-3 w-full rounded-sm" /><Skeleton className="h-3 w-4/5 rounded-sm" /></div>)}</div></div></section>
            <section className="bg-ink"><div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-5 py-14 sm:px-8 md:flex-row md:items-center lg:px-10"><div className="grid flex-1 gap-3"><Skeleton className="h-3 w-24 rounded-sm" /><Skeleton className="h-8 w-2/3 max-w-lg rounded-sm" /><Skeleton className="h-3 w-full max-w-2xl rounded-sm" /><Skeleton className="h-3 w-4/5 rounded-sm" /></div><Skeleton className="h-12 w-40 rounded-sm" /></div></section>
        </main>
    );
}

export function ArtworkDetailSkeleton() {
    return (
        <PageContainer as="main" className="min-h-[65vh] py-10 lg:py-14" dir="rtl" role="status" aria-busy="true" aria-label="در حال دریافت اثر هنری">
            <span className="sr-only">در حال دریافت اثر هنری…</span>
            <nav aria-hidden="true" className="flex items-center gap-2"><Skeleton className="h-3 w-10 rounded-sm" /><Skeleton className="h-3 w-2 rounded-sm" /><Skeleton className="h-3 w-20 rounded-sm" /><Skeleton className="h-3 w-2 rounded-sm" /><Skeleton className="h-3 w-16 rounded-sm" /></nav>
            <article className="mt-7 grid items-start gap-8 lg:grid-cols-[1.15fr_.85fr] lg:gap-10">
                <div className="flex aspect-[4/3] items-center justify-center overflow-hidden border border-border bg-surface-muted p-3 sm:p-6 lg:aspect-[4/5] lg:p-8"><Skeleton className="h-full w-full rounded-none" /></div>
                <div className="border-y border-border bg-transparent py-6 sm:py-9 lg:sticky lg:top-28 lg:border-y-0 lg:py-2">
                    <Skeleton className="h-4 w-24 rounded-sm" />
                    <Skeleton className="mt-3 h-10 w-4/5 max-w-md rounded-sm sm:h-12" />
                    <Skeleton className="mt-3 h-4 w-2/5 rounded-sm" />
                    <div className="mt-7 grid gap-2"><Skeleton className="h-3 w-full rounded-sm" /><Skeleton className="h-3 w-full rounded-sm" /><Skeleton className="h-3 w-11/12 rounded-sm" /><Skeleton className="h-3 w-4/5 rounded-sm" /></div>
                    <dl className="mt-7 grid grid-cols-2 gap-x-5 gap-y-6 border-y border-border py-6">{[0, 1, 2, 3].map((item) => <div key={item} className="grid gap-2"><Skeleton className="h-3 w-2/3 rounded-sm" /><Skeleton className="h-4 w-4/5 rounded-sm" /></div>)}</dl>
                    <Skeleton className="mt-5 h-4 w-2/3 rounded-sm" />
                    <Skeleton className="mt-7 h-12 w-52 rounded-sm" />
                </div>
            </article>
        </PageContainer>
    );
}

export function ArtistProfileSkeleton() {
    return (
        <PageContainer as="main" className="min-h-[65vh] pb-16 pt-8 sm:pt-12" dir="rtl" role="status" aria-busy="true" aria-label="در حال دریافت پروفایل هنرمند">
            <span className="sr-only">در حال دریافت پروفایل هنرمند…</span>
            <nav aria-hidden="true" className="flex items-center gap-2"><Skeleton className="h-3 w-10 rounded-sm" /><Skeleton className="h-3 w-2 rounded-sm" /><Skeleton className="h-3 w-16 rounded-sm" /><Skeleton className="h-3 w-2 rounded-sm" /><Skeleton className="h-3 w-24 rounded-sm" /></nav>
            <section className="relative mt-6 overflow-hidden border border-border bg-paper">
                <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5 bg-terracotta" />
                <div className="grid lg:grid-cols-[minmax(0,1fr)_18rem]">
                    <div className="relative px-6 pb-8 pt-9 sm:px-10 sm:pb-10 sm:pt-12 lg:px-12">
                        <Skeleton className="h-3 w-24 rounded-sm" />
                        <Skeleton className="mt-4 h-11 w-2/3 max-w-lg rounded-sm sm:h-14" />
                        <Skeleton className="mt-4 h-4 w-24 rounded-sm" />
                        <div className="mt-7 grid max-w-3xl gap-2 border-r-2 border-sand pr-5"><Skeleton className="h-3 w-full rounded-sm" /><Skeleton className="h-3 w-full rounded-sm" /><Skeleton className="h-3 w-11/12 rounded-sm" /><Skeleton className="h-3 w-4/5 rounded-sm" /></div>
                        <div className="mt-7 flex gap-5"><Skeleton className="h-4 w-24 rounded-sm" /><Skeleton className="h-4 w-28 rounded-sm" /></div>
                    </div>
                    <aside className="grid content-between gap-6 border-t border-border bg-surface-muted p-6 sm:p-8 lg:border-r lg:border-t-0">
                        <div><Skeleton className="h-3 w-28 rounded-sm" /><Skeleton className="mt-3 h-9 w-20 rounded-sm" /><Skeleton className="mt-2 h-3 w-32 rounded-sm" /></div>
                        <Skeleton className="h-12 w-full rounded-sm" />
                    </aside>
                </div>
            </section>
            <section className="mt-12">
                <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5"><div className="grid gap-2"><Skeleton className="h-3 w-24 rounded-sm" /><Skeleton className="h-8 w-44 rounded-sm" /><Skeleton className="h-3 w-64 max-w-full rounded-sm" /></div><Skeleton className="h-3 w-24 rounded-sm" /></div>
                <div className="mt-6 flex gap-2"><Skeleton className="h-10 w-24 rounded-full" /><Skeleton className="h-10 w-20 rounded-full" /><Skeleton className="h-10 w-28 rounded-full" /></div>
                <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{[0, 1, 2, 3, 4, 5, 6, 7].map((item) => <ArtworkCardSkeleton key={item} />)}</div>
            </section>
        </PageContainer>
    );
}
