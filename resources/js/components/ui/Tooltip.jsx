import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '../../lib/utils';

export function Tooltip({
    children,
    content,
    side = 'top',
    sideOffset = 6,
    delayDuration = 500,
    className = '',
}) {
    if (content == null || content === '') return children;

    return (
        <TooltipPrimitive.Provider delayDuration={delayDuration}>
            <TooltipPrimitive.Root>
                <TooltipPrimitive.Trigger asChild>
                    {children}
                </TooltipPrimitive.Trigger>
                <TooltipPrimitive.Portal>
                    <TooltipPrimitive.Content
                        data-ui="tooltip"
                        side={side}
                        sideOffset={sideOffset}
                        dir="rtl"
                        className={cn('z-[100] max-w-64 rounded-md bg-ink px-3 py-2 text-xs font-medium leading-6 text-inverse shadow-raised', className)}
                    >
                        {content}
                        <TooltipPrimitive.Arrow className="fill-ink" />
                    </TooltipPrimitive.Content>
                </TooltipPrimitive.Portal>
            </TooltipPrimitive.Root>
        </TooltipPrimitive.Provider>
    );
}
