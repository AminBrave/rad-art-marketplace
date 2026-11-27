import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '../../lib/utils';

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export function DialogContent({ children, className = '', overlayClassName = '', placement = 'center', nonModalOverlay = false, overlayOpen = false, onFocusOutside, ...props }) {
    return (
        <DialogPrimitive.Portal>
            {nonModalOverlay && overlayOpen ? (
                <DialogPrimitive.Close asChild>
                    <button type="button" aria-label="Close dialog" className={cn('fixed inset-0 z-[var(--rd-z-overlay)] cursor-default border-0 bg-[color:var(--color-overlay)] p-0 backdrop-blur-[var(--overlay-backdrop-blur)]', overlayClassName)} />
                </DialogPrimitive.Close>
            ) : !nonModalOverlay ? (
                <DialogPrimitive.Overlay className={cn('fixed inset-0 z-[var(--rd-z-overlay)] bg-[color:var(--color-overlay)] backdrop-blur-[var(--overlay-backdrop-blur)]', overlayClassName)} />
            ) : null}
            <DialogPrimitive.Content
               
                className={cn(placement === 'drawer' ? 'fixed inset-y-0 end-0 start-auto top-0 z-[var(--rd-z-dialog)] h-dvh max-h-dvh w-[min(22rem,calc(100vw-2.75rem))] max-w-none translate-x-0 translate-y-0 overflow-y-auto border-y-0 border-e border-border bg-paper p-0 text-ink shadow-raised outline-none ring-0' : 'fixed left-1/2 top-1/2 z-[var(--rd-z-dialog)] max-h-[min(88dvh,48rem)] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto  border border-border bg-paper p-5 text-ink shadow-raised outline-none ring-1 ring-[color:color-mix(in_srgb,var(--color-ink)_6%,transparent)] sm:p-7', 'focus-visible:ring-2 focus-visible:ring-focus', className)}
                aria-modal={nonModalOverlay ? true : undefined}
                onFocusOutside={(event) => {
                    onFocusOutside?.(event);
                    if (nonModalOverlay) event.preventDefault();
                }}
                {...props}
            >
                {children}
            </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
    );
}

export function DialogTitle({ className = '', ...props }) {
    return <DialogPrimitive.Title className={cn('text-xl font-extrabold leading-heading tracking-[-.02em] text-ink', className)} {...props} />;
}

export function DialogDescription({ className = '', ...props }) {
    return <DialogPrimitive.Description className={cn('mt-2 text-sm leading-7 text-muted', className)} {...props} />;
}
