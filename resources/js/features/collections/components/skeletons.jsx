import { Skeleton, Container } from '../../../shared/ui';
import { ArtworkCardSkeleton } from '../../artworks';
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

export function CollectionDetailSkeleton() {
    return (
        <Container as="div" width="wide" className="min-h-[65vh] py-12" role="status" aria-busy="true" aria-label="در حال دریافت مجموعه منتخب">
            <span className="sr-only">در حال دریافت مجموعه منتخب…</span>
            <nav aria-hidden="true" className="flex items-center gap-2"><Skeleton className="h-3 w-10 " /><Skeleton className="h-3 w-2 " /><Skeleton className="h-3 w-20 " /></nav>
            <header className="mt-7 max-w-3xl border-b border-border pb-8"><Skeleton className="h-3 w-28 " /><Skeleton className="mt-3 h-10 w-2/3 " /><div className="mt-5 grid gap-2"><Skeleton className="h-3 w-full " /><Skeleton className="h-3 w-full " /><Skeleton className="h-3 w-4/5 " /></div></header>
            <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2, 3, 4, 5].map((item) => <ArtworkCardSkeleton key={item} />)}</div>
        </Container>
    );
}
