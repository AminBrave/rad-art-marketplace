import * as DialogPrimitive from '@radix-ui/react-dialog';

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export function DialogContent({ children, className = '', overlayClassName = '', placement = 'center', ...props }) {
    return (
        <DialogPrimitive.Portal>
            <DialogPrimitive.Overlay data-ui="dialog-overlay" className={`fixed inset-0 z-50 bg-[color:var(--color-overlay)] backdrop-blur-sm ${overlayClassName}`} />
            <DialogPrimitive.Content
                data-ui="dialog"
                dir="rtl"
                className={`${placement === 'drawer' ? 'fixed inset-y-0 right-0 left-auto top-0 z-50 h-dvh max-h-dvh w-[min(22rem,calc(100vw-2.75rem))] max-w-none translate-x-0 translate-y-0 overflow-y-auto rounded-none border-y-0 border-e border-border bg-paper p-0 text-ink shadow-raised outline-none ring-0' : 'fixed left-1/2 top-1/2 z-50 max-h-[min(88dvh,48rem)] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-border-strong bg-paper p-5 text-ink shadow-raised outline-none ring-1 ring-[color:color-mix(in_srgb,var(--color-ink)_6%,transparent)] sm:p-7'} focus-visible:ring-2 focus-visible:ring-focus ${className}`}
                {...props}
            >
                {children}
            </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
    );
}

export function DialogTitle({ className = '', ...props }) {
    return <DialogPrimitive.Title data-ui="dialog-title" className={`text-xl font-extrabold leading-heading tracking-[-.02em] text-ink ${className}`} {...props} />;
}

export function DialogDescription({ className = '', ...props }) {
    return <DialogPrimitive.Description data-ui="dialog-description" className={`mt-2 text-sm leading-7 text-muted ${className}`} {...props} />;
}
