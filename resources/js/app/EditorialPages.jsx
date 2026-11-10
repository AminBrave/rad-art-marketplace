import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import { ArtworkCard, EmptyState, ErrorState, SkeletonLines, Button, FormField, TextareaField, SuccessState } from '../components/ui';

export function CollectionIndexPage() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    useEffect(() => {
        const controller = new AbortController();
        axios.get('/api/v1/collections', { signal: controller.signal })
            .then(({ data }) => setItems(data.data ?? []))
            .catch((e) => { if (!axios.isCancel(e)) setError(true); })
            .finally(() => { if (!controller.signal.aborted) setLoading(false); });
        return () => controller.abort();
    }, []);
    return <main className="mx-auto min-h-[65vh] max-w-7xl px-5 py-12 sm:px-8 lg:px-10" dir="rtl">
        <header className="max-w-3xl border-b border-border pb-8"><p className="text-xs font-bold text-terracotta-strong">انتخاب سردبیر</p><h1 className="mt-3 text-3xl font-black sm:text-4xl">مجموعه‌های منتخب</h1><p className="mt-4 text-sm leading-8 text-muted">روایت‌های موضوعی و انتخاب‌های هنری راد آرت؛ هر مجموعه مسیری تازه برای کشف آثار است.</p></header>
        {error ? <ErrorState className="mt-8" title="دریافت مجموعه‌ها ممکن نشد" description="لطفاً دوباره تلاش کنید." onRetry={() => window.location.reload()} /> : loading ? <div className="mt-8"><SkeletonLines lines={5} /></div> : items.length ? <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{items.map((item) => <Link key={item.id} to={'/collections/' + item.slug} className="group border border-border bg-white p-6 transition-colors hover:border-terracotta"><p className="text-xs text-terracotta-strong">{item.artwork_count} اثر منتخب</p><h2 className="mt-3 text-xl font-black group-hover:text-terracotta-strong">{item.title}</h2><p className="mt-3 line-clamp-4 text-sm leading-7 text-muted">{item.intro || 'انتخابی از آثار تأییدشده هنرمندان راد آرت.'}</p><span className="mt-6 inline-block text-sm font-bold underline">مشاهده مجموعه</span></Link>)}</div> : <EmptyState className="mt-8" title="هنوز مجموعه‌ای منتشر نشده است" description="مجموعه‌های منتخب پس از آماده‌سازی در این بخش نمایش داده می‌شوند." />}
    </main>;
}

export function CollectionDetailPage() {
    const { slug } = useParams();
    const [item, setItem] = useState(null), [loading, setLoading] = useState(true), [error, setError] = useState(false);
    useEffect(() => {
        const controller = new AbortController();
        setLoading(true); setItem(null); setError(false);
        axios.get('/api/v1/collections/' + encodeURIComponent(slug), { signal: controller.signal })
            .then(({ data }) => setItem(data.data))
            .catch((e) => { if (!axios.isCancel(e)) setError(true); })
            .finally(() => { if (!controller.signal.aborted) setLoading(false); });
        return () => controller.abort();
    }, [slug]);
    if (loading) return <main className="mx-auto max-w-7xl px-5 py-12" dir="rtl"><SkeletonLines lines={8} /></main>;
    if (error || !item) return <main className="mx-auto max-w-7xl px-5 py-12" dir="rtl"><ErrorState title="این مجموعه در دسترس نیست" description="ممکن است انتشار آن متوقف شده باشد یا نشانی تغییر کرده باشد." /><Link className="mt-5 inline-block text-sm font-bold underline" to="/collections">بازگشت به مجموعه‌ها</Link></main>;
    return <main className="mx-auto min-h-[65vh] max-w-7xl px-5 py-12 sm:px-8 lg:px-10" dir="rtl">
        <nav aria-label="مسیر صفحه" className="text-sm text-muted"><Link to="/" className="underline">خانه</Link><span className="mx-2">/</span><Link to="/collections" className="underline">مجموعه‌ها</Link></nav>
        <header className="mt-7 max-w-3xl border-b border-border pb-8"><p className="text-xs font-bold text-terracotta-strong">روایت منتخب راد آرت</p><h1 className="mt-3 text-3xl font-black sm:text-4xl">{item.title}</h1>{item.intro && <p className="mt-5 whitespace-pre-line text-sm leading-9 text-muted">{item.intro}</p>}</header>
        {item.artworks?.length ? <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{item.artworks.map((artwork) => <ArtworkCard key={artwork.id} artwork={artwork} />)}</div> : <EmptyState className="mt-8" title="اثری در این مجموعه موجود نیست" />}
    </main>;
}

export function AdminEditorialPage() {
    const [options, setOptions] = useState({ artworks: [], artists: [] });
    const [collections, setCollections] = useState([]);
    const [featured, setFeatured] = useState([]);
    const [editing, setEditing] = useState(null);
    const [title, setTitle] = useState(''), [intro, setIntro] = useState(''), [artworkIds, setArtworkIds] = useState([]);
    const [featuredIds, setFeaturedIds] = useState([]);
    const [loading, setLoading] = useState(true), [busy, setBusy] = useState(false);
    const [error, setError] = useState(''), [message, setMessage] = useState('');
    const load = useCallback(async () => {
        setLoading(true); setError('');
        try {
            const [o, c, f] = await Promise.all([
                axios.get('/api/v1/admin/editorial/options'),
                axios.get('/api/v1/admin/editorial/collections'),
                axios.get('/api/v1/admin/editorial/featured-artists'),
            ]);
            setOptions(o.data.data); setCollections(c.data.data ?? []);
            setFeatured(f.data.data ?? []); setFeaturedIds((f.data.data ?? []).filter((x) => x.is_published).map((x) => x.artist_profile_id));
        } catch (e) { setError(e.response?.data?.message || 'دریافت اطلاعات مدیریت محتوای منتخب انجام نشد.'); }
        finally { setLoading(false); }
    }, []);
    useEffect(() => { load(); }, [load]);
    const reset = () => { setEditing(null); setTitle(''); setIntro(''); setArtworkIds([]); };
    const edit = (collection) => { setEditing(collection.id); setTitle(collection.title); setIntro(collection.intro || ''); setArtworkIds(collection.artwork_ids || []); };
    const saveCollection = async (publish = false) => {
        if (!title.trim()) { setError('عنوان مجموعه الزامی است.'); return; }
        setBusy(true); setError(''); setMessage('');
        try {
            const payload = { title, intro, artwork_ids: artworkIds };
            const response = editing
                ? await axios.patch('/api/v1/admin/editorial/collections/' + editing, payload)
                : await axios.post('/api/v1/admin/editorial/collections', { ...payload, publish });
            setMessage(response.data.message || 'مجموعه ذخیره شد.'); reset(); await load();
        } catch (e) { setError(e.response?.data?.message || e.response?.data?.errors?.title?.[0] || 'ذخیره مجموعه انجام نشد.'); }
        finally { setBusy(false); }
    };
    const publish = async (collection, next) => {
        setBusy(true); setError(''); setMessage('');
        try { const { data } = await axios.patch('/api/v1/admin/editorial/collections/' + collection.id + '/publication', { publish: next }); setMessage(data.message); await load(); }
        catch (e) { setError(e.response?.data?.message || 'تغییر وضعیت انتشار انجام نشد.'); }
        finally { setBusy(false); }
    };
    const saveFeatured = async () => {
        setBusy(true); setError(''); setMessage('');
        try {
            const selections = featuredIds.map((id) => ({ artist_profile_id: id, editorial_intro: featured.find((x) => x.artist_profile_id === id)?.editorial_intro || '' }));
            const { data } = await axios.put('/api/v1/admin/editorial/featured-artists', { selections });
            setMessage(data.message); await load();
        } catch (e) { setError(e.response?.data?.message || 'ذخیره انتخاب هنرمندان انجام نشد.'); }
        finally { setBusy(false); }
    };
    return <section className="space-y-8" dir="rtl">
        <header className="border-b border-border pb-6"><p className="text-xs font-bold text-terracotta-strong">سردبیری راد آرت</p><h1 className="mt-2 text-3xl font-black">مجموعه‌ها و هنرمندان منتخب</h1><p className="mt-3 text-sm leading-7 text-muted">فقط آثار تأییدشده و پروفایل‌های عمومی در خروجی عمومی نمایش داده می‌شوند. تغییرات انتشار ثبت رویداد می‌شوند.</p></header>
        {message && <SuccessState title={message} />}{error && <ErrorState title="عملیات انجام نشد" description={error} onRetry={load} />}
        {loading ? <SkeletonLines lines={8} /> : <>
            <section className="space-y-4 border border-border bg-white p-5 sm:p-7">
                <h2 className="text-xl font-black">{editing ? 'ویرایش مجموعه' : 'ایجاد مجموعه تازه'}</h2>
                <FormField label="عنوان مجموعه"><input className="ra-control w-full" value={title} maxLength={160} onChange={(e) => setTitle(e.target.value)} /></FormField>
                <FormField label="مقدمه سردبیر" hint="اختیاری؛ حداکثر ۲۰۰۰ نویسه."><TextareaField value={intro} onChange={(e) => setIntro(e.target.value)} rows={4} maxLength={2000} /></FormField>
                <div><p className="mb-2 text-sm font-bold">آثار مجموعه (حداکثر ۳۰ اثر)</p><div className="max-h-72 space-y-2 overflow-y-auto border border-border p-3">{options.artworks.map((work) => <label key={work.id} className="flex items-start gap-3 py-1 text-sm"><input type="checkbox" checked={artworkIds.includes(work.id)} disabled={!artworkIds.includes(work.id) && artworkIds.length >= 30} onChange={(e) => setArtworkIds((current) => e.target.checked ? [...current, work.id] : current.filter((id) => id !== work.id))} /><span>{work.title}<span className="block text-xs text-muted">{work.artist}</span></span></label>)}</div><p className="mt-2 text-xs text-muted">ترتیب انتخاب، ترتیب نمایش آثار در مجموعه خواهد بود.</p></div>
                <div className="flex flex-wrap gap-2"><Button onClick={() => saveCollection(false)} loading={busy}>{editing ? 'ذخیره تغییرات' : 'ذخیره پیش‌نویس'}</Button>{!editing && <Button variant="outline" disabled={busy} onClick={() => saveCollection(true)}>ذخیره و انتشار</Button>}{editing && <Button variant="outline" disabled={busy} onClick={reset}>لغو ویرایش</Button>}</div>
            </section>
            <section className="space-y-4"><div className="flex items-center justify-between"><h2 className="text-xl font-black">مجموعه‌های ثبت‌شده</h2><Button variant="outline" size="sm" onClick={load} loading={loading}>به‌روزرسانی</Button></div>
                {collections.length ? collections.map((collection) => <article key={collection.id} className="flex flex-wrap items-center justify-between gap-4 border border-border bg-white p-4"><div><h3 className="font-bold">{collection.title}</h3><p className="mt-1 text-xs text-muted">{collection.artworks_count ?? 0} اثر · {collection.status === 'published' ? 'منتشرشده' : 'پیش‌نویس'} · <span dir="ltr">{collection.slug}</span></p></div><div className="flex flex-wrap gap-2"><Button size="sm" variant="outline" disabled={busy} onClick={() => edit(collection)}>ویرایش</Button><Button size="sm" variant={collection.status === 'published' ? 'danger' : 'primary'} disabled={busy} onClick={() => publish(collection, collection.status !== 'published')}>{collection.status === 'published' ? 'توقف انتشار' : 'انتشار'}</Button></div></article>) : <EmptyState title="مجموعه‌ای ثبت نشده است" />}</section>
            <section className="space-y-4 border border-border bg-white p-5 sm:p-7"><h2 className="text-xl font-black">هنرمندان منتخب</h2><p className="text-sm leading-7 text-muted">انتخاب‌ها به ترتیب انتخاب شما در صفحه اصلی نمایش داده می‌شوند. بازه انتشار از طریق API قابل تنظیم است.</p><div className="grid gap-3 sm:grid-cols-2">{options.artists.map((artist) => <label key={artist.id} className="flex items-center gap-3 border border-border p-3 text-sm"><input type="checkbox" checked={featuredIds.includes(artist.id)} onChange={(e) => setFeaturedIds((current) => e.target.checked ? [...current, artist.id] : current.filter((id) => id !== artist.id))} />{artist.display_name}</label>)}</div><Button onClick={saveFeatured} loading={busy}>ذخیره هنرمندان منتخب</Button></section>
        </>}
    </section>;
}
