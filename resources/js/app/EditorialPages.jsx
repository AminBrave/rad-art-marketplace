import { useEffect, useState } from 'react';
import { useLanguage } from './LanguageContext';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { ArtworkCard, EmptyState, ErrorState, Button, FormField, TextInput, TextareaField, SuccessState, Checkbox, AlertDialog, AlertDialogTrigger, AlertDialogCancel, AlertDialogAction, AlertDialogContent, AlertDialogTitle, AlertDialogDescription, CollectionCardSkeleton, CollectionDetailSkeleton, AdminEditorialSkeleton, PageHeader, SectionHeader, Container, DiscoveryHero, Breadcrumbs } from '../components/ui';
import { localizedValue } from '../utils/localizedContent';

export function CollectionIndexPage() {
    const { t, locale } = useLanguage();
    const collectionsQuery = useQuery({
        queryKey: ['collections'],
        queryFn: async ({ signal }) => {
            const { data } = await axios.get('/api/v1/collections', { signal });
            return data.data ?? [];
        },
        staleTime: 60_000,
    });
    const items = collectionsQuery.data ?? [];

    return <div className="min-h-[65vh]">
        <DiscoveryHero
            eyebrow={t("انتخاب سردبیر")}
            title={t("مجموعه‌های منتخب")}
            description={t("روایت‌های موضوعی و انتخاب‌های هنری راد آرت؛ هر مجموعه مسیری تازه برای کشف آثار است.")}
            breadcrumbs={<Breadcrumbs label={t("مسیر صفحه")} items={[{ label: t("خانه"), to: "/" }, { label: t("مجموعه‌ها") }]} />}
        />
        <Container as="section" width="wide" className="py-section sm:py-section-wide">
        {collectionsQuery.isError ? <ErrorState className="mt-8" title={t("دریافت مجموعه‌ها ممکن نشد")} description={t("لطفاً دوباره تلاش کنید.")} onRetry={() => collectionsQuery.refetch()} /> : collectionsQuery.isPending ? <div className="mt-9"><CollectionCardSkeleton count={6} /></div> : items.length ? <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{items.map((item) => <Link key={item.id} to={'/collections/' + item.slug} className="group border-y border-border bg-transparent px-1 py-7 transition-colors hover:border-terracotta sm:px-2"><p className="text-xs text-terracotta-strong">{item.artwork_count} {locale === 'en' ? 'selected artworks' : 'اثر منتخب'}</p><h2 className="mt-3 text-2xl font-black tracking-tight group-hover:text-terracotta-strong">{localizedValue(item, 'title', locale)}</h2><p className="mt-3 line-clamp-4 text-sm leading-7 text-muted">{localizedValue(item, 'intro', locale) || (locale === 'en' ? 'A selection of approved Rad Art artworks.' : 'انتخابی از آثار تأییدشده هنرمندان راد آرت.')}</p><span className="mt-6 inline-flex min-h-10 items-center text-sm font-bold underline underline-offset-4">{t("مشاهده مجموعه")}</span></Link>)}</div> : <EmptyState className="mt-8" title={t("هنوز مجموعه‌ای منتشر نشده است")} description={t("مجموعه‌های منتخب پس از آماده‌سازی در این بخش نمایش داده می‌شوند.")} />}
        </Container>
    </div>;
}

export function CollectionDetailPage() {
    const { t, locale } = useLanguage();
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
    if (collectionQuery.isError || !item) return <>
        <DiscoveryHero
            eyebrow={t("انتخاب سردبیر")}
            title={t("مجموعه در دسترس نیست")}
            description={t("ممکن است انتشار آن متوقف شده باشد یا نشانی تغییر کرده باشد.")}
            breadcrumbs={<Breadcrumbs label={t("مسیر صفحه")} items={[{ label: t("خانه"), to: "/" }, { label: t("مجموعه‌ها"), to: "/collections" }, { label: t("مجموعه در دسترس نیست") }]} />}
        />
        <Container as="div" width="wide" className="py-page"><ErrorState title={t("این مجموعه در دسترس نیست")} description={t("ممکن است انتشار آن متوقف شده باشد یا نشانی تغییر کرده باشد.")} onRetry={() => collectionQuery.refetch()} /><Link className="mt-5 inline-block text-sm font-bold underline" to="/collections">{t("بازگشت به مجموعه‌ها")}</Link></Container>
    </>;

    return <div className="min-h-[65vh]">
        <DiscoveryHero
            eyebrow={t("روایت منتخب راد آرت")}
            title={localizedValue(item, 'title', locale)}
            description={localizedValue(item, 'intro', locale)}
            descriptionClassName="whitespace-pre-line"
            breadcrumbs={<Breadcrumbs label={t("مسیر صفحه")} items={[{ label: t("خانه"), to: "/" }, { label: t("مجموعه‌ها"), to: "/collections" }, { label: localizedValue(item, 'title', locale) }]} />}
        />
        <Container as="section" width="wide" className="py-section sm:py-section-wide">
        {item.artworks?.length ? <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{item.artworks.map((artwork) => <ArtworkCard key={artwork.id} artwork={artwork} />)}</div> : <EmptyState className="mt-8" title={t("اثری در این مجموعه موجود نیست")} />}
        </Container>
    </div>;
}

export function AdminEditorialPage() {
    const { t, locale } = useLanguage();
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
    const [title, setTitle] = useState(''), [titleEn, setTitleEn] = useState(''), [intro, setIntro] = useState(''), [introEn, setIntroEn] = useState(''), [artworkIds, setArtworkIds] = useState([]);
    const [featuredIds, setFeaturedIds] = useState([]), [featuredIntros, setFeaturedIntros] = useState({}), [featuredIntrosEn, setFeaturedIntrosEn] = useState({});
    const [confirmUnpublishId, setConfirmUnpublishId] = useState(null);
    const [actionError, setActionError] = useState(''), [message, setMessage] = useState('');
    const loading = editorialQuery.isPending;
    const error = actionError || (editorialQuery.isError
        ? (t(editorialQuery.error.response?.data?.message || 'دریافت اطلاعات مدیریت محتوای منتخب انجام نشد.'))
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
        setFeaturedIntrosEn(Object.fromEntries(editorialQuery.data.featuredArtists.map((item) => [item.artist_profile_id, item.editorial_intro_en || ''])));
    }, [editorialQuery.data]);

    const reset = () => { setEditing(null); setTitle(''); setTitleEn(''); setIntro(''); setIntroEn(''); setArtworkIds([]); };
    const edit = (collection) => { setEditing(collection.id); setTitle(collection.title); setTitleEn(collection.title_en || ''); setIntro(collection.intro || ''); setIntroEn(collection.intro_en || ''); setArtworkIds(collection.artwork_ids || []); };
    const saveCollection = async (publish = false) => {
        if (!title.trim()) { setActionError(t('عنوان مجموعه الزامی است.')); return; }
        setActionError(''); setMessage('');
        try {
            const payload = { title, title_en: titleEn, intro, intro_en: introEn, artwork_ids: artworkIds };
            const response = await saveCollectionMutation.mutateAsync({ editing, payload, publish });
            setMessage(t(response.data.message || 'مجموعه ذخیره شد.')); reset(); await refreshEditorialQueries();
        } catch (e) { setActionError(t(e.response?.data?.message || e.response?.data?.errors?.title?.[0] || 'ذخیره مجموعه انجام نشد.')); }
    };
    const publish = async (collection, next) => {
        setActionError(''); setMessage('');
        try {
            const { data } = await publishCollectionMutation.mutateAsync({ collection, next });
            setMessage(t(data.message)); setConfirmUnpublishId(null); await refreshEditorialQueries();
        } catch (e) { setActionError(t(e.response?.data?.message || 'تغییر وضعیت انتشار انجام نشد.')); }
    };
    const moveCollection = (index, delta) => {
        const next = [...collections]; const target = index + delta;
        if (target < 0 || target >= next.length) return;
        [next[index], next[target]] = [next[target], next[index]]; setCollectionOrder(next.map((item) => item.id));
    };
    const saveCollectionOrder = async () => {
        setActionError(''); setMessage('');
        try { const { data } = await saveCollectionOrderMutation.mutateAsync(collections.map((item) => item.id)); setMessage(t(data.message)); await refreshEditorialQueries(); }
        catch (e) { setActionError(t(e.response?.data?.message || 'ثبت ترتیب مجموعه‌ها انجام نشد.')); }
    };
    const saveFeatured = async () => {
        setActionError(''); setMessage('');
        try {
            const selections = featuredIds.map((id) => ({ artist_profile_id: id, editorial_intro: featuredIntros[id] || '', editorial_intro_en: featuredIntrosEn[id] || '' }));
            const { data } = await saveFeaturedMutation.mutateAsync(selections);
            setMessage(t(data.message)); await refreshEditorialQueries();
        } catch (e) { setActionError(t(e.response?.data?.message || 'ذخیره انتخاب هنرمندان انجام نشد.')); }
    };
    return <Container as="section" width="wide" className="rd-workspace-content space-y-workspace-relaxed">
        <PageHeader bleed={false} eyebrow={t("سردبیری راد آرت")} title={t("مجموعه‌ها و هنرمندان منتخب")} description={t("فقط آثار تأییدشده و پروفایل‌های عمومی در خروجی عمومی نمایش داده می‌شوند. تغییرات انتشار ثبت رویداد می‌شوند.")} />
        {message && <SuccessState title={message} />}{error && <ErrorState title={t("عملیات انجام نشد")} description={t(error)} onRetry={load} />}
        {loading ? <AdminEditorialSkeleton /> : <>
            <section className="space-y-5">
                <SectionHeader title={t(editing ? 'ویرایش مجموعه' : 'ایجاد مجموعه تازه')} className="border-0 pb-0" />
                <FormField label={t("عنوان مجموعه")}><TextInput value={title} maxLength={160} onChange={(e) => setTitle(e.target.value)} /></FormField>
                <FormField label={t("عنوان مجموعه به انگلیسی")}><TextInput value={titleEn} maxLength={160} dir="ltr" className="text-start" onChange={(e) => setTitleEn(e.target.value)} /></FormField>
                <FormField label={t("مقدمه سردبیر")} hint={t("اختیاری؛ حداکثر ۲۰۰۰ نویسه.")}><TextareaField value={intro} onChange={(e) => setIntro(e.target.value)} rows={4} maxLength={2000} /></FormField>
                <FormField label={t("مقدمه سردبیر به انگلیسی")}><TextareaField value={introEn} onChange={(e) => setIntroEn(e.target.value)} rows={4} maxLength={2000} dir="ltr" className="text-start" /></FormField>
                <div><p className="mb-2 text-sm font-bold">{t("آثار مجموعه (حداکثر ۳۰ اثر)")}</p><div className="max-h-72 space-y-2 overflow-y-auto border border-border p-3">{options.artworks.map((work) => <Checkbox key={work.id} checked={artworkIds.includes(work.id)} disabled={!artworkIds.includes(work.id) && artworkIds.length >= 30} onChange={(e) => setArtworkIds((current) => e.target.checked ? [...current, work.id] : current.filter((id) => id !== work.id))} className="flex w-full items-start gap-3 py-1 text-sm"><span>{locale === 'en' ? (work.title_en || work.title) : work.title}<span className="block text-xs text-muted">{locale === 'en' ? (work.artist_en || work.artist) : work.artist}</span></span></Checkbox>)}</div><p className="mt-2 text-xs text-muted">{t('ترتیب انتخاب، ترتیب نمایش آثار در مجموعه خواهد بود.')}</p></div>
                <div className="flex flex-wrap gap-2"><Button onClick={() => saveCollection(false)} loading={busy}>{t(editing ? 'ذخیره تغییرات' : 'ذخیره پیش‌نویس')}</Button>{!editing && <Button variant="outline" disabled={busy} onClick={() => saveCollection(true)}>{t('ذخیره و انتشار')}</Button>}{editing && <Button variant="outline" disabled={busy} onClick={reset}>{t('لغو ویرایش')}</Button>}</div>
            </section>
            <section className="space-y-4"><SectionHeader title={t("مجموعه‌های ثبت‌شده")} actions={<><Button variant="outline" size="sm" onClick={saveCollectionOrder} disabled={busy || collections.length < 2}>{t('ذخیره ترتیب')}</Button><Button variant="outline" size="sm" onClick={load} loading={loading}>{t('به‌روزرسانی')}</Button></>} />
                {collections.length ? <div className="grid gap-3">{collections.map((collection, index) => <article key={collection.id} className="border-t border-border bg-transparent py-5 first:border-t-0 sm:px-1">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-black">{localizedValue(collection, 'title', locale)}</h3><span className={collection.status === 'published' ? 'bg-[color:color-mix(in_srgb,var(--color-olive)_10%,transparent)] px-2 py-1 text-[10px] font-bold text-olive' : 'bg-surface-muted px-2 py-1 text-[10px] font-bold text-muted'}>{t(collection.status === 'published' ? 'منتشرشده' : 'پیش‌نویس')}</span></div><p className="mt-2 text-xs text-muted">{(collection.artworks_count ?? 0).toLocaleString(locale === 'fa' ? 'fa-IR' : 'en-US')} {t('اثر در مجموعه')}</p><p dir="ltr" className="mt-1 break-all text-start text-[11px] text-muted">{collection.slug}</p></div>
                        <span className="text-xs font-bold text-muted">{t('جایگاه')} {index + 1}</span>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2 border-t border-border/70 pt-4">
                        <Button size="sm" variant="outline" disabled={busy || index === 0} onClick={() => moveCollection(index, -1)}>{t('انتقال به بالا')}</Button>
                        <Button size="sm" variant="outline" disabled={busy || index === collections.length - 1} onClick={() => moveCollection(index, 1)}>{t('انتقال به پایین')}</Button>
                        <Button size="sm" variant="outline" disabled={busy} onClick={() => edit(collection)}>{t("ویرایش مجموعه")}</Button>
                        {collection.status === 'published' ? (
                            <AlertDialog
                                open={confirmUnpublishId === collection.id}
                                onOpenChange={(open) => { if (!open && busy) return; setConfirmUnpublishId(open ? collection.id : null); if (open) setActionError(''); }}
                            >
                                <AlertDialogTrigger asChild>
                                    <Button size="sm" variant="danger" disabled={busy}>{t('توقف انتشار')}</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogTitle>{t('توقف انتشار این مجموعه را تأیید می‌کنید؟')}</AlertDialogTitle>
                                    <AlertDialogDescription>{t('این مجموعه از صفحه عمومی مجموعه‌های منتخب خارج می‌شود؛ محتوای آن حذف نخواهد شد.')}</AlertDialogDescription>
                                    {actionError && <p role="alert" className="mt-3 text-sm leading-6 text-danger">{t(actionError)}</p>}
                                    <div className="mt-5 flex flex-wrap justify-end gap-2">
                                        <AlertDialogCancel asChild>
                                            <Button size="sm" variant="ghost" disabled={busy}>{t('انصراف')}</Button>
                                        </AlertDialogCancel>
                                        <AlertDialogAction asChild>
                                            <Button size="sm" variant="danger" disabled={busy} onClick={(event) => { event.preventDefault(); publish(collection, false); }}>{t('تأیید توقف انتشار')}</Button>
                                        </AlertDialogAction>
                                    </div>
                                </AlertDialogContent>
                            </AlertDialog>
                        ) : (
                            <Button size="sm" variant="primary" disabled={busy} onClick={() => publish(collection, true)}>{t("انتشار مجموعه")}</Button>
                        )}
                    </div>
                </article>)}</div> : <EmptyState title="مجموعه‌ای ثبت نشده است" />}</section>
            <section className="space-y-5 border-y border-border bg-transparent py-6 sm:py-8">
                <SectionHeader title={t("هنرمندان منتخب")} description={t('انتخاب‌ها به ترتیب انتخاب شما در صفحه اصلی نمایش داده می‌شوند. بازه انتشار از طریق API قابل تنظیم است.')} className="border-0 pb-0" />
                <div className="grid gap-3 sm:grid-cols-2">
                    {options.artists.map((artist) => {
                        const artistName = locale === 'en' ? (artist.display_name_en || artist.display_name) : artist.display_name;
                        return (
                            <div key={artist.id} className="border-t border-border py-3 first:border-t-0">
                                <Checkbox checked={featuredIds.includes(artist.id)} onChange={(e) => setFeaturedIds((current) => e.target.checked ? [...current, artist.id] : current.filter((id) => id !== artist.id))} className="flex min-h-11 items-center gap-3 text-sm">{artistName}</Checkbox>
                                {featuredIds.includes(artist.id) && (
                                    <>
                                        <FormField label={t('معرفی کوتاه ') + artistName} className="mt-3">
                                            <TextInput placeholder={t('معرفی کوتاه سردبیر')} value={featuredIntros[artist.id] || ''} maxLength={500} onChange={(e) => setFeaturedIntros((current) => ({ ...current, [artist.id]: e.target.value }))} />
                                        </FormField>
                                        <FormField label={t("معرفی کوتاه هنرمند به انگلیسی")} className="mt-3">
                                            <TextInput dir="ltr" className="text-start" value={featuredIntrosEn[artist.id] || ''} maxLength={500} onChange={(e) => setFeaturedIntrosEn((current) => ({ ...current, [artist.id]: e.target.value }))} />
                                        </FormField>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
                <Button onClick={saveFeatured} loading={busy}>{t('ذخیره هنرمندان منتخب')}</Button>
            </section>
        </>}
    </Container>;
}
