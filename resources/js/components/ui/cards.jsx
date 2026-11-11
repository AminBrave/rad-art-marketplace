import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatArtworkPrice } from '../../utils/formatArtworkPrice';

function ArtworkImage({ src, title }) {
    const [failed, setFailed] = useState(false);

    if (!src || failed) {
        return <span role="img" aria-label={`تصویر اثر ${title} در دسترس نیست`} className="px-4 text-center text-sm text-muted">تصویر اثر در دسترس نیست</span>;
    }

    return <img src={src} alt={title} loading="lazy" decoding="async" onError={() => setFailed(true)} className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.02]" />;
}

export function ArtworkCard({ artwork, className = '' }) {
    if (!artwork) return null;
    const title = artwork.title ?? 'اثر هنری';
    const artistName = artwork.artist?.display_name ?? artwork.artist?.name ?? '';
    const price = formatArtworkPrice(artwork.price);

    return (
        <article className={`group min-w-0 ${className}`}>
            <Link to={`/artworks/${artwork.slug}`} className="block outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus">
                <div className="relative overflow-hidden bg-surface-muted">
                    <div className="ra-artwork-frame aspect-[4/5] bg-surface-muted p-0">
                        {artwork.image_url ? <ArtworkImage src={artwork.image_url} title={title} /> : <ArtworkImage src={null} title={title} />}
                    </div>
                    <span aria-hidden="true" className="pointer-events-none absolute inset-0 border border-ink/5 transition-colors group-hover:border-terracotta/50" />
                </div>
                <div className="grid gap-1.5 px-0.5 pb-2 pt-4">
                    <div className="flex min-h-5 items-center justify-between gap-3">
                        {artwork.category?.name ? <span className="text-[11px] font-semibold text-terracotta-strong">{artwork.category.name}</span> : <span />}
                        <span className="text-[11px] text-subtle transition-transform group-hover:-translate-x-1" aria-hidden="true">←</span>
                    </div>
                    <h3 className="line-clamp-2 text-base font-bold leading-7 text-ink transition-colors group-hover:text-terracotta-strong">{title}</h3>
                    {artistName && <p className="text-sm text-muted">{artistName}</p>}
                    <p className="mt-1 text-sm font-semibold text-ink">{price}</p>
                </div>
            </Link>
        </article>
    );
}

export function ArtistCard({ artist, className = '' }) {
    if (!artist) return null;
    const name = artist.display_name ?? artist.name ?? 'هنرمند';
    const initial = name.trim().slice(0, 1) || 'ه';

    return (
        <article className={`group relative min-w-0 overflow-hidden border border-border bg-white transition duration-300 hover:-translate-y-1 hover:border-border-strong hover:shadow-soft ${className}`} dir="rtl">
            <Link to={artist.slug ? `/artists/${artist.slug}` : '/artists'} className="flex h-full flex-col p-5 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus sm:p-6">
                <div className="flex items-start justify-between gap-4">
                    <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-sand bg-surface-muted text-xl font-black text-terracotta-strong transition-colors group-hover:bg-ink group-hover:text-white" aria-hidden="true">
                        {initial}
                    </div>
                    <span className="pt-1 text-[11px] font-semibold tracking-wide text-subtle">هنرمند راد آرت</span>
                </div>
                <div className="mt-5 min-w-0 flex-1">
                    <h3 className="text-lg font-black leading-8 text-ink transition-colors group-hover:text-terracotta-strong">{name}</h3>
                    {artist.city && <p className="mt-1 text-xs font-medium text-muted">{artist.city}</p>}
                    {artist.bio ? (
                        <p className="mt-4 line-clamp-3 text-sm leading-7 text-muted">{artist.bio}</p>
                    ) : (
                        <p className="mt-4 text-sm leading-7 text-subtle">برای آشنایی با مسیر هنری و آثار این هنرمند، پروفایل او را ببینید.</p>
                    )}
                </div>
                <span className="mt-6 flex items-center justify-between border-t border-border pt-4 text-sm font-bold text-terracotta-strong">
                    <span>مشاهده پروفایل</span>
                    <span aria-hidden="true" className="transition-transform group-hover:-translate-x-1">←</span>
                </span>
            </Link>
        </article>
    );
}
