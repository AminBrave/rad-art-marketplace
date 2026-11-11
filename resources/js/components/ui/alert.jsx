import { cn } from '../../lib/utils';
const variants={default:'border-border bg-background text-foreground',destructive:'border-destructive/40 text-destructive [&>svg]:text-destructive',success:'border-olive/30 text-olive [&>svg]:text-olive'};
export function Alert({className,variant='default',...props}){return <div role="alert" className={cn('relative w-full rounded-lg border p-4 [&>svg~*]:ps-7',variants[variant]??variants.default,className)} {...props}/>;}
export function AlertTitle({className,...props}){return <h5 className={cn('mb-1 font-medium leading-none tracking-tight',className)} {...props}/>;}
export function AlertDescription({className,...props}){return <div className={cn('text-sm [&_p]:leading-relaxed',className)} {...props}/>;}
