import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatArtworkPrice } from '../../utils/formatArtworkPrice';
import { Badge } from './primitives';

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
                        {artwork.image_url ? (
                            <ArtworkImage src={artwork.image_url} title={title} />
                        ) : (
                            <ArtworkImage src={null} title={title} />
                        )}
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
    return (
        <article className={`ra-surface grid gap-3 p-5 ${className}`} dir="rtl">
            <div className="flex items-start gap-3">
                <div aria-hidden="true" className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-surface-muted text-lg font-bold text-terracotta-strong">
                    {name.trim().slice(0, 1) || 'ه'}
                </div>
                <div className="min-w-0">
                    <h3 className="font-bold text-ink">{name}</h3>
                    {artist.city && <p className="mt-1 text-xs text-muted">{artist.city}</p>}
                </div>
            </div>
            {artist.bio && <p className="line-clamp-3 text-sm leading-7 text-muted">{artist.bio}</p>}
            {artist.slug && (
                <Link to={`/artists/${artist.slug}`} className="mt-1 text-sm font-bold text-terracotta-strong underline underline-offset-4">
                    مشاهده پروفایل
                </Link>
            )}
        </article>
    );
}
