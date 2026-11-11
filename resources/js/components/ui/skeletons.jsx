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

export function ArtworkDetailSkeleton() {
    return (
        <PageContainer as="main" className="min-h-[65vh] py-12" dir="rtl" role="status" aria-busy="true" aria-label="در حال دریافت اثر هنری">
            <span className="sr-only">در حال دریافت اثر هنری…</span>
            <div className="mb-7"><a href="/artworks" tabIndex={-1} className="block"><Skeleton className="h-4 w-28 rounded-sm" /></a></div>
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
