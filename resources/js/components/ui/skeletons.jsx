import { Skeleton } from './feedback';
import { PageContainer } from './primitives';

export function ArtworkCardSkeleton({ className = '' }) {
    return (
        <article aria-hidden="true" className={`group min-w-0 overflow-hidden border border-border bg-paper ${className}`}>
            <div className="block">
                <div className="flex aspect-[4/3] items-center justify-center overflow-hidden bg-surface-muted p-3">
                    <Skeleton className="h-full w-full rounded-none" />
                </div>
                <div className="grid gap-2 p-4">
                    <Skeleton className="h-5 w-20 rounded-full" />
                    <Skeleton className="h-6 w-4/5 rounded-sm" />
                    <Skeleton className="h-4 w-2/5 rounded-sm" />
                    <Skeleton className="h-4 w-1/3 rounded-sm" />
                </div>
            </div>
        </article>
    );
}

export function ArtistCardSkeleton({ className = '' }) {
    return (
        <article aria-hidden="true" className={`grid gap-3 border border-border bg-paper p-5 ${className}`} dir="rtl">
            <div className="flex items-start gap-3">
                <Skeleton className="h-12 w-12 shrink-0 rounded-full" />
                <div className="grid min-w-0 flex-1 content-start gap-2 pt-1">
                    <Skeleton className="h-5 w-2/3 rounded-sm" />
                    <Skeleton className="h-3 w-1/3 rounded-sm" />
                </div>
            </div>
            <div className="grid gap-2">
                <Skeleton className="h-3 w-full rounded-sm" />
                <Skeleton className="h-3 w-11/12 rounded-sm" />
                <Skeleton className="h-3 w-3/4 rounded-sm" />
            </div>
            <div className="mt-1 block"><Skeleton className="h-4 w-28 rounded-sm" /></div>
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
        <div aria-hidden="true" className={`min-h-0 overflow-hidden ${className}`}>
            <div className="shrink-0 border-b border-border bg-white px-5 py-5">
                <Skeleton className="h-3 w-28 rounded-sm" />
                <Skeleton className="mt-2 h-6 w-32 rounded-sm" />
            </div>
            <div className="shrink-0 space-y-3 border-b border-border bg-surface-muted p-4">
                <Skeleton className="h-11 w-full rounded-xl" />
                <div className="grid grid-cols-3 gap-1 rounded-xl border border-border bg-white p-1">{[0, 1, 2].map((item) => <Skeleton key={item} className="h-8 w-full rounded-lg" />)}</div>
            </div>
            <div className="divide-y divide-border">
                {Array.from({ length: count }, (_, index) => <div key={index} className="flex items-center gap-3 px-4 py-4"><Skeleton className="h-11 w-11 shrink-0 rounded-full" /><div className="grid min-w-0 flex-1 gap-2"><div className="flex items-center justify-between gap-3"><Skeleton className="h-4 w-2/5 rounded-sm" /><Skeleton className="h-3 w-12 rounded-sm" /></div><Skeleton className="h-3 w-4/5 rounded-sm" /></div></div>)}
            </div>
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

export function ArtworkDetailSkeleton() {
    return (
        <PageContainer as="main" className="min-h-[65vh] py-12" dir="rtl" role="status" aria-busy="true" aria-label="در حال دریافت اثر هنری">
            <span className="sr-only">در حال دریافت اثر هنری…</span>
            <div className="mb-7"><Skeleton className="h-4 w-28 rounded-sm" /></div>
            <article className="grid gap-8 lg:grid-cols-[1.15fr_.85fr]">
                <div className="flex aspect-[4/3] items-center justify-center overflow-hidden bg-paper p-4 sm:p-8 lg:aspect-[4/5]">
                    <Skeleton className="h-full w-full rounded-none" />
                </div>
                <div className="border border-border bg-paper p-6 sm:p-9">
                    <Skeleton className="h-4 w-24 rounded-sm" />
                    <Skeleton className="mt-3 h-10 w-4/5 rounded-sm" />
                    <Skeleton className="mt-3 h-4 w-2/5 rounded-sm" />
                    <div className="mt-7 grid gap-2">
                        <Skeleton className="h-3 w-full rounded-sm" />
                        <Skeleton className="h-3 w-full rounded-sm" />
                        <Skeleton className="h-3 w-11/12 rounded-sm" />
                        <Skeleton className="h-3 w-4/5 rounded-sm" />
                    </div>
                    <dl className="mt-7 grid grid-cols-2 gap-4 border-y border-border py-5">
                        {[0, 1, 2, 3].map((item) => (
                            <div key={item} className="grid gap-2">
                                <Skeleton className="h-3 w-2/3 rounded-sm" />
                                <Skeleton className="h-4 w-4/5 rounded-sm" />
                            </div>
                        ))}
                    </dl>
                    <Skeleton className="mt-5 h-4 w-2/3 rounded-sm" />
                    <Skeleton className="mt-7 h-11 w-48 rounded-sm" />
                </div>
            </article>
        </PageContainer>
    );
}

export function ArtistProfileSkeleton() {
    return (
        <PageContainer as="main" className="min-h-[65vh] py-12" dir="rtl" role="status" aria-busy="true" aria-label="در حال دریافت پروفایل هنرمند">
            <span className="sr-only">در حال دریافت پروفایل هنرمند…</span>
            <Skeleton className="h-4 w-28 rounded-sm" />
            <section className="mt-7 border border-border bg-paper p-7 sm:p-12">
                <Skeleton className="h-4 w-28 rounded-sm" />
                <Skeleton className="mt-3 h-10 w-2/3 max-w-md rounded-sm" />
                <Skeleton className="mt-3 h-4 w-28 rounded-sm" />
                <div className="mt-8 grid max-w-3xl gap-2">
                    <Skeleton className="h-3 w-full rounded-sm" />
                    <Skeleton className="h-3 w-full rounded-sm" />
                    <Skeleton className="h-3 w-11/12 rounded-sm" />
                    <Skeleton className="h-3 w-4/5 rounded-sm" />
                </div>
                <div className="mt-8 flex gap-4">
                    <Skeleton className="h-4 w-20 rounded-sm" />
                    <Skeleton className="h-4 w-24 rounded-sm" />
                </div>
            </section>
            <section className="mt-12">
                <Skeleton className="h-3 w-24 rounded-sm" />
                <Skeleton className="mt-2 h-8 w-56 rounded-sm" />
                <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {[0, 1, 2, 3, 4, 5].map((item) => <ArtworkCardSkeleton key={item} />)}
                </div>
            </section>
        </PageContainer>
    );
}
