import { useEffect, useState } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import { ArtworkCard, EmptyState, ErrorState, SearchField, SelectField, Skeleton } from '../components/ui';

export default function ArtworkCatalogue() {
    const [params,setParams]=useSearchParams();
    const search=params.get('q')??'', category=params.get('category')??'';
    const page=Math.max(1,Number.parseInt(params.get('page')??'1',10)||1);
    const [searchInput,setSearchInput]=useState(search), [categories,setCategories]=useState([]), [artworks,setArtworks]=useState([]);
    const [meta,setMeta]=useState({current_page:1,last_page:1,total:0}), [loading,setLoading]=useState(true), [error,setError]=useState(false), [retry,setRetry]=useState(0);
    useEffect(()=>{setSearchInput(search);},[search]);
    useEffect(()=>{let active=true;const controller=new AbortController();axios.get('/api/v1/categories',{signal:controller.signal}).then(({data})=>{if(active)setCategories(data.data??[]);}).catch((requestError)=>{if(active&&!axios.isCancel(requestError))setCategories([]);});return()=>{active=false;controller.abort();};},[]);
    useEffect(()=>{let active=true;const controller=new AbortController();setLoading(true);setError(false);axios.get('/api/v1/artworks',{params:{q:search||undefined,category:category||undefined,page},signal:controller.signal}).then(({data})=>{if(active){setArtworks(data.data??[]);setMeta({current_page:data.current_page??page,last_page:data.last_page??1,total:data.total??0});}}).catch((requestError)=>{if(active&&!axios.isCancel(requestError))setError(true);}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;controller.abort();};},[search,category,page,retry]);
    const updatePage=(next)=>setParams({...search?{q:search}:{},...category?{category}:{},page:String(next)});
    const submitSearch=(value)=>setParams({...value.trim()?{q:value.trim()}:{},...category?{category}:{}});

    return <main className="mx-auto min-h-[65vh] max-w-7xl px-5 py-12 sm:px-8 lg:px-10" dir="rtl">
        <header className="border-b border-border pb-8"><p className="text-xs font-bold text-terracotta-strong">آرشیو عمومی</p><h1 className="mt-2 text-3xl font-black sm:text-4xl">گالری آثار</h1><p className="mt-3 max-w-2xl text-sm leading-7 text-muted">در آثار تأییدشده هنرمندان جست‌وجو کنید. آثار در انتظار بررسی یا خصوصی در این فهرست نمایش داده نمی‌شوند.</p></header>
        <div className="mt-7 grid gap-3 sm:grid-cols-[minmax(0,1fr)_15rem_auto]"><SearchField value={searchInput} onChange={e=>setSearchInput(e.target.value)} onSearch={submitSearch} label="جست‌وجو در آثار" placeholder="عنوان، توضیحات یا تکنیک…" /><SelectField value={category} onChange={e=>setParams({...search?{q:search}:{},...e.target.value?{category:e.target.value}:{}})} aria-label="فیلتر دسته‌بندی"><option value="">همه دسته‌ها</option>{categories.map(item=><option key={item.id} value={item.slug}>{item.name}</option>)}</SelectField>{(search||category)&&<button type="button" onClick={()=>{setSearchInput('');setParams({});}} className="border border-border px-5 py-2 text-sm font-semibold hover:border-ink">پاک‌کردن فیلترها</button>}</div>
        <p className="mt-6 text-xs text-muted">{loading?'در حال دریافت آثار…':<>{meta.total.toLocaleString('fa-IR')} اثر</>}</p>
        {loading?<div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{[0,1,2,3,4,5].map(n=><Skeleton key={n} height="22rem" />)}</div>:error?<ErrorState className="mt-8" title="دریافت گالری با خطا روبه‌رو شد" description="اتصال را بررسی کنید و دوباره تلاش کنید." onRetry={()=>setRetry(n=>n+1)} />:artworks.length?<div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{artworks.map(artwork=><ArtworkCard key={artwork.id} artwork={artwork} />)}</div>:<EmptyState className="mt-8" title="اثری با این مشخصات پیدا نشد" description="عبارت جست‌وجو یا دسته‌بندی را تغییر دهید." />}
        {!loading&&!error&&meta.last_page>1&&<nav aria-label="صفحه‌بندی آثار" className="mt-10 flex items-center justify-center gap-4"><button type="button" disabled={page<=1} onClick={()=>updatePage(page-1)} className="border border-border px-4 py-2 text-sm font-semibold disabled:opacity-40">قبلی</button><span className="text-sm text-muted">صفحه {meta.current_page.toLocaleString('fa-IR')} از {meta.last_page.toLocaleString('fa-IR')}</span><button type="button" disabled={page>=meta.last_page} onClick={()=>updatePage(page+1)} className="border border-border px-4 py-2 text-sm font-semibold disabled:opacity-40">بعدی</button></nav>}
    </main>;
}
