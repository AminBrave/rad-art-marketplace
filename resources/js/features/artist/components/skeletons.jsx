import { Skeleton, Container, Section } from '../../../shared/ui';
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

export function ArtistWorkspaceOverviewSkeleton() {
    return (
        <div role="status" aria-live="polite" aria-busy="true" aria-label="در حال آماده‌سازی فضای هنرمند" className="w-full grid gap-8">
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
