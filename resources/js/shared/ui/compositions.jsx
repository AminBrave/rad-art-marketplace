import { cn } from '../../lib/utils';
import { Container } from './layout';
import { Badge } from './controls';

export const PageContainer = Container;

export function PageHeader({ eyebrow, title, description, actions, level = 1, bleed = true, className = '', titleClassName = '', descriptionClassName = '' }) {
    const Heading = level === 2 ? 'h2' : 'h1';
    return (
        <section className={cn("rd-hero-surface border-y border-[color:var(--rd-hero-line)]", bleed && "rd-bleed")}>
            <Container className="py-6 sm:py-8">
                <header className={cn('relative isolate flex min-w-0 items-end justify-between gap-6 max-sm:items-stretch max-sm:flex-col max-sm:gap-4', className)}>
                    <div className="relative z-10 min-w-0 max-w-[56rem]">
                        {eyebrow && <p className="inline-flex items-center gap-2 border-s-2 border-[color:var(--rd-hero-accent)] bg-transparent px-3 py-1 text-[11px] font-extrabold leading-none tracking-[.06em] text-[color:var(--rd-hero-accent)]">{eyebrow}</p>}
                        <Heading className={cn('mt-3 text-[clamp(1.75rem,3.2vw,2.6rem)] font-extrabold leading-heading tracking-[-.035em] text-[color:var(--rd-hero-foreground)]', titleClassName)}>{title}</Heading>
                        {description && <p className={cn('mt-3 max-w-2xl text-sm leading-8 text-[color:var(--rd-hero-muted)] sm:text-[.95rem]', descriptionClassName)}>{description}</p>}
                    </div>
                    {actions && <div className="relative z-10 flex min-w-0 max-w-full flex-wrap items-center gap-2 pb-1 max-sm:w-full max-sm:pb-0">{actions}</div>}
                </header>
            </Container>
        </section>
    );
}

export function SectionHeader({ id, eyebrow, title, description, actions, className = '', level = 2 }) {
    const Heading = level === 3 ? 'h3' : 'h2';
    return (
        <header className={cn('flex min-w-0 items-end justify-between gap-4 border-b border-divider-group pb-3 max-sm:items-stretch max-sm:flex-col', className)}>
            <div className="min-w-0">
                {eyebrow && <p className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[.04em] text-terracotta-strong before:h-px before:w-5 before:bg-terracotta">{eyebrow}</p>}
                <Heading id={id} className="mt-1 text-lg font-bold leading-heading tracking-[-.02em] text-ink">{title}</Heading>
                {description && <p className="mt-1.5 max-w-3xl text-xs leading-6 text-muted">{description}</p>}
            </div>
            {actions && <div className="flex shrink-0 flex-wrap items-center gap-2 max-sm:w-full">{actions}</div>}
        </header>
    );
}

export function WorkspaceHero({ eyebrow, title, description, actions, className = '' }) {
    return (
        <section className="rd-hero-surface my-3 border-y border-[color:var(--rd-hero-line)] sm:my-4">
            <Container width="wide" className="py-8 sm:py-10 lg:py-12">
                <header className={cn('relative isolate flex min-w-0 items-center justify-between gap-8 text-[color:var(--rd-hero-foreground)] max-md:items-stretch max-md:flex-col max-md:gap-5', className)}>
                    <div className="relative z-10 min-w-0 max-w-[46rem]">
                        {eyebrow && <p className="text-xs font-bold tracking-wide text-[color:var(--rd-hero-accent)]">{eyebrow}</p>}
                        <h1 className="mt-2 break-words text-[clamp(1.5rem,3vw,2.25rem)] font-extrabold leading-heading tracking-[-.025em] text-[color:var(--rd-hero-foreground)]">{title}</h1>
                        {description && <p className="mt-3 max-w-3xl text-sm leading-copy text-[color:var(--rd-hero-muted)]">{description}</p>}
                    </div>
                    {actions && <div className="relative z-10 flex min-w-0 max-w-full flex-wrap items-center gap-2 max-md:w-full">{actions}</div>}
                </header>
            </Container>
        </section>
    );
}

export function DashboardMetricCard({ as, label, value, detail, to, eyebrow, className = '' }) {
    const Element = as ?? (to ? 'a' : 'article');
    const destinationProps = to ? (Element === 'a' ? { href: to } : { to }) : {};
    return (
        <Element {...destinationProps} className={cn('flex min-h-36 min-w-0 flex-col justify-between border border-divider-group bg-paper p-5 text-ink no-underline transition-colors hover:border-terracotta', to && 'transition duration-200 hover:-translate-y-0.5 hover:border-terracotta hover:shadow-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus', className)}>
            <span className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-muted">{label}</span>
                {eyebrow && <span className="text-[10px] font-bold text-terracotta-strong">{eyebrow}</span>}
            </span>
            <span className="mt-5 text-3xl font-extrabold tabular-nums text-ink">{value ?? '—'}</span>
            {detail && <span className="mt-2 text-xs leading-relaxed text-muted">{detail}</span>}
        </Element>
    );
}

const surfaceVariants = {
    default: 'border border-divider-group bg-surface',
    muted: 'border border-divider-group bg-surface-muted',
    raised: 'border border-divider-group bg-surface shadow-soft',
    interactive: 'border border-divider-group bg-surface transition-colors hover:border-terracotta hover:bg-surface-muted focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-focus',
};

const surfaceVariants = {
    default: 'border border-divider-group bg-surface',
    muted: 'border border-divider-group bg-surface-muted',
    raised: 'border border-divider-group bg-surface shadow-soft',
    interactive: 'border border-divider-group bg-surface transition-colors hover:border-terracotta hover:bg-surface-muted focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-focus',
};

export function Surface({ as: Element = 'section', variant = 'default', className = '', children, ...props }) {
    return <Element className={cn(surfaceVariants[variant] ?? surfaceVariants.default, className)} {...props}>{children}</Element>;
}


const statusVariants = {
    pending_review: 'warning',
    changes_requested: 'info',
    approved: 'success',
    published: 'success',
    available: 'success',
    rejected: 'danger',
    sold: 'neutral',
    not_for_sale: 'neutral',
    private: 'neutral',
    public: 'success',
};

const statusVariants = {
    pending_review: 'warning',
    changes_requested: 'info',
    approved: 'success',
    published: 'success',
    available: 'success',
    rejected: 'danger',
    sold: 'neutral',
    not_for_sale: 'neutral',
    private: 'neutral',
    public: 'success',
};

export function StatusBadge({ status, label, className = '' }) {
    return <Badge variant={statusVariants[status] ?? 'neutral'} className={className}>{label ?? status ?? 'نامشخص'}</Badge>;
}

const controlClass = 'w-full min-h-11  border border-border-strong bg-paper px-3.5 py-2 font-sans text-sm text-ink transition-colors placeholder:text-subtle focus-visible:border-focus focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus disabled:cursor-not-allowed disabled:bg-surface-muted disabled:opacity-65 aria-[invalid=true]:border-danger';
