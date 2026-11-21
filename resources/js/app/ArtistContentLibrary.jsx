import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Link, useOutletContext } from 'react-router-dom';
import {
    Badge,
    Button,
    EmptyState,
    ErrorState,
    FormField,
    PageHeader,
    SectionHeader,
    SelectField,
    TextInput,
    TextareaField,
} from '../components/ui';

const publicationLabels = {
    draft: 'پیش‌نویس',
    published: 'منتشرشده',
    archived: 'بایگانی‌شده',
};
const contentTypeLabels = {
    artwork: 'اثر هنری',
    post: 'محتوا',
    reel: 'ویدئو',
};
const sourceLabels = { native: 'ثبت‌شده در راد آرت', instagram: 'اینستاگرام' };

function actionError(error, fallback) {
    if (error.response?.status === 409) return error.response.data?.message ?? 'این تغییر با وضعیت فعلی محتوا سازگار نیست.';
    if (error.response?.status === 403) return 'اجازه انجام این عملیات برای این حساب وجود ندارد.';
    if (error.response?.status === 422) return 'اطلاعات واردشده معتبر نیست؛ فیلدها را بررسی کنید.';
    return fallback;
}

function ControlButton({ children, variant = 'secondary', className = '', ...props }) {
    const variants = {
        primary: 'border-transparent bg-ink text-inverse hover:bg-terracotta',
        secondary: 'border-border-strong bg-paper text-ink hover:border-terracotta hover:text-terracotta-strong',
        quiet: 'border-transparent bg-surface-muted text-muted hover:bg-accent-surface hover:text-ink',
        danger: 'border-border bg-paper text-danger hover:border-danger hover:bg-danger-surface',
    };

    return (
        <Button
            type="button"
            variant="outline"
            className={`min-h-10 gap-2 rounded-md px-3 text-sm font-bold ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </Button>
    );
}

export default function ArtistContentLibrary() {
    const { user, profile, profileLoading, profileError } = useOutletContext();
    const queryClient = useQueryClient();
    const [filters, setFilters] = useState({ content_type: '', source: '', publication_status: '' });
    const [page, setPage] = useState(1);
    const [notice, setNotice] = useState('');
    const [actionErrorMessage, setActionErrorMessage] = useState('');
    const [selectedCollectionId, setSelectedCollectionId] = useState(null);
    const [selectedContentIds, setSelectedContentIds] = useState([]);
    const [showNewCollection, setShowNewCollection] = useState(false);
    const [collectionForm, setCollectionForm] = useState({ title: '', description: '' });
    const [newCollectionForm, setNewCollectionForm] = useState({ title: '', description: '' });
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);

    const contentQuery = useQuery({
        queryKey: ['artist-content', user?.id, filters, page],
        queryFn: async ({ signal }) => {
            const params = { page, per_page: 12 };
            Object.entries(filters).forEach(([key, value]) => {
                if (value) params[key] = value;
            });
            const { data } = await axios.get('/api/v1/artist/content', { params, signal });
            return data;
        },
        enabled: !profileLoading && Boolean(profile?.slug),
        placeholderData: (previous) => previous,
    });

    const collectionsQuery = useQuery({
        queryKey: ['artist-collections', user?.id],
        queryFn: async ({ signal }) => {
            const { data } = await axios.get('/api/v1/artist/collections', { params: { per_page: 100 }, signal });
            return data;
        },
        enabled: !profileLoading && Boolean(profile?.slug),
    });

    const contents = contentQuery.data?.data ?? [];
    const contentMeta = {
        current: contentQuery.data?.current_page ?? page,
        last: contentQuery.data?.last_page ?? 1,
        total: contentQuery.data?.total ?? 0,
    };
    const collections = collectionsQuery.data?.data ?? [];
    const selectedCollection = collections.find((item) => item.id === selectedCollectionId) ?? collections[0] ?? null;

    useEffect(() => {
        if (selectedCollection && selectedCollection.id !== selectedCollectionId) {
            setSelectedCollectionId(selectedCollection.id);
        }
    }, [selectedCollection, selectedCollectionId]);

    useEffect(() => {
        if (selectedCollection) {
            setCollectionForm({
                title: selectedCollection.title ?? '',
                description: selectedCollection.description ?? '',
            });
            setSelectedContentIds((selectedCollection.items ?? []).map((item) => item.id));
            setConfirmDeleteId(null);
        } else {
            setCollectionForm({ title: '', description: '' });
            setSelectedContentIds([]);
        }
    }, [selectedCollection]);

    const invalidateLibrary = async () => {
        await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['artist-content', user?.id] }),
            queryClient.invalidateQueries({ queryKey: ['artist-collections', user?.id] }),
        ]);
    };

    const contentAction = useMutation({
        mutationFn: async ({ id, action }) => {
            const { data } = await axios.post(`/api/v1/artist/content/${id}/${action}`);
            return data;
        },
        onSuccess: async (response) => {
            setNotice(response.message ?? 'تغییر ذخیره شد.');
            setActionErrorMessage('');
            await invalidateLibrary();
        },
        onError: (error) => {
            setNotice('');
            setActionErrorMessage(actionError(error, 'عملیات روی محتوا انجام نشد. دوباره تلاش کنید.'));
        },
    });

    const createCollection = useMutation({
        mutationFn: async (payload) => {
            const { data } = await axios.post('/api/v1/artist/collections', payload);
            return data;
        },
        onSuccess: async (response) => {
            setShowNewCollection(false);
            setNewCollectionForm({ title: '', description: '' });
            setNotice(response.message ?? 'مجموعه خصوصی ایجاد شد.');
            setActionErrorMessage('');
            await invalidateLibrary();
            setSelectedCollectionId(response.data?.id ?? null);
        },
        onError: (error) => setActionErrorMessage(actionError(error, 'ایجاد مجموعه انجام نشد.')),
    });

    const updateCollection = useMutation({
        mutationFn: async ({ id, payload }) => {
            const { data } = await axios.patch(`/api/v1/artist/collections/${id}`, payload);
            return data;
        },
        onSuccess: async (response) => {
            setNotice(response.message ?? 'مجموعه به‌روزرسانی شد.');
            setActionErrorMessage('');
            await invalidateLibrary();
        },
        onError: (error) => setActionErrorMessage(actionError(error, 'ذخیره مجموعه انجام نشد.')),
    });

    const saveMembership = useMutation({
        mutationFn: async ({ id, content_ids }) => {
            const { data } = await axios.put(`/api/v1/artist/collections/${id}/items`, { content_ids });
            return data;
        },
        onSuccess: async (response) => {
            setSelectedContentIds((response.data?.items ?? []).map((item) => item.id));
            setNotice(response.message ?? 'چیدمان مجموعه ذخیره شد.');
            setActionErrorMessage('');
            await invalidateLibrary();
        },
        onError: (error) => setActionErrorMessage(actionError(error, 'ذخیره محتوای مجموعه انجام نشد.')),
    });

    const collectionAction = useMutation({
        mutationFn: async ({ id, action }) => {
            const { data } = action === 'delete'
                ? await axios.delete(`/api/v1/artist/collections/${id}`)
                : await axios.post(`/api/v1/artist/collections/${id}/${action}`);
            return { ...data, action };
        },
        onSuccess: async ({ message, action }) => {
            setNotice(message ?? (action === 'delete' ? 'مجموعه حذف شد.' : 'وضعیت انتشار مجموعه تغییر کرد.'));
            setActionErrorMessage('');
            setConfirmDeleteId(null);
            await invalidateLibrary();
            if (action === 'delete') setSelectedCollectionId(null);
        },
        onError: (error) => setActionErrorMessage(actionError(error, 'عملیات روی مجموعه انجام نشد.')),
    });

    const reorderCollections = useMutation({
        mutationFn: async (collection_ids) => {
            const { data } = await axios.put('/api/v1/artist/collections/order', { collection_ids });
            return data;
        },
        onSuccess: async () => {
            setNotice('ترتیب مجموعه‌ها ذخیره شد.');
            await invalidateLibrary();
        },
        onError: (error) => setActionErrorMessage(actionError(error, 'تغییر ترتیب مجموعه‌ها انجام نشد.')),
    });

    const selectedIdSet = useMemo(() => new Set(selectedContentIds), [selectedContentIds]);
    const canReorderCollections = (collectionsQuery.data?.total ?? collections.length) <= collections.length;

    const toggleContent = (id, checked) => {
        setSelectedContentIds((current) => checked
            ? (current.includes(id) ? current : [...current, id])
            : current.filter((item) => item !== id));
    };

    const moveCollection = (index, direction) => {
        const next = [...collections];
        const target = index + direction;
        if (target < 0 || target >= next.length) return;
        [next[index], next[target]] = [next[target], next[index]];
        reorderCollections.mutate(next.map((item) => item.id));
    };

    const submitFilters = (key, value) => {
        setFilters((current) => ({ ...current, [key]: value }));
        setPage(1);
    };

    if (profileLoading) {
        return <div className="space-y-4" dir="rtl" role="status" aria-live="polite" aria-busy="true"><div className="h-10 w-48 animate-pulse rounded bg-surface-muted" /><div className="h-32 animate-pulse rounded bg-surface-muted" /><div className="h-64 animate-pulse rounded bg-surface-muted" /></div>;
    }

    if (profileError && !profile?.slug) {
        return <ErrorState title="پروفایل هنرمند در دسترس نیست" description={profileError} />;
    }

    if (!profile?.slug) {
        return (
            <section className="space-y-5" dir="rtl">
                <PageHeader eyebrow="استودیوی هنرمند" title="کتابخانه محتوای من" description="آثار و محتواهای خود را در یک فضای واحد سازمان‌دهی کنید." />
                <EmptyState title="ابتدا پروفایل هنرمند را تکمیل کنید" description="برای ساخت کتابخانه محتوا، ابتدا پروفایل هنرمند خود را ایجاد کنید." />
                <Link to="/dashboard/artist/profile" className="inline-flex min-h-11 items-center rounded-md bg-ink px-4 text-sm font-bold text-inverse no-underline">تکمیل پروفایل</Link>
            </section>
        );
    }

    return (
        <section className="space-y-8" dir="rtl">
            <PageHeader
                eyebrow="استودیوی هنرمند / کتابخانه"
                title="کتابخانه محتوای من"
                description="آثار ثبت‌شده در راد آرت را مرور کنید، برای انتشار تأیید کنید و آن‌ها را در مجموعه‌های اختصاصی بچینید."
                actions={<Badge variant="accent"> {contentMeta.total.toLocaleString('fa-IR')} محتوا</Badge>}
            />

            {profileError && <ErrorState title="پروفایل هنرمند دریافت نشد" description={profileError} />}
            {notice && <p role="status" aria-live="polite" className="rounded-md border border-border border-s-2 border-s-success bg-surface px-4 py-3 text-sm text-ink">{notice}</p>}
            {actionErrorMessage && <ErrorState title="عملیات انجام نشد" description={actionErrorMessage} />}

            <section className="grid gap-3 border border-border bg-surface-muted p-4 sm:grid-cols-3">
                <FormField label="نوع محتوا">
                    <SelectField value={filters.content_type} onChange={(event) => submitFilters('content_type', event.target.value)} aria-label="فیلتر نوع محتوا">
                        <option value="">همه انواع</option>
                        <option value="artwork">اثر هنری</option>
                        <option value="post">پست</option>
                        <option value="reel">ویدئو</option>
                    </SelectField>
                </FormField>
                <FormField label="منبع">
                    <SelectField value={filters.source} onChange={(event) => submitFilters('source', event.target.value)} aria-label="فیلتر منبع محتوا">
                        <option value="">همه منابع</option>
                        <option value="native">راد آرت</option>
                        <option value="instagram">اینستاگرام</option>
                    </SelectField>
                </FormField>
                <FormField label="وضعیت انتشار">
                    <SelectField value={filters.publication_status} onChange={(event) => submitFilters('publication_status', event.target.value)} aria-label="فیلتر وضعیت انتشار">
                        <option value="">همه وضعیت‌ها</option>
                        <option value="draft">پیش‌نویس</option>
                        <option value="published">منتشرشده</option>
                        <option value="archived">بایگانی‌شده</option>
                    </SelectField>
                </FormField>
            </section>

            <section className="space-y-4" aria-labelledby="artist-content-heading">
                <SectionHeader id="artist-content-heading" title="محتواهای من" description="محتواهای واردشده از منابع بیرونی فعلاً در حالت انتظار باقی می‌مانند تا اتصال و مجوزهای منبع بررسی شود." />
                {contentQuery.isPending ? (
                    <div className="grid gap-3" aria-label="در حال بارگذاری محتوا" aria-busy="true">
                        {[0, 1, 2].map((item) => <div key={item} className="h-32 animate-pulse rounded-md border border-border bg-surface-muted" />)}
                    </div>
                ) : contentQuery.isError ? (
                    <ErrorState title="کتابخانه بارگذاری نشد" description="دریافت محتوا انجام نشد. اتصال را بررسی و دوباره تلاش کنید." onRetry={() => contentQuery.refetch()} />
                ) : contents.length === 0 ? (
                    <EmptyState title="محتوایی در این بخش نیست" description={Object.values(filters).some(Boolean) ? 'فیلترها را پاک کنید تا سایر محتواها را ببینید.' : 'پس از ثبت اثر در استودیوی آثار، محتوای آن در این کتابخانه نیز نمایش داده می‌شود.'} />
                ) : (
                    <div className="grid gap-3">
                        {contents.map((item) => {
                            const approved = Boolean(item.artist_approved_at);
                            const artworkBlocked = item.content_type === 'artwork' && item.artwork?.status !== 'approved';
                            const imported = item.source !== 'native';
                            return (
                                <article key={item.id} className="grid min-w-0 gap-4 border border-border bg-paper p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:p-5">
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Badge variant="neutral">{contentTypeLabels[item.content_type] ?? item.content_type}</Badge>
                                            <Badge variant="neutral">{sourceLabels[item.source] ?? item.source}</Badge>
                                            <Badge variant={item.publication_status === 'published' ? 'success' : 'neutral'}>{publicationLabels[item.publication_status] ?? item.publication_status}</Badge>
                                            {approved && <Badge variant="success">تأیید هنرمند</Badge>}
                                        </div>
                                        <h3 className="mt-3 break-words text-base font-bold text-ink">{item.title || 'بدون عنوان'}</h3>
                                        {item.description && <p className="mt-1 whitespace-pre-line break-words text-sm leading-7 text-muted">{item.description}</p>}
                                        {item.artwork?.status && <p className="mt-2 text-xs text-muted">وضعیت بررسی مدیر: {item.artwork.status === 'approved' ? 'تأییدشده' : item.artwork.status === 'pending_review' ? 'در انتظار بررسی' : item.artwork.status}</p>}
                                        {imported && <p className="mt-2 text-xs leading-6 text-warning">محتوای منبع بیرونی تا تکمیل بررسی اتصال و مجوزها قابل تأیید یا انتشار نیست.</p>}
                                        {!profile.is_public && <p className="mt-2 text-xs text-warning">برای انتشار عمومی، ابتدا نمایش پروفایل هنرمند را فعال کنید.</p>}
                                    </div>
                                    <div className="flex min-w-0 flex-wrap items-center gap-2 sm:justify-end">
                                        {!approved && !imported && <ControlButton disabled={contentAction.isPending} onClick={() => contentAction.mutate({ id: item.id, action: 'approve' })}>تأیید من</ControlButton>}
                                        {item.publication_status === 'published' ? (
                                            <ControlButton variant="danger" disabled={contentAction.isPending} onClick={() => contentAction.mutate({ id: item.id, action: 'unpublish' })}>خروج از انتشار</ControlButton>
                                        ) : (
                                            <ControlButton variant="primary" disabled={contentAction.isPending || !approved || imported || !profile.is_public || artworkBlocked} onClick={() => contentAction.mutate({ id: item.id, action: 'publish' })}>انتشار</ControlButton>
                                        )}
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
                {contentMeta.last > 1 && (
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                        <p className="text-xs text-muted">صفحه {contentMeta.current.toLocaleString('fa-IR')} از {contentMeta.last.toLocaleString('fa-IR')}</p>
                        <div className="flex gap-2">
                            <ControlButton disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>قبلی</ControlButton>
                            <ControlButton disabled={page >= contentMeta.last} onClick={() => setPage((value) => Math.min(contentMeta.last, value + 1))}>بعدی</ControlButton>
                        </div>
                    </div>
                )}
            </section>

            <section className="space-y-5 border-t border-border pt-8" aria-labelledby="artist-collections-heading">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <SectionHeader id="artist-collections-heading" title="مجموعه‌های هنری من" description="مجموعه‌ها خصوصی هستند تا زمانی که خودتان آن‌ها را منتشر کنید." />
                    <ControlButton variant="primary" onClick={() => { setShowNewCollection((value) => !value); setActionErrorMessage(''); }}> {showNewCollection ? 'بستن فرم' : 'ساخت مجموعه'}</ControlButton>
                </div>

                {showNewCollection && (
                    <form onSubmit={(event) => { event.preventDefault(); createCollection.mutate(newCollectionForm); }} className="grid gap-4 border border-border bg-surface-muted p-4 sm:grid-cols-2">
                        <FormField label="عنوان مجموعه" required>
                            <TextInput value={newCollectionForm.title} onChange={(event) => setNewCollectionForm((value) => ({ ...value, title: event.target.value }))} maxLength={160} required placeholder="مثلاً: طراحی‌های شهری" />
                        </FormField>
                        <FormField label="توضیحات">
                            <TextareaField value={newCollectionForm.description} onChange={(event) => setNewCollectionForm((value) => ({ ...value, description: event.target.value }))} maxLength={2000} rows={2} placeholder="درباره این مجموعه بنویسید…" />
                        </FormField>
                        <div className="flex items-center gap-2 sm:col-span-2">
                            <ControlButton variant="primary" type="submit" disabled={createCollection.isPending}>{createCollection.isPending ? 'در حال ایجاد…' : 'ایجاد مجموعه خصوصی'}</ControlButton>
                            <span className="text-xs text-muted">مجموعه پس از ساخت خصوصی می‌ماند.</span>
                        </div>
                    </form>
                )}

                {collectionsQuery.isPending ? (
                    <div className="h-36 animate-pulse rounded-md border border-border bg-surface-muted" aria-busy="true" />
                ) : collectionsQuery.isError ? (
                    <ErrorState title="مجموعه‌ها بارگذاری نشدند" description="دریافت مجموعه‌ها انجام نشد." onRetry={() => collectionsQuery.refetch()} />
                ) : collections.length === 0 ? (
                    <EmptyState title="هنوز مجموعه‌ای نساخته‌اید" description="یک مجموعه خصوصی بسازید و آثار موردنظر را به ترتیب دلخواه در آن قرار دهید." />
                ) : (
                    <div className="grid gap-5 lg:grid-cols-[minmax(13rem,.8fr)_minmax(0,1.5fr)]">
                        <div className="space-y-2">
                            {collections.map((collection, index) => (
                                <div key={collection.id} className={`flex min-w-0 items-center gap-1 border p-2 ${selectedCollection?.id === collection.id ? 'border-terracotta bg-accent-surface' : 'border-border bg-paper'}`}>
                                    <button type="button" onClick={() => setSelectedCollectionId(collection.id)} aria-pressed={selectedCollection?.id === collection.id} className="min-h-11 min-w-0 flex-1 px-2 text-start text-sm font-bold text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus">
                                        <span className="block truncate">{collection.title}</span>
                                        <span className="mt-1 block text-xs font-normal text-muted">{(collection.items_count ?? collection.items?.length ?? 0).toLocaleString('fa-IR')} محتوا · {collection.visibility === 'public' ? 'عمومی' : 'خصوصی'}</span>
                                    </button>
                                    <div className="flex shrink-0 flex-col">
                                        <button type="button" aria-label={`انتقال ${collection.title} به بالا`} disabled={!canReorderCollections || index === 0 || reorderCollections.isPending} onClick={() => moveCollection(index, -1)} className="grid h-7 w-7 place-items-center rounded text-muted hover:bg-surface-muted disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus">↑</button>
                                        <button type="button" aria-label={`انتقال ${collection.title} به پایین`} disabled={!canReorderCollections || index === collections.length - 1 || reorderCollections.isPending} onClick={() => moveCollection(index, 1)} className="grid h-7 w-7 place-items-center rounded text-muted hover:bg-surface-muted disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus">↓</button>
                                    </div>
                                </div>
                            ))}
                            {!canReorderCollections && <p className="text-xs leading-6 text-warning">برای جابه‌جایی ترتیب، همه مجموعه‌ها باید در همین فهرست بارگذاری شوند.</p>}
                        </div>

                        {selectedCollection && (
                            <div className="min-w-0 space-y-5 border border-border bg-paper p-4 sm:p-5">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div>
                                        <p className="text-xs font-bold text-terracotta-strong">مدیریت مجموعه</p>
                                        <h3 className="mt-1 break-words text-lg font-extrabold text-ink">{selectedCollection.title}</h3>
                                    </div>
                                    <Badge variant={selectedCollection.visibility === 'public' ? 'success' : 'neutral'}>{selectedCollection.visibility === 'public' ? 'عمومی' : 'خصوصی'}</Badge>
                                </div>

                                <form onSubmit={(event) => { event.preventDefault(); updateCollection.mutate({ id: selectedCollection.id, payload: collectionForm }); }} className="grid gap-3">
                                    <FormField label="عنوان">
                                        <TextInput value={collectionForm.title} onChange={(event) => setCollectionForm((value) => ({ ...value, title: event.target.value }))} maxLength={160} required />
                                    </FormField>
                                    <FormField label="توضیحات">
                                        <TextareaField value={collectionForm.description} onChange={(event) => setCollectionForm((value) => ({ ...value, description: event.target.value }))} maxLength={2000} rows={2} />
                                    </FormField>
                                    <div><ControlButton variant="secondary" type="submit" disabled={updateCollection.isPending}>{updateCollection.isPending ? 'در حال ذخیره…' : 'ذخیره مشخصات'}</ControlButton></div>
                                </form>

                                <div className="border-t border-border pt-4">
                                    <SectionHeader title="انتخاب محتوا" level={3} description="محتوای انتخاب‌شده به ترتیب انتخاب در مجموعه قرار می‌گیرد." />
                                    {contents.length === 0 ? <p className="mt-3 text-sm text-muted">برای افزودن محتوا، ابتدا فهرست کتابخانه را بارگذاری کنید.</p> : (
                                        <div className="mt-3 grid max-h-72 gap-2 overflow-y-auto">
                                            {contents.map((item) => (
                                                <label key={item.id} className="flex min-h-11 items-center gap-3 border border-border bg-surface px-3 py-2 text-sm">
                                                    <input type="checkbox" checked={selectedIdSet.has(item.id)} onChange={(event) => toggleContent(item.id, event.target.checked)} className="h-4 w-4 accent-[var(--color-terracotta)]" />
                                                    <span className="min-w-0 flex-1 break-words font-medium text-ink">{item.title || 'بدون عنوان'}</span>
                                                    <span className="shrink-0 text-[11px] text-muted">{publicationLabels[item.publication_status] ?? item.publication_status}</span>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                                        <span className="text-xs text-muted">{selectedContentIds.length.toLocaleString('fa-IR')} محتوا انتخاب شده</span>
                                        <ControlButton variant="primary" disabled={saveMembership.isPending || selectedContentIds.length > 100} onClick={() => saveMembership.mutate({ id: selectedCollection.id, content_ids: selectedContentIds })}>{saveMembership.isPending ? 'در حال ذخیره…' : 'ذخیره اعضای مجموعه'}</ControlButton>
                                    </div>
                                    {selectedContentIds.length > 100 && <p role="alert" className="mt-2 text-xs text-danger">هر مجموعه حداکثر ۱۰۰ محتوا می‌پذیرد.</p>}
                                </div>

                                <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
                                    {selectedCollection.visibility === 'public' ? (
                                        <ControlButton variant="secondary" disabled={collectionAction.isPending} onClick={() => collectionAction.mutate({ id: selectedCollection.id, action: 'unpublish' })}>خصوصی‌کردن مجموعه</ControlButton>
                                    ) : (
                                        <ControlButton variant="primary" disabled={collectionAction.isPending} onClick={() => collectionAction.mutate({ id: selectedCollection.id, action: 'publish' })}>انتشار مجموعه</ControlButton>
                                    )}
                                    {confirmDeleteId === selectedCollection.id ? (
                                        <>
                                            <span className="text-xs text-danger">حذف این مجموعه قطعی است.</span>
                                            <ControlButton variant="danger" disabled={collectionAction.isPending} onClick={() => collectionAction.mutate({ id: selectedCollection.id, action: 'delete' })}>تأیید حذف</ControlButton>
                                            <ControlButton onClick={() => setConfirmDeleteId(null)}>انصراف</ControlButton>
                                        </>
                                    ) : (
                                        <ControlButton variant="danger" onClick={() => setConfirmDeleteId(selectedCollection.id)}>حذف مجموعه</ControlButton>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </section>
        </section>
    );
}
