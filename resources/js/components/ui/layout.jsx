import { forwardRef, useState } from 'react';
import { cn } from '../../lib/utils';
import { useLanguage } from '../../app/LanguageContext';

/**
 * RAD's semantic/layout catalogue.
 * These are intentionally project-owned HTML components: Radix Primitives
 * provide interaction behavior, not a replacement for static HTML elements.
 */

export const Box = forwardRef(function Box({ as: Element = 'div', className = '', ...props }, ref) {
    return <Element ref={ref} className={cn('min-w-0', className)} {...props} />;
});

const spacingValue = (value) => typeof value === 'number'
    ? `var(--rd-space-${String(value).replace('.', '-')}, ${value * 0.25}rem)`
    : value;

export const Flex = forwardRef(function Flex({ as: Element = 'div', direction = 'row', align, justify, wrap = false, gap, className = '', style, ...props }, ref) {
    const directions = { row: 'flex-row', column: 'flex-col', 'row-reverse': 'flex-row-reverse', 'column-reverse': 'flex-col-reverse' };
    const alignments = { start: 'items-start', center: 'items-center', end: 'items-end', stretch: 'items-stretch', baseline: 'items-baseline' };
    const justifications = { start: 'justify-start', center: 'justify-center', end: 'justify-end', between: 'justify-between', around: 'justify-around', evenly: 'justify-evenly' };
    return <Element ref={ref} className={cn('flex min-w-0', directions[direction] ?? directions.row, alignments[align], justifications[justify], wrap && 'flex-wrap', className)} style={{ ...(gap !== undefined ? { gap: spacingValue(gap) } : {}), ...style }} {...props} />;
});

export const Grid = forwardRef(function Grid({ as: Element = 'div', columns, gap, className = '', style, ...props }, ref) {
    const columnClasses = { 1: 'grid-cols-1', 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4', 5: 'grid-cols-5', 6: 'grid-cols-6', 12: 'grid-cols-12' };
    return <Element ref={ref} className={cn('grid min-w-0', columnClasses[columns], className)} style={{ ...(gap !== undefined ? { gap: spacingValue(gap) } : {}), ...style }} {...props} />;
});

export const Container = forwardRef(function Container({ as: Element = 'div', width = 'wide', className = '', ...props }, ref) {
    // Each section owns its own content width and gutters. "full" is
    // intentionally edge-to-edge for sections with viewport-wide backgrounds.
    const widths = {
        reading: 'mx-auto w-full max-w-content-reading',
        wide: 'mx-auto w-full max-w-content',
        full: 'w-full max-w-none',
    };
    const resolvedWidth = Object.prototype.hasOwnProperty.call(widths, width) ? width : 'wide';
    return <Element ref={ref} className={cn('rd-container min-w-0', resolvedWidth !== 'wide' && `rd-container--${resolvedWidth}`, widths[resolvedWidth], className)} {...props} />;
});

export const Section = forwardRef(function Section({ as: Element = 'section', bleed = false, spacing = 'section', className = '', ...props }, ref) {
    const sectionSpacings = { page: 'py-page', section: 'py-section', group: 'py-group', component: 'py-component', compact: 'py-compact' };
    const sectionSpacing = Element === 'section' ? sectionSpacings[spacing] ?? sectionSpacings.section : '';
    return <Element ref={ref} className={cn('min-w-0', sectionSpacing, bleed && 'rd-bleed', className)} {...props} />;
});

export const Inset = forwardRef(function Inset({ as: Element = 'div', side = 'all', className = '', ...props }, ref) {
    const spacing = { all: 'p-component', inline: 'px-component', block: 'py-component', start: 'ps-component', end: 'pe-component', top: 'pt-component', bottom: 'pb-component' };
    return <Element ref={ref} className={cn(spacing[side] ?? spacing.all, className)} {...props} />;
});

export const Heading = forwardRef(function Heading({ as: Element = 'h2', size = 'md', className = '', ...props }, ref) {
    const sizes = { xs: 'text-xs font-bold', sm: 'text-sm font-bold', md: 'text-lg font-extrabold leading-heading', lg: 'text-2xl font-extrabold leading-heading', xl: 'text-3xl font-extrabold leading-heading' };
    return <Element ref={ref} className={cn('text-ink', sizes[size] ?? sizes.md, className)} {...props} />;
});

export const Text = forwardRef(function Text({ as: Element = 'p', size = 'md', color = 'ink', className = '', ...props }, ref) {
    const sizes = { xs: 'text-xs leading-6', sm: 'text-sm leading-7', md: 'text-sm leading-7 sm:text-base', lg: 'text-lg leading-8' };
    const colors = { ink: 'text-ink', muted: 'text-muted', subtle: 'text-subtle', inverse: 'text-inverse', accent: 'text-terracotta-strong' };
    return <Element ref={ref} className={cn('min-w-0', sizes[size] ?? sizes.md, colors[color] ?? colors.ink, className)} {...props} />;
});

export const Strong = forwardRef(function Strong({ className = '', ...props }, ref) {
    return <strong ref={ref} className={cn('font-bold text-ink', className)} {...props} />;
});

export const Em = forwardRef(function Em({ className = '', ...props }, ref) {
    return <em ref={ref} className={cn('italic', className)} {...props} />;
});

export const Code = forwardRef(function Code({ className = '', ...props }, ref) {
    return <code ref={ref} dir="ltr" className={cn(' bg-surface-muted px-1.5 py-0.5 font-mono text-[.9em] text-ink', className)} {...props} />;
});

export const Quote = forwardRef(function Quote({ className = '', ...props }, ref) {
    return <q ref={ref} className={cn('text-ink', className)} {...props} />;
});

export const Blockquote = forwardRef(function Blockquote({ className = '', ...props }, ref) {
    return <blockquote ref={ref} className={cn('border-s-2 border-divider-group ps-4 text-muted', className)} {...props} />;
});

export const Separator = forwardRef(function Separator({ orientation = 'horizontal', decorative = true, tone = 'group', className = '', ...props }, ref) {
    const tones = {
        section: 'bg-divider-section',
        group: 'bg-divider-group',
        nested: 'bg-divider-nested',
    };
    return <div
        ref={ref}
        role={decorative ? 'none' : 'separator'}
        aria-orientation={decorative ? undefined : orientation}
        className={cn(
            orientation === 'vertical'
                ? 'h-full w-[var(--rd-line-width)]'
                : 'h-[var(--rd-line-width)] w-full',
            'shrink-0',
            tones[tone] ?? tones.group,
            className,
        )}
        {...props}
    />;
});

export const AspectRatio = forwardRef(function AspectRatio({ ratio = 1, className = '', style, ...props }, ref) {
    return <div ref={ref} className={cn('relative w-full overflow-hidden', className)} style={{ aspectRatio: ratio, ...style }} {...props} />;
});

export function Avatar({ src, alt = '', fallback, size = 'md', className = '', ...props }) {
    const [failed, setFailed] = useState(false);
    const dimensions = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-14 w-14 text-base', xl: 'h-20 w-20 text-xl' };
    return (
        <span role={alt ? "img" : undefined} aria-label={alt || undefined} aria-hidden={alt ? undefined : true} className={cn('inline-grid shrink-0 place-items-center overflow-hidden  border border-border bg-surface-muted font-bold text-muted', dimensions[size] ?? dimensions.md, className)} {...props}>
            {src && !failed ? <img src={src} alt="" className="h-full w-full object-cover" onError={() => setFailed(true)} /> : <span aria-hidden="true">{fallback ?? (alt ? Array.from(alt.trim())[0] : '?')}</span>}
        </span>
    );
}

export const Card = forwardRef(function Card({ as: Element = 'article', interactive = false, className = '', ...props }, ref) {
    return <Element ref={ref} className={cn('min-w-0 border border-divider-group bg-paper', interactive && 'transition-colors hover:border-border-strong', className)} {...props} />;
});

export const Callout = forwardRef(function Callout({ as: Element = 'aside', variant = 'info', title, children, className = '', ...props }, ref) {
    const variants = { info: 'border-s-terracotta bg-accent-surface', success: 'border-s-success bg-success-surface', warning: 'border-s-warning bg-warning-surface', danger: 'border-s-danger bg-danger-surface' };
    return (
        <Element ref={ref} role={props.role ?? 'note'} className={cn('min-w-0  border border-divider-group border-s-4 p-4 text-ink', variants[variant] ?? variants.info, className)} {...props}>
            {title && <p className="font-bold">{title}</p>}
            {children && <div className={cn(title && 'mt-1', 'text-sm leading-7')}>{children}</div>}
        </Element>
    );
});

export const Progress = forwardRef(function Progress({ value = 0, max = 100, label, className = '', ...props }, ref) {
    const safeMax = Number.isFinite(Number(max)) && Number(max) > 0 ? Number(max) : 100;
    const safeValue = Math.min(safeMax, Math.max(0, Number(value) || 0));
    return <progress ref={ref} value={safeValue} max={safeMax} aria-label={label} className={cn('block h-2 w-full overflow-hidden  accent-terracotta', className)} {...props} />;
});

export function Spinner({ label = 'در حال بارگذاری', className = '' }) {
    const { t } = useLanguage();
    return <span role="status" aria-label={t(label)} className={cn('inline-block h-5 w-5 animate-spin  border-2 border-current border-e-transparent text-terracotta motion-reduce:animate-none', className)} />;
}

export const Kbd = forwardRef(function Kbd({ className = '', ...props }, ref) {
    return <kbd ref={ref} dir="ltr" className={cn('inline-flex min-h-6 items-center  border border-border bg-surface-muted px-1.5 font-mono text-[.7rem] text-muted', className)} {...props} />;
});

export function AccessibleIcon({ label, children }) {
    return <span role="img" aria-label={label}>{children}</span>;
}

export function VisuallyHidden({ as: Element = 'span', className = '', ...props }) {
    return <Element className={cn('sr-only', className)} {...props} />;
}

export const Table = forwardRef(function Table({ className = '', ...props }, ref) {
    return <div className="w-full min-w-0 overflow-x-auto"><table ref={ref} className={cn('w-full border-collapse text-start text-sm', className)} {...props} /></div>;
});

export const DataList = forwardRef(function DataList({ className = '', ...props }, ref) {
    return <dl ref={ref} className={cn('grid min-w-0 gap-3', className)} {...props} />;
});

export const DataListItem = forwardRef(function DataListItem({ label, value, className = '', ...props }, ref) {
    return <div ref={ref} className={cn('grid min-w-0 grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-3 border-b border-divider-nested py-2 last:border-0', className)} {...props}><dt className="text-sm text-muted">{label}</dt><dd className="min-w-0 break-words text-sm font-semibold text-ink">{value}</dd></div>;});
