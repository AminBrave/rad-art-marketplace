import { Skeleton, Container } from '../../../shared/ui';
import { ArtworkCardSkeleton } from '../../artworks';
export function ArtistCardSkeleton({ className = '' }) {
    return (
        <article aria-hidden="true" className={`grid min-w-0 content-start gap-3 border-y border-border bg-transparent py-5 sm:py-6 ${className}`}>
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

export function ArtistProfileSkeleton() {
    return (
        <Container as="div" width="wide" className="min-h-[65vh] pb-16 pt-8 sm:pt-12" role="status" aria-busy="true" aria-label="در حال دریافت پروفایل هنرمند">
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
