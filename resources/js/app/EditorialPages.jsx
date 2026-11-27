import { useLanguage } from './LanguageContext';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import { ArtworkCard } from '../features/artworks';
import { EmptyState, ErrorState, PageHeader, Container } from '../shared/ui';
import { CollectionCardSkeleton, CollectionDetailSkeleton } from '../features/collections';
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

    return <Container as="div" width="wide" className="min-h-[65vh] py-12">
        <PageHeader eyebrow={t("انتخاب سردبیر")} title={t("مجموعه‌های منتخب")} description={t("روایت‌های موضوعی و انتخاب‌های هنری راد آرت؛ هر مجموعه مسیری تازه برای کشف آثار است.")} />
        {collectionsQuery.isError ? <ErrorState className="mt-8" title={t("دریافت مجموعه‌ها ممکن نشد")} description={t("لطفاً دوباره تلاش کنید.")} onRetry={() => collectionsQuery.refetch()} /> : collectionsQuery.isPending ? <div className="mt-9"><CollectionCardSkeleton count={6} /></div> : items.length ? <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{items.map((item) => <Link key={item.id} to={'/collections/' + item.slug} className="group border-y border-border bg-transparent px-1 py-7 transition-colors hover:border-terracotta sm:px-2"><p className="text-xs text-terracotta-strong">{item.artwork_count} {locale === 'en' ? 'selected artworks' : 'اثر منتخب'}</p><h2 className="mt-3 text-2xl font-black tracking-tight group-hover:text-terracotta-strong">{localizedValue(item, 'title', locale)}</h2><p className="mt-3 line-clamp-4 text-sm leading-7 text-muted">{localizedValue(item, 'intro', locale) || (locale === 'en' ? 'A selection of approved Rad Art artworks.' : 'انتخابی از آثار تأییدشده هنرمندان راد آرت.')}</p><span className="mt-6 inline-flex min-h-10 items-center text-sm font-bold underline underline-offset-4">{t("مشاهده مجموعه")}</span></Link>)}</div> : <EmptyState className="mt-8" title={t("هنوز مجموعه‌ای منتشر نشده است")} description={t("مجموعه‌های منتخب پس از آماده‌سازی در این بخش نمایش داده می‌شوند.")} />}
    </Container>;
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
    if (collectionQuery.isError || !item) return <Container as="div" width="wide" className="py-12"><ErrorState title={t("این مجموعه در دسترس نیست")} description={t("ممکن است انتشار آن متوقف شده باشد یا نشانی تغییر کرده باشد.")} onRetry={() => collectionQuery.refetch()} /><Link className="mt-5 inline-block text-sm font-bold underline" to="/collections">{t("بازگشت به مجموعه‌ها")}</Link></Container>;

    return <Container as="div" width="wide" className="min-h-[65vh] py-12">
        <nav aria-label="مسیر صفحه" className="text-sm text-muted"><Link to="/" className="underline">{t("خانه")}</Link><span className="mx-2">/</span><Link to="/collections" className="underline">{t("مجموعه‌ها")}</Link></nav>
        <PageHeader eyebrow={t("روایت منتخب راد آرت")} title={localizedValue(item, 'title', locale)} description={localizedValue(item, 'intro', locale)} className="mt-7 max-w-3xl" descriptionClassName="whitespace-pre-line leading-8" />
        {item.artworks?.length ? <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{item.artworks.map((artwork) => <ArtworkCard key={artwork.id} artwork={artwork} />)}</div> : <EmptyState className="mt-8" title={t("اثری در این مجموعه موجود نیست")} />}
    </Container>;
}

export { AdminEditorialPage } from '../features/admin';
