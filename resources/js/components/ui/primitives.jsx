import { cloneElement, isValidElement, useId } from 'react';
import { cn } from '../../lib/utils';
import { Button as ShadcnButton } from './button';
import { Badge as ShadcnBadge } from './badge';
import { Input } from './input';
import { Textarea } from './textarea';
import { Label } from './label';

const variants={primary:'default',secondary:'secondary',outline:'outline',ghost:'ghost',danger:'destructive'};
const sizes={sm:'sm',md:'default',lg:'lg'};
export function Button({children,variant='primary',size='md',loading=false,disabled=false,className='',...props}){
 return <ShadcnButton variant={variants[variant]??'default'} size={sizes[size]??'default'} disabled={disabled||loading} aria-busy={loading||undefined} className={className} {...props}>{loading&&<span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-current border-e-transparent"/>}{children}</ShadcnButton>;
}
export function IconButton({children,label,size='md',className='',...props}){
 const dimensions={sm:'h-9 w-9',md:'h-10 w-10',lg:'h-11 w-11'};
 return <ShadcnButton type="button" variant="outline" size="icon" aria-label={label} title={label} className={cn('shrink-0 !p-0',dimensions[size]??dimensions.md,className)} {...props}>{children}</ShadcnButton>;
}
const badgeVariants={neutral:'secondary',success:'success',warning:'warning',danger:'destructive',info:'info',accent:'accent'};
export function Badge({children,variant='neutral',className=''}){return <ShadcnBadge variant={badgeVariants[variant]??'secondary'} className={className}>{children}</ShadcnBadge>;}
export function FormField({id,label,hint,error,required=false,children,className=''}) {
 const generatedId=useId(); const fieldId=id??generatedId;
 const describedBy=[hint?`${fieldId}-hint`:null,error?`${fieldId}-error`:null].filter(Boolean).join(' ')||undefined;
 const control=isValidElement(children)?cloneElement(children,{id:fieldId,'aria-invalid':error?true:children.props['aria-invalid'],'aria-describedby':describedBy??children.props['aria-describedby']}):children;
 return <div className={cn('grid gap-2',className)}><Label htmlFor={fieldId} className="text-foreground">{label}{required&&<span aria-hidden="true" className="ms-1 text-destructive">*</span>}</Label>{control}{hint&&<p id={`${fieldId}-hint`} className="text-xs leading-6 text-muted-foreground">{hint}</p>}{error&&<p id={`${fieldId}-error`} role="alert" className="text-xs leading-6 text-destructive">{error}</p>}</div>;
}
export function TextInput({className='',...props}){return <Input className={className} {...props}/>;}
export function TextareaField({className='',rows=4,...props}){return <Textarea rows={rows} className={cn('min-h-28 resize-y leading-7',className)} {...props}/>;}
export function SelectField({className='',children,...props}){return <select className={cn('flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',className)} {...props}>{children}</select>;}
export function SearchField({value,onChange,onSearch,placeholder='جست‌وجو…',label='جست‌وجو',buttonLabel='جست‌وجو',disabled=false,className=''}) {
 const searchId=useId(); const submit=(event)=>{event.preventDefault();onSearch?.(value);};
 return <form onSubmit={submit} role="search" className={cn('flex min-w-0 flex-col gap-2 sm:flex-row',className)}><label className="sr-only" htmlFor={searchId}>{label}</label><TextInput id={searchId} type="search" value={value} onChange={onChange} placeholder={placeholder} disabled={disabled}/><Button type="submit" size="md" disabled={disabled}>{buttonLabel}</Button></form>;
}
