import { Link } from 'react-router-dom';
import { formatArtworkPrice } from '../../utils/formatArtworkPrice';
import { MediaImage } from './feedback';

export function ArtworkCard({ artwork, className = '' }) {
    if (!artwork) return null;
    const title = artwork.title ?? 'اثر هنری';
    const artistName = artwork.artist?.display_name ?? artwork.artist?.name ?? '';
    const artistInitial = artistName.trim().slice(0, 1) || 'ه';
    const artistTo = artwork.artist?.slug ? `/artists/${artwork.artist.slug}` : '/artists';
    const price = formatArtworkPrice(artwork.price);

    return (
        <article className={`group min-w-0 overflow-hidden rounded-lg border border-border bg-paper transition-colors hover:border-border-strong ${className}`} dir="rtl">
            <div className="flex min-h-14 items-center justify-between gap-3 px-3 py-2.5 sm:px-4">
                {artistName ? (
                    <Link to={artistTo} className="flex min-w-0 items-center gap-2.5 text-ink no-underline outline-none focus-visible:ring-2 focus-visible:ring-focus">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border bg-surface-muted text-sm font-bold text-ink" aria-hidden="true">{artistInitial}</span>
                        <span className="min-w-0">
                            <span className="block truncate text-xs font-bold">{artistName}</span>
                            {artwork.artist?.city && <span className="mt-0.5 block truncate text-[10px] text-muted">{artwork.artist.city}</span>}
                        </span>
                    </Link>
                ) : <span className="text-xs font-semibold text-muted">راد آرت</span>}
                {artwork.category?.name && <span className="max-w-[40%] truncate text-[10px] font-semibold text-muted">{artwork.category.name}</span>}
            </div>

            <Link to={`/artworks/${artwork.slug}`} className="block outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus" aria-label={`مشاهده اثر ${title}`}>
                <div className="relative overflow-hidden bg-surface-muted">
                    <div className="flex aspect-[4/5] items-center justify-center bg-surface-muted p-0">
                        <MediaImage src={artwork.image_url} alt={title} variant="card" className="h-full w-full" imageClassName="object-contain transition-transform duration-300 group-hover:scale-[1.02]" />
                    </div>
                </div>
            </Link>

            <div className="grid gap-1.5 px-3 pb-3 pt-3 sm:px-4">
                <Link to={`/artworks/${artwork.slug}`} className="line-clamp-2 text-sm font-semibold leading-6 text-ink no-underline transition-colors hover:text-terracotta-strong">
                    {title}
                </Link>
                <div className="flex items-center justify-between gap-3 border-t border-border pt-2.5">
                    <span className="text-xs font-bold text-ink">{price}</span>
                    <span className="text-[10px] font-semibold text-muted">مشاهده اثر <span aria-hidden="true">←</span></span>
                </div>
            </div>
        </article>
    );
}

export function ArtistCard({ artist, className = '' }) {
    if (!artist) return null;
    const name = artist.display_name ?? artist.name ?? 'هنرمند';
    const initial = name.trim().slice(0, 1) || 'ه';

    return (
        <article className={`group relative min-w-0 overflow-hidden rounded-lg border border-border bg-paper transition-colors hover:border-border-strong ${className}`} dir="rtl">
            <Link to={artist.slug ? `/artists/${artist.slug}` : '/artists'} className="flex h-full min-w-0 items-center gap-4 p-4 text-ink no-underline outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus sm:p-5">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-border bg-surface-muted text-xl font-bold text-ink" aria-hidden="true">
                    {initial}
                </div>
                <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-bold text-ink transition-colors group-hover:text-terracotta-strong">{name}</h3>
                    {artist.city && <p className="mt-1 truncate text-xs text-muted">{artist.city}</p>}
                    {artist.bio && <p className="mt-2 line-clamp-2 text-xs leading-6 text-muted">{artist.bio}</p>}
                    <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-terracotta-strong">
                        مشاهده پروفایل <span aria-hidden="true">←</span>
                    </span>
                </div>
            </Link>
        </article>
    );
}
