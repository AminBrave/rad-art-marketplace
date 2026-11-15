import * as DialogPrimitive from '@radix-ui/react-dialog';

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export function DialogContent({ children, className = '', overlayClassName = '', ...props }) {
    return (
        <DialogPrimitive.Portal>
            <DialogPrimitive.Overlay className={`fixed inset-0 z-50 bg-[color:var(--color-overlay)] backdrop-blur-[var(--overlay-backdrop-blur)] ${overlayClassName}`} />
            <DialogPrimitive.Content
                dir="rtl"
                className={`fixed left-1/2 top-1/2 z-50 max-h-[min(88dvh,48rem)] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-border-strong bg-paper p-5 text-ink shadow-raised outline-none ring-1 ring-[color:color-mix(in_srgb,var(--color-ink)_6%,transparent)] focus-visible:ring-2 focus-visible:ring-focus sm:p-7 ${className}`}
                {...props}
            >
                {children}
            </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
    );
}

export function DialogTitle({ className = '', ...props }) {
    return <DialogPrimitive.Title className={`text-xl font-extrabold leading-heading tracking-[-.02em] text-ink ${className}`} {...props} />;
}

export function DialogDescription({ className = '', ...props }) {
    return <DialogPrimitive.Description className={`mt-2 text-sm leading-7 text-muted ${className}`} {...props} />;
}
