import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';
import { cn } from '../../lib/utils';

export const AlertDialog = AlertDialogPrimitive.Root;
export const AlertDialogTrigger = AlertDialogPrimitive.Trigger;
export const AlertDialogCancel = AlertDialogPrimitive.Cancel;
export const AlertDialogAction = AlertDialogPrimitive.Action;

export function AlertDialogContent({ className = '', overlayClassName = '', ...props }) {
    return (
        <AlertDialogPrimitive.Portal>
            <AlertDialogPrimitive.Overlay
                className={cn('fixed inset-0 z-[80] bg-[color:var(--color-overlay)] backdrop-blur-[var(--overlay-backdrop-blur)]', overlayClassName)}
            />
            <AlertDialogPrimitive.Content
               
                className={cn('fixed left-1/2 top-1/2 z-[81] max-h-[min(88dvh,48rem)] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto  border border-border bg-paper p-5 text-ink shadow-raised outline-none focus-visible:ring-2 focus-visible:ring-focus sm:p-7', className)}
                {...props}
            />
        </AlertDialogPrimitive.Portal>
    );
}

export function AlertDialogTitle({ className = '', ...props }) {
    return <AlertDialogPrimitive.Title className={cn('text-base font-extrabold text-ink sm:text-lg', className)} {...props} />;
}

export function AlertDialogDescription({ className = '', ...props }) {
    return <AlertDialogPrimitive.Description className={cn('mt-2 text-sm leading-7 text-muted', className)} {...props} />;
}
