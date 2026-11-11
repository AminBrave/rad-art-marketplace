import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { Link } from 'react-router-dom';
import { Button } from './primitives';
import { cn } from '../../lib/utils';

export const Tabs = TabsPrimitive.Root;

export function TabsList({ className = '', ...props }) {
    return (
        <TabsPrimitive.List
            className={cn('inline-flex h-9 max-w-full items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground', className)}
            {...props}
        />
    );
}

export function TabsTrigger({ className = '', ...props }) {
    return (
        <TabsPrimitive.Trigger
            className={cn('inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm', className)}
            {...props}
        />
    );
}

export function TabsContent({ className = '', ...props }) {
    return <TabsPrimitive.Content className={cn('mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2', className)} {...props} />;
}

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

export function DropdownMenuContent({ className = '', sideOffset = 6, ...props }) {
    return (
        <DropdownMenuPrimitive.Portal>
            <DropdownMenuPrimitive.Content
                sideOffset={sideOffset}
                align="end"
                dir="rtl"
                className={cn('z-50 min-w-32 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md', className)}
                {...props}
            />
        </DropdownMenuPrimitive.Portal>
    );
}

export function DropdownMenuItem({ className = '', ...props }) {
    return (
        <DropdownMenuPrimitive.Item
            className={cn('relative flex min-h-8 cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50', className)}
            {...props}
        />
    );
}

export function DropdownMenuLabel({ className = '', ...props }) {
    return <DropdownMenuPrimitive.Label className={cn('px-2 py-1.5 text-xs font-semibold text-muted-foreground', className)} {...props} />;
}

export function DropdownMenuSeparator({ className = '', ...props }) {
    return <DropdownMenuPrimitive.Separator className={cn('-mx-1 my-1 h-px bg-muted', className)} {...props} />;
}

export function Breadcrumbs({ items = [], className = '' }) {
    return (
        <nav aria-label="مسیر صفحه" className={className}>
            <ol className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                {items.map((item, index) => {
                    const current = index === items.length - 1;
                    return (
                        <li key={item.to ?? item.label} className="inline-flex items-center gap-2">
                            {index > 0 && <span aria-hidden="true" className="text-subtle">/</span>}
                            {current ? (
                                <span aria-current="page" className="font-semibold text-foreground">{item.label}</span>
                            ) : (
                                <Link to={item.to} className="underline-offset-4 hover:text-primary hover:underline">{item.label}</Link>
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
        <nav aria-label="صفحه‌بندی" className={`flex flex-wrap items-center justify-between gap-3 ${className}`}>
            <Button variant="outline" size="sm" disabled={disabled || page <= 1} onClick={() => onPageChange(page - 1)}>قبلی</Button>
            <div className="flex flex-wrap items-center gap-1" dir="ltr">
                {visiblePages.map((number, index) => (
                    <span key={number} className="inline-flex items-center gap-1">
                        {index > 0 && number - visiblePages[index - 1] > 1 && <span aria-hidden="true" className="px-1 text-muted-foreground">…</span>}
                        <button
                            type="button"
                            aria-label={`صفحه ${number}`}
                            aria-current={number === page ? 'page' : undefined}
                            disabled={disabled}
                            onClick={() => onPageChange(number)}
                            className={`h-9 min-w-9 rounded-sm px-2 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-terracotta-strong disabled:opacity-50 ${number === page ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted'}`}
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
