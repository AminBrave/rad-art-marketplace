import { createContext, useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/utils';

const SidebarContext = createContext({});

export function SidebarProvider({ children, className, ...props }) {
    return <SidebarContext.Provider value={{}}><div data-slot="sidebar-provider" className={cn('group/sidebar-wrapper flex min-h-svh w-full bg-background', className)} {...props}>{children}</div></SidebarContext.Provider>;
}

export function Sidebar({ children, side = 'right', className, ...props }) {
    return <aside data-slot="sidebar" data-side={side} className={cn('hidden w-60 shrink-0 flex-col border-e bg-sidebar text-sidebar-foreground lg:flex', className)} {...props}>{children}</aside>;
}

export function SidebarHeader({ className, ...props }) {
    return <div data-slot="sidebar-header" className={cn('flex flex-col gap-2 border-b border-sidebar-border p-4', className)} {...props} />;
}

export function SidebarContent({ className, ...props }) {
    return <div data-slot="sidebar-content" className={cn('flex min-h-0 flex-1 flex-col gap-2 overflow-auto p-2', className)} {...props} />;
}

export function SidebarGroup({ className, ...props }) {
    return <section data-slot="sidebar-group" className={cn('flex w-full min-w-0 flex-col p-2', className)} {...props} />;
}

export function SidebarGroupLabel({ className, ...props }) {
    return <h2 data-slot="sidebar-group-label" className={cn('px-2 py-1.5 text-xs font-medium text-sidebar-foreground/70', className)} {...props} />;
}

export function SidebarMenu({ className, ...props }) {
    return <ul data-slot="sidebar-menu" className={cn('flex w-full min-w-0 flex-col gap-1', className)} {...props} />;
}

export function SidebarMenuItem({ className, ...props }) {
    return <li className={cn('group/menu-item relative', className)} {...props} />;
}

export function SidebarMenuButton({ to, end, className, children, ...props }) {
    const classes = cn('flex min-h-9 w-full items-center gap-2 overflow-hidden rounded-md px-2 text-start text-sm outline-none transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring',
        className);
    return to ? <NavLink to={to} end={end} className={({ isActive }) => cn(classes, isActive && 'bg-sidebar-accent font-medium text-sidebar-accent-foreground')} {...props}>{children}</NavLink>
        : <button type="button" className={classes} {...props}>{children}</button>;
}

export function SidebarInset({ className, ...props }) {
    return <main data-slot="sidebar-inset" className={cn('min-w-0 flex-1 bg-background', className)} {...props} />;
}

export function SidebarFooter({ className, ...props }) {
    return <div data-slot="sidebar-footer" className={cn('mt-auto border-t border-sidebar-border p-3', className)} {...props} />;
}
