import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';
import { cn } from '../../lib/utils';

export const AlertDialog = AlertDialogPrimitive.Root;
export function AlertDialogTrigger(props) { return <AlertDialogPrimitive.Trigger data-ui="alert-dialog-trigger" {...props} />; }
export function AlertDialogCancel(props) { return <AlertDialogPrimitive.Cancel data-ui="alert-dialog-cancel" {...props} />; }
export function AlertDialogAction(props) { return <AlertDialogPrimitive.Action data-ui="alert-dialog-action" {...props} />; }

export function AlertDialogContent({ className = '', overlayClassName = '', ...props }) {
    return (
        <AlertDialogPrimitive.Portal>
            <AlertDialogPrimitive.Overlay
                data-ui="alert-dialog-overlay"
                className={cn('fixed inset-0 z-[80] bg-[color:var(--color-overlay)] backdrop-blur-sm', overlayClassName)}
            />
            <AlertDialogPrimitive.Content
                data-ui="alert-dialog"
                dir="rtl"
                className={cn('fixed left-1/2 top-1/2 z-[81] max-h-[min(88dvh,48rem)] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-border-strong bg-paper p-5 text-ink shadow-raised outline-none focus-visible:ring-2 focus-visible:ring-focus sm:p-7', className)}
                {...props}
            />
        </AlertDialogPrimitive.Portal>
    );
}

export function AlertDialogTitle({ className = '', ...props }) {
    return <AlertDialogPrimitive.Title data-ui="alert-dialog-title" className={cn('text-base font-extrabold text-ink sm:text-lg', className)} {...props} />;
}

export function AlertDialogDescription({ className = '', ...props }) {
    return <AlertDialogPrimitive.Description data-ui="alert-dialog-description" className={cn('mt-2 text-sm leading-7 text-muted', className)} {...props} />;
}
