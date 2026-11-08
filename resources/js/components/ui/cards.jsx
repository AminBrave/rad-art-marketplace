import { Link } from 'react-router-dom';
import { Badge } from './primitives';

export function ArtworkCard({ artwork, className = '' }) {
    if (!artwork) return null;
    const title = artwork.title ?? 'اثر هنری';
    const artistName = artwork.artist?.display_name ?? artwork.artist?.name ?? '';
    const price = artwork.price
        ? `${Number(artwork.price).toLocaleString('fa-IR')} ریال`
        : 'قیمت توافقی';

    return (
        <article className={`group min-w-0 overflow-hidden border border-border bg-paper transition-shadow hover:shadow-soft ${className}`}>
            <Link to={`/artworks/${artwork.slug}`} className="block outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus">
                <div className="flex aspect-[4/3] items-center justify-center overflow-hidden bg-surface-muted p-3">
                    {artwork.image_url ? (
                        <img
                            src={artwork.image_url}
                            alt={title}
                            loading="lazy"
                            className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                        />
                    ) : (
                        <span className="text-sm text-muted">تصویر اثر موجود نیست</span>
                    )}
                </div>
                <div className="grid gap-2 p-4">
                    {artwork.category?.name && <Badge variant="accent">{artwork.category.name}</Badge>}
                    <h3 className="line-clamp-2 font-bold leading-7 text-ink">{title}</h3>
                    {artistName && <p className="text-sm text-muted">{artistName}</p>}
                    <p className="text-sm font-bold text-ink">{price}</p>
                </div>
            </Link>
        </article>
    );
}

export function ArtistCard({ artist, className = '' }) {
    if (!artist) return null;
    const name = artist.display_name ?? artist.name ?? 'هنرمند';
    return (
        <article className={`grid gap-3 border border-border bg-paper p-5 ${className}`} dir="rtl">
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
