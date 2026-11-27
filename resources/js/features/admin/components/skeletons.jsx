import { Skeleton, Container, Section, DashboardMetricSkeleton } from '../../../shared/ui';
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

export function AdminDashboardSkeleton() {
    return (
        <div role="status" aria-live="polite" aria-busy="true" aria-label="در حال دریافت پنل مدیریت" className="w-full grid gap-8">
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
                        <Skeleton className="aspect-[3/4] w-full  sm:max-w-32" />
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
