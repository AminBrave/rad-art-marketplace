import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { Link } from 'react-router-dom';
import { Button } from './primitives';
import { cn } from '../../lib/utils';

export const Tabs = TabsPrimitive.Root;

export function TabsList({ className = '', ...props }) {
    return (
        <TabsPrimitive.List
            data-ui="tabs-list"
            className={cn('inline-flex max-w-full flex-wrap gap-1 border-b border-border', className)}
            {...props}
        />
    );
}

export function TabsTrigger({ className = '', ...props }) {
    return (
        <TabsPrimitive.Trigger
            data-ui="tabs-trigger"
            className={cn('min-h-11 border-b-2 border-transparent px-4 py-2 text-sm font-semibold text-muted outline-none transition-colors hover:text-ink focus-visible:ring-2 focus-visible:ring-accent-strong data-[state=active]:border-accent data-[state=active]:text-ink disabled:cursor-not-allowed disabled:opacity-50', className)}
            {...props}
        />
    );
}

export function TabsContent({ className = '', ...props }) {
    return <TabsPrimitive.Content data-ui="tabs-content" className={cn('pt-5 outline-none focus-visible:ring-2 focus-visible:ring-accent-strong', className)} {...props} />;
}

export function DropdownMenuTrigger({ className = '', ...props }) {
    return <DropdownMenuPrimitive.Trigger data-ui="menu-trigger" className={className} {...props} />;
}

export function DropdownMenuContent({ className = '', sideOffset = 6, ...props }) {
    return (
        <DropdownMenuPrimitive.Content
            data-ui="menu-content"
            sideOffset={sideOffset}
            align="end"
            dir="rtl"
            className={cn('z-50 min-w-44 rounded-md border border-border bg-paper p-1.5 text-ink shadow-raised outline-none', className)}
            {...props}
        />
    );
}

export function DropdownMenuItem({ className = '', ...props }) {
    return (
        <DropdownMenuPrimitive.Item
            data-ui="menu-item"
            className={cn('flex min-h-10 cursor-pointer items-center rounded-sm px-3 py-2 text-sm outline-none focus:bg-surface-muted focus:text-ink data-[disabled]:pointer-events-none data-[disabled]:opacity-40', className)}
            {...props}
        />
    );
}

export function DropdownMenuLabel({ className = '', ...props }) {
    return <DropdownMenuPrimitive.Label data-ui="menu-label" className={cn('px-3 py-2 text-xs font-bold text-muted', className)} {...props} />;
}

export function DropdownMenuSeparator({ className = '', ...props }) {
    return <DropdownMenuPrimitive.Separator data-ui="menu-separator" className={cn('my-1 h-px bg-border', className)} {...props} />;
}

export function DropdownMenu(props) {
    return <DropdownMenuPrimitive.Root {...props} />;
}

DropdownMenu.Root = DropdownMenu;
DropdownMenu.Trigger = DropdownMenuTrigger;
DropdownMenu.Portal = DropdownMenuPrimitive.Portal;
DropdownMenu.Content = DropdownMenuContent;
DropdownMenu.Item = DropdownMenuItem;
DropdownMenu.Label = DropdownMenuLabel;
DropdownMenu.Separator = DropdownMenuSeparator;

export function Breadcrumbs({ items = [], className = '' }) {
    return (
        <nav data-ui="breadcrumbs" aria-label="مسیر صفحه" className={cn('text-sm text-muted', className)}>
            <ol className="flex flex-wrap items-center gap-2 text-sm text-muted">
                {items.map((item, index) => {
                    const current = index === items.length - 1;
                    return (
                        <li key={item.to ?? item.label} className="inline-flex items-center gap-2">
                            {index > 0 && <span aria-hidden="true" className="text-subtle">/</span>}
                            {current ? (
                                <span aria-current="page" className="font-semibold text-ink">{item.label}</span>
                            ) : (
                                <Link to={item.to} className="underline-offset-4 hover:text-accent-strong hover:underline">{item.label}</Link>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}

export function Pagination({ currentPage = 1, lastPage = 1, onPageChange, disabled = false, className = '' }) {
    if (!lastPage || lastPage < 2) return null;
    const page = Math.min(Math.max(1, currentPage), lastPage);
    const pages = Array.from({ length: lastPage }, (_, index) => index + 1);
    const visiblePages = pages.length <= 7
        ? pages
        : [...new Set([1, page - 1, page, page + 1, lastPage].filter((number) => number >= 1 && number <= lastPage))];

    return (
        <nav data-ui="pagination" aria-label="صفحه‌بندی" className={cn('flex flex-wrap items-center justify-between gap-3', className)}>
            <Button variant="outline" size="sm" disabled={disabled || page <= 1} onClick={() => onPageChange(page - 1)}>قبلی</Button>
            <div className="flex flex-wrap items-center gap-1" dir="ltr">
                {visiblePages.map((number, index) => (
                    <span key={number} className="inline-flex items-center gap-1">
                        {index > 0 && number - visiblePages[index - 1] > 1 && <span aria-hidden="true" className="px-1 text-muted">…</span>}
                        <button
                            type="button"
                            aria-label={`صفحه ${number}`}
                            aria-current={number === page ? 'page' : undefined}
                            disabled={disabled}
                            onClick={() => onPageChange(number)}
                            className={cn('h-9 min-w-9 rounded-sm px-2 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-accent-strong disabled:opacity-50', number === page ? 'bg-ink text-inverse' : 'text-ink hover:bg-surface-muted')}
                        >
                            {number}
                        </button>
                    </span>
                ))}
            </div>
            <Button variant="outline" size="sm" disabled={disabled || page >= lastPage} onClick={() => onPageChange(page + 1)}>بعدی</Button>
        </nav>
    );
}
