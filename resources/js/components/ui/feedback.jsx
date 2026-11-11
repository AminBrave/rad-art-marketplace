import { Button } from './primitives';
import { cn } from '../../lib/utils';

export function Skeleton({className='',width,height='1rem',rounded='md'}) {
 return <span aria-hidden="true" className={cn('block animate-pulse bg-muted',rounded==='full'?'rounded-full':rounded==='lg'?'rounded-lg':'rounded-md',className)} style={{width,height}}/>;
}
export function SkeletonLines({lines=3,className=''}) {
 return <div aria-label="در حال بارگذاری" role="status" className={cn('grid gap-3',className)}>{Array.from({length:lines},(_,index)=><Skeleton key={index} width={index===lines-1?'68%':'100%'} height=".8rem"/>)}<span className="sr-only">در حال بارگذاری…</span></div>;
}
export function EmptyState({title,description,action,className=''}) {
 return <section className={cn('grid justify-items-center gap-3 rounded-lg border border-dashed border-border bg-card px-5 py-10 text-center',className)} dir="rtl"><span aria-hidden="true" className="h-2 w-10 rounded-full bg-secondary"/><h2 className="text-base font-bold text-foreground">{title}</h2>{description&&<p className="max-w-lg text-sm leading-7 text-muted-foreground">{description}</p>}{action}</section>;
}
export function ErrorState({title='مشکلی پیش آمد',description,onRetry,retryLabel='تلاش دوباره',className=''}) {
 return <section role="alert" className={cn('grid justify-items-start gap-3 rounded-lg border border-destructive/30 bg-card p-5',className)} dir="rtl"><h2 className="font-bold text-destructive">{title}</h2>{description&&<p className="text-sm leading-7 text-muted-foreground">{description}</p>}{onRetry&&<Button variant="outline" size="sm" onClick={onRetry}>{retryLabel}</Button>}</section>;
}
export function SuccessState({title,description,className=''}) {
 return <div role="status" className={cn('rounded-lg border border-s-2 border-s-olive bg-card px-4 py-3',className)} dir="rtl"><p className="font-semibold text-olive">{title}</p>{description&&<p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>}</div>;
}
export function PermissionState({title='دسترسی مجاز نیست',description,className=''}) {
 return <section role="status" className={cn('rounded-lg border border-border bg-muted p-5',className)} dir="rtl"><h2 className="font-bold text-foreground">{title}</h2>{description&&<p className="mt-2 text-sm leading-7 text-muted-foreground">{description}</p>}</section>;
}
export function UploadFeedback({fileName,status='idle',progress=0,message}) {
 if(status==='idle'&&!message)return null;
 const safeProgress=Math.max(0,Math.min(100,Number(progress)||0));
 const labels={uploading:'در حال بارگذاری',success:'بارگذاری انجام شد',error:'بارگذاری ناموفق بود'};
 return <div className="grid gap-2 rounded-md border border-border bg-card p-3 text-sm" dir="rtl"><div className="flex flex-wrap items-center justify-between gap-2"><span className="font-semibold text-foreground">{fileName||'فایل انتخاب‌شده'}</span><span className={status==='error'?'text-destructive':status==='success'?'text-olive':'text-muted-foreground'}>{labels[status]??message}</span></div>{status==='uploading'&&<div role="progressbar" aria-label="پیشرفت بارگذاری" aria-valuemin={0} aria-valuemax={100} aria-valuenow={safeProgress} className="h-2 overflow-hidden rounded-full bg-muted"><span className="block h-full bg-primary transition-[width]" style={{width:`${safeProgress}%`}}/></div>}{message&&<p className="text-xs leading-6 text-muted-foreground">{message}</p>}</div>;
}
export function Toast({open=true,title,description,variant='info',onDismiss}) {
 if(!open)return null; const variants={success:'border-olive',error:'border-destructive',info:'border-primary'};
 return <div role={variant==='error'?'alert':'status'} aria-live={variant==='error'?'assertive':'polite'} className={`flex items-start justify-between gap-4 border-s-4 bg-card p-4 shadow-md ${variants[variant]??variants.info}`} dir="rtl"><div><p className="font-bold text-foreground">{title}</p>{description&&<p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>}</div>{onDismiss&&<button type="button" onClick={onDismiss} aria-label="بستن اعلان" className="rounded-sm px-2 py-1 text-muted-foreground hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring">×</button>}</div>;
}
