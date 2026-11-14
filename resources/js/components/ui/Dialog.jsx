import * as DialogPrimitive from '@radix-ui/react-dialog';

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export function DialogContent({ children, className = '', overlayClassName = '', ...props }) {
    return (
        <DialogPrimitive.Portal>
            <DialogPrimitive.Overlay className={`fixed inset-0 z-50 bg-ink/55 ${overlayClassName}`} />
            <DialogPrimitive.Content
                dir="rtl"
                className={`fixed left-1/2 top-1/2 z-50 max-h-[85vh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-border bg-paper p-6 text-ink shadow-raised outline-none focus-visible:ring-2 focus-visible:ring-terracotta-strong sm:p-8 ${className}`}
                {...props}
            >
                {children}
            </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
    );
}

export function DialogTitle({ className = '', ...props }) {
    return <DialogPrimitive.Title className={`text-xl font-bold leading-relaxed ${className}`} {...props} />;
}

export function DialogDescription({ className = '', ...props }) {
    return <DialogPrimitive.Description className={`mt-2 text-sm leading-7 text-muted ${className}`} {...props} />;
}
