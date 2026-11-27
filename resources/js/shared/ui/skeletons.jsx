import { Skeleton } from './feedback';

export function FormFieldSkeleton({ className = '', controlClassName = 'h-11' }) {
    return (
        <div aria-hidden="true" className={`grid min-w-0 gap-2 ${className}`}>
            <Skeleton className="h-4 w-28 " />
            <Skeleton className={`w-full  ${controlClassName}`} />
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
