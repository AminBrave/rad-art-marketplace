import { Skeleton, Container, Section } from '../../../shared/ui';
export function BuyerDashboardSkeleton() {
    return (
        <div role="status" aria-live="polite" aria-busy="true" aria-label="در حال آماده‌سازی فضای خریدار" className="w-full grid gap-7">
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
