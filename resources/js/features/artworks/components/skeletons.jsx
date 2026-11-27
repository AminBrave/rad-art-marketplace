import { Skeleton } from '../../../shared/ui';
import { Container } from '../../../shared/ui';
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

export function ArtworkDetailSkeleton() {
    return (
        <Container as="div" width="wide" className="min-h-[65vh] py-10 lg:py-14" role="status" aria-busy="true" aria-label="در حال دریافت اثر هنری">
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
