import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { ArtworkCard, EmptyState, ErrorState, Button, FormField, TextareaField, SuccessState, Checkbox, AlertDialog, AlertDialogTrigger, AlertDialogCancel, AlertDialogAction, AlertDialogContent, AlertDialogTitle, AlertDialogDescription, CollectionCardSkeleton, CollectionDetailSkeleton, AdminEditorialSkeleton, PageHeader, SectionHeader } from '../components/ui';

export function CollectionIndexPage() {
    const collectionsQuery = useQuery({
        queryKey: ['collections'],
        queryFn: async ({ signal }) => {
            const { data } = await axios.get('/api/v1/collections', { signal });
            return data.data ?? [];
        },
        staleTime: 60_000,
    });
    const items = collectionsQuery.data ?? [];

    return <main className="mx-auto min-h-[65vh] max-w-7xl px-5 py-12 sm:px-8 lg:px-10" dir="rtl">
        <PageHeader eyebrow="انتخاب سردبیر" title="مجموعه‌های منتخب" description="روایت‌های موضوعی و انتخاب‌های هنری راد آرت؛ هر مجموعه مسیری تازه برای کشف آثار است." className="max-w-3xl" />
        {collectionsQuery.isError ? <ErrorState className="mt-8" title="دریافت مجموعه‌ها ممکن نشد" description="لطفاً دوباره تلاش کنید." onRetry={() => collectionsQuery.refetch()} /> : collectionsQuery.isPending ? <div className="mt-9"><CollectionCardSkeleton count={6} /></div> : items.length ? <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{items.map((item) => <Link key={item.id} to={'/collections/' + item.slug} className="group border border-border bg-paper p-6 transition-colors hover:border-terracotta"><p className="text-xs text-terracotta-strong">{item.artwork_count} اثر منتخب</p><h2 className="mt-3 text-xl font-black group-hover:text-terracotta-strong">{item.title}</h2><p className="mt-3 line-clamp-4 text-sm leading-7 text-muted">{item.intro || 'انتخابی از آثار تأییدشده هنرمندان راد آرت.'}</p><span className="mt-6 inline-block text-sm font-bold underline">مشاهده مجموعه</span></Link>)}</div> : <EmptyState className="mt-8" title="هنوز مجموعه‌ای منتشر نشده است" description="مجموعه‌های منتخب پس از آماده‌سازی در این بخش نمایش داده می‌شوند." />}
    </main>;
}

export function CollectionDetailPage() {
    const { slug } = useParams();
    const collectionQuery = useQuery({
        queryKey: ['collection', slug],
        queryFn: async ({ signal }) => {
            const { data } = await axios.get('/api/v1/collections/' + encodeURIComponent(slug), { signal });
            return data.data;
        },
        enabled: Boolean(slug),
        staleTime: 60_000,
    });
    const item = collectionQuery.data ?? null;

    if (collectionQuery.isPending) return <CollectionDetailSkeleton />;
    if (collectionQuery.isError || !item) return <main className="mx-auto max-w-7xl px-5 py-12" dir="rtl"><ErrorState title="این مجموعه در دسترس نیست" description="ممکن است انتشار آن متوقف شده باشد یا نشانی تغییر کرده باشد." onRetry={() => collectionQuery.refetch()} /><Link className="mt-5 inline-block text-sm font-bold underline" to="/collections">بازگشت به مجموعه‌ها</Link></main>;

    return <main className="mx-auto min-h-[65vh] max-w-7xl px-5 py-12 sm:px-8 lg:px-10" dir="rtl">
        <nav aria-label="مسیر صفحه" className="text-sm text-muted"><Link to="/" className="underline">خانه</Link><span className="mx-2">/</span><Link to="/collections" className="underline">مجموعه‌ها</Link></nav>
        <PageHeader eyebrow="روایت منتخب راد آرت" title={item.title} description={item.intro} className="mt-7 max-w-3xl" descriptionClassName="whitespace-pre-line leading-8" />
        {item.artworks?.length ? <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{item.artworks.map((artwork) => <ArtworkCard key={artwork.id} artwork={artwork} />)}</div> : <EmptyState className="mt-8" title="اثری در این مجموعه موجود نیست" />}
    </main>;
}

export function AdminEditorialPage() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const editorialKey = ['admin', 'editorial', user?.id];
    const editorialQuery = useQuery({
        queryKey: editorialKey,
        queryFn: async ({ signal }) => {
            const [optionsResponse, collectionsResponse, featuredResponse] = await Promise.all([
                axios.get('/api/v1/admin/editorial/options', { signal }),
                axios.get('/api/v1/admin/editorial/collections', { signal }),
                axios.get('/api/v1/admin/editorial/featured-artists', { signal }),
            ]);
            return {
                options: optionsResponse.data.data ?? { artworks: [], artists: [] },
                collections: collectionsResponse.data.data ?? [],
                featuredArtists: featuredResponse.data.data ?? [],
            };
        },
        enabled: user?.role === 'admin' && Boolean(user?.id),
    });
    const options = editorialQuery.data?.options ?? { artworks: [], artists: [] };
    const [collectionOrder, setCollectionOrder] = useState([]);
    const [editing, setEditing] = useState(null);
    const [title, setTitle] = useState(''), [intro, setIntro] = useState(''), [artworkIds, setArtworkIds] = useState([]);
    const [featuredIds, setFeaturedIds] = useState([]), [featuredIntros, setFeaturedIntros] = useState({});
    const [confirmUnpublishId, setConfirmUnpublishId] = useState(null);
    const [actionError, setActionError] = useState(''), [message, setMessage] = useState('');
    const loading = editorialQuery.isPending;
    const error = actionError || (editorialQuery.isError
        ? (editorialQuery.error.response?.data?.message || 'دریافت اطلاعات مدیریت محتوای منتخب انجام نشد.')
        : '');
    const load = () => { setActionError(''); return editorialQuery.refetch(); };
    const saveCollectionMutation = useMutation({
        mutationKey: ['admin', 'editorial', 'save-collection', user?.id],
        mutationFn: ({ editing, payload, publish }) => editing
            ? axios.patch('/api/v1/admin/editorial/collections/' + editing, payload)
            : axios.post('/api/v1/admin/editorial/collections', { ...payload, publish }),
    });
    const publishCollectionMutation = useMutation({
        mutationKey: ['admin', 'editorial', 'publish-collection', user?.id],
        mutationFn: ({ collection, next }) => axios.patch('/api/v1/admin/editorial/collections/' + collection.id + '/publication', { publish: next }),
    });
    const saveCollectionOrderMutation = useMutation({
        mutationKey: ['admin', 'editorial', 'collection-order', user?.id],
        mutationFn: (collectionIds) => axios.put('/api/v1/admin/editorial/collections/order', { collection_ids: collectionIds }),
    });
    const saveFeaturedMutation = useMutation({
        mutationKey: ['admin', 'editorial', 'featured-artists', user?.id],
        mutationFn: (selections) => axios.put('/api/v1/admin/editorial/featured-artists', { selections }),
    });
    const busy = saveCollectionMutation.isPending
        || publishCollectionMutation.isPending
        || saveCollectionOrderMutation.isPending
        || saveFeaturedMutation.isPending;
    const refreshEditorialQueries = () => Promise.all([
        queryClient.invalidateQueries({ queryKey: editorialKey }),
        queryClient.invalidateQueries({ queryKey: ['collections'] }),
        queryClient.invalidateQueries({ queryKey: ['collection'] }),
        queryClient.invalidateQueries({ queryKey: ['home', 'collections'] }),
        queryClient.invalidateQueries({ queryKey: ['home', 'featured-artists'] }),
    ]);
    const sourceCollections = editorialQuery.data?.collections ?? [];
    const collections = collectionOrder.length
        ? collectionOrder.map((id) => sourceCollections.find((item) => item.id === id)).filter(Boolean)
        : sourceCollections;

    useEffect(() => {
        if (!editorialQuery.data) return;
        setCollectionOrder(editorialQuery.data.collections.map((item) => item.id));
        setFeaturedIds(editorialQuery.data.featuredArtists.filter((item) => item.is_published).map((item) => item.artist_profile_id));
        setFeaturedIntros(Object.fromEntries(editorialQuery.data.featuredArtists.map((item) => [item.artist_profile_id, item.editorial_intro || ''])));
    }, [editorialQuery.data]);

    const reset = () => { setEditing(null); setTitle(''); setIntro(''); setArtworkIds([]); };
    const edit = (collection) => { setEditing(collection.id); setTitle(collection.title); setIntro(collection.intro || ''); setArtworkIds(collection.artwork_ids || []); };
    const saveCollection = async (publish = false) => {
        if (!title.trim()) { setActionError('عنوان مجموعه الزامی است.'); return; }
        setActionError(''); setMessage('');
        try {
            const payload = { title, intro, artwork_ids: artworkIds };
            const response = await saveCollectionMutation.mutateAsync({ editing, payload, publish });
            setMessage(response.data.message || 'مجموعه ذخیره شد.'); reset(); await refreshEditorialQueries();
        } catch (e) { setActionError(e.response?.data?.message || e.response?.data?.errors?.title?.[0] || 'ذخیره مجموعه انجام نشد.'); }
    };
    const publish = async (collection, next) => {
        setActionError(''); setMessage('');
        try {
            const { data } = await publishCollectionMutation.mutateAsync({ collection, next });
            setMessage(data.message); setConfirmUnpublishId(null); await refreshEditorialQueries();
        } catch (e) { setActionError(e.response?.data?.message || 'تغییر وضعیت انتشار انجام نشد.'); }
    };
    const moveCollection = (index, delta) => {
        const next = [...collections]; const target = index + delta;
        if (target < 0 || target >= next.length) return;
        [next[index], next[target]] = [next[target], next[index]]; setCollectionOrder(next.map((item) => item.id));
    };
    const saveCollectionOrder = async () => {
        setActionError(''); setMessage('');
        try { const { data } = await saveCollectionOrderMutation.mutateAsync(collections.map((item) => item.id)); setMessage(data.message); await refreshEditorialQueries(); }
        catch (e) { setActionError(e.response?.data?.message || 'ثبت ترتیب مجموعه‌ها انجام نشد.'); }
    };
    const saveFeatured = async () => {
        setActionError(''); setMessage('');
        try {
            const selections = featuredIds.map((id) => ({ artist_profile_id: id, editorial_intro: featuredIntros[id] || '' }));
            const { data } = await saveFeaturedMutation.mutateAsync(selections);
            setMessage(data.message); await refreshEditorialQueries();
        } catch (e) { setActionError(e.response?.data?.message || 'ذخیره انتخاب هنرمندان انجام نشد.'); }
    };
    return <section className="space-y-8" dir="rtl">
        <PageHeader eyebrow="سردبیری راد آرت" title="مجموعه‌ها و هنرمندان منتخب" description="فقط آثار تأییدشده و پروفایل‌های عمومی در خروجی عمومی نمایش داده می‌شوند. تغییرات انتشار ثبت رویداد می‌شوند." />
        {message && <SuccessState title={message} />}{error && <ErrorState title="عملیات انجام نشد" description={error} onRetry={load} />}
        {loading ? <AdminEditorialSkeleton /> : <>
            <section className="space-y-4 border border-border bg-paper p-5 sm:p-7">
                <SectionHeader title={editing ? 'ویرایش مجموعه' : 'ایجاد مجموعه تازه'} className="border-0 pb-0" />
                <FormField label="عنوان مجموعه"><input className="w-full min-h-11 rounded-md border border-border-strong bg-paper px-3.5 py-2 font-sans text-sm text-ink transition-colors placeholder:text-subtle focus-visible:border-focus focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus disabled:cursor-not-allowed disabled:bg-surface-muted disabled:opacity-65 aria-[invalid=true]:border-danger w-full" value={title} maxLength={160} onChange={(e) => setTitle(e.target.value)} /></FormField>
                <FormField label="مقدمه سردبیر" hint="اختیاری؛ حداکثر ۲۰۰۰ نویسه."><TextareaField value={intro} onChange={(e) => setIntro(e.target.value)} rows={4} maxLength={2000} /></FormField>
                <div><p className="mb-2 text-sm font-bold">آثار مجموعه (حداکثر ۳۰ اثر)</p><div className="max-h-72 space-y-2 overflow-y-auto border border-border p-3">{options.artworks.map((work) => <Checkbox key={work.id} checked={artworkIds.includes(work.id)} disabled={!artworkIds.includes(work.id) && artworkIds.length >= 30} onChange={(e) => setArtworkIds((current) => e.target.checked ? [...current, work.id] : current.filter((id) => id !== work.id))} className="flex w-full items-start gap-3 py-1 text-sm"><span>{work.title}<span className="block text-xs text-muted">{work.artist}</span></span></Checkbox>)}</div><p className="mt-2 text-xs text-muted">ترتیب انتخاب، ترتیب نمایش آثار در مجموعه خواهد بود.</p></div>
                <div className="flex flex-wrap gap-2"><Button onClick={() => saveCollection(false)} loading={busy}>{editing ? 'ذخیره تغییرات' : 'ذخیره پیش‌نویس'}</Button>{!editing && <Button variant="outline" disabled={busy} onClick={() => saveCollection(true)}>ذخیره و انتشار</Button>}{editing && <Button variant="outline" disabled={busy} onClick={reset}>لغو ویرایش</Button>}</div>
            </section>
            <section className="space-y-4"><SectionHeader title="مجموعه‌های ثبت‌شده" actions={<><Button variant="outline" size="sm" onClick={saveCollectionOrder} disabled={busy || collections.length < 2}>ذخیره ترتیب</Button><Button variant="outline" size="sm" onClick={load} loading={loading}>به‌روزرسانی</Button></>} />
                {collections.length ? <div className="grid gap-3">{collections.map((collection, index) => <article key={collection.id} className="border border-border bg-paper p-4 sm:p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-black">{collection.title}</h3><span className={collection.status === 'published' ? 'bg-[color:color-mix(in_srgb,var(--color-olive)_10%,transparent)] px-2 py-1 text-[10px] font-bold text-olive' : 'bg-surface-muted px-2 py-1 text-[10px] font-bold text-muted'}>{collection.status === 'published' ? 'منتشرشده' : 'پیش‌نویس'}</span></div><p className="mt-2 text-xs text-muted">{(collection.artworks_count ?? 0).toLocaleString('fa-IR')} اثر در مجموعه</p><p dir="ltr" className="mt-1 break-all text-left text-[11px] text-muted">{collection.slug}</p></div>
                        <span className="text-xs font-bold text-muted">جایگاه {index + 1}</span>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
                        <Button size="sm" variant="outline" disabled={busy || index === 0} onClick={() => moveCollection(index, -1)}>انتقال به بالا</Button>
                        <Button size="sm" variant="outline" disabled={busy || index === collections.length - 1} onClick={() => moveCollection(index, 1)}>انتقال به پایین</Button>
                        <Button size="sm" variant="outline" disabled={busy} onClick={() => edit(collection)}>ویرایش مجموعه</Button>
                        {collection.status === 'published' ? (
                            <AlertDialog
                                open={confirmUnpublishId === collection.id}
                                onOpenChange={(open) => setConfirmUnpublishId(open ? collection.id : null)}
                            >
                                <AlertDialogTrigger asChild>
                                    <Button size="sm" variant="danger" disabled={busy}>توقف انتشار</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogTitle>توقف انتشار این مجموعه را تأیید می‌کنید؟</AlertDialogTitle>
                                    <AlertDialogDescription>این مجموعه از صفحه عمومی مجموعه‌های منتخب خارج می‌شود؛ محتوای آن حذف نخواهد شد.</AlertDialogDescription>
                                    <div className="mt-5 flex flex-wrap justify-end gap-2">
                                        <AlertDialogCancel asChild>
                                            <Button size="sm" variant="ghost" disabled={busy}>انصراف</Button>
                                        </AlertDialogCancel>
                                        <AlertDialogAction asChild>
                                            <Button size="sm" variant="danger" disabled={busy} onClick={(event) => { event.preventDefault(); publish(collection, false); }}>تأیید توقف انتشار</Button>
                                        </AlertDialogAction>
                                    </div>
                                </AlertDialogContent>
                            </AlertDialog>
                        ) : (
                            <Button size="sm" variant="primary" disabled={busy} onClick={() => publish(collection, true)}>انتشار مجموعه</Button>
                        )}
                    </div>
                </article>)}</div> : <EmptyState title="مجموعه‌ای ثبت نشده است" />}</section>
            <section className="space-y-4 border border-border bg-paper p-5 sm:p-7"><SectionHeader title="هنرمندان منتخب" description="انتخاب‌ها به ترتیب انتخاب شما در صفحه اصلی نمایش داده می‌شوند. بازه انتشار از طریق API قابل تنظیم است." className="border-0 pb-0" /><div className="grid gap-3 sm:grid-cols-2">{options.artists.map((artist) => <div key={artist.id} className="border border-border p-3"><Checkbox checked={featuredIds.includes(artist.id)} onChange={(e) => setFeaturedIds((current) => e.target.checked ? [...current, artist.id] : current.filter((id) => id !== artist.id))} className="flex min-h-11 items-center gap-3 text-sm">{artist.display_name}</Checkbox>{featuredIds.includes(artist.id) && <input aria-label={'معرفی کوتاه ' + artist.display_name} className="w-full min-h-11 rounded-md border border-border-strong bg-paper px-3.5 py-2 font-sans text-sm text-ink transition-colors placeholder:text-subtle focus-visible:border-focus focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus disabled:cursor-not-allowed disabled:bg-surface-muted disabled:opacity-65 aria-[invalid=true]:border-danger mt-3 w-full" placeholder="معرفی کوتاه سردبیر" value={featuredIntros[artist.id] || ''} maxLength={500} onChange={(e) => setFeaturedIntros((current) => ({ ...current, [artist.id]: e.target.value }))} />}</div>)}</div><Button onClick={saveFeatured} loading={busy}>ذخیره هنرمندان منتخب</Button></section>
        </>}
    </section>;
}
