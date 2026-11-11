import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '../../lib/utils';

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;
export const DialogPortal = DialogPrimitive.Portal;

export function DialogOverlay({ className, ...props }) {
    return <DialogPrimitive.Overlay className={cn('fixed inset-0 z-50 bg-black/80', className)} {...props} />;
}
export function DialogContent({ children, className = '', overlayClassName = '', ...props }) {
    return <DialogPrimitive.Portal>
        <DialogOverlay className={overlayClassName} />
        <DialogPrimitive.Content className={cn('fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg', className)} {...props}>{children}</DialogPrimitive.Content>
    </DialogPrimitive.Portal>;
}
export function DialogHeader({ className, ...props }) {
    return <div className={cn('flex flex-col space-y-1.5 text-center sm:text-start', className)} {...props} />;
}
export function DialogFooter({ className, ...props }) {
    return <div className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)} {...props} />;
}
export function DialogTitle({ className = '', ...props }) {
    return <DialogPrimitive.Title className={cn('text-lg font-semibold leading-none tracking-tight', className)} {...props} />;
}
export function DialogDescription({ className = '', ...props }) {
    return <DialogPrimitive.Description className={cn('text-sm text-muted-foreground', className)} {...props} />;
}
