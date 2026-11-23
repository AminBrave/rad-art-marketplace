import { Link } from 'react-router-dom';
import { Heart, ArrowUpLeft, MapPin } from 'lucide-react';
import { formatArtworkPrice } from '../../utils/formatArtworkPrice';
import { MediaImage } from './feedback';

export function ArtworkCard({ artwork, className = '' }) {
    if (!artwork) return null;
    const title = artwork.title ?? 'اثر هنری';
    const artistName = artwork.artist?.display_name ?? artwork.artist?.name ?? 'هنرمند مستقل';
    const artistInitial = artistName.trim().slice(0, 1) || 'ه';
    const artistTo = artwork.artist?.slug ? `/artists/${artwork.artist.slug}` : '/artists';
    const price = formatArtworkPrice(artwork.price);

    return (
        <article data-ui="artwork-card" className={`group min-w-0 overflow-hidden rounded-2xl border border-border bg-paper transition-colors ${className}`} dir="rtl">
            <div className="flex items-center justify-between gap-3 px-3 py-3 sm:px-4">
                <Link to={artistTo} className="flex min-w-0 items-center gap-2.5 text-ink no-underline">
                    <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full bg-surface-muted text-sm font-bold" aria-hidden="true">{artistInitial}</span>
                    <span className="min-w-0">
                        <span className="block truncate text-xs font-bold">{artistName}</span>
                        {artwork.artist?.city && <span className="mt-0.5 flex items-center gap-1 truncate text-[10px] text-muted"><MapPin size={11}/>{artwork.artist.city}</span>}
                    </span>
                </Link>
                {artwork.category?.name && <span className="max-w-[40%] truncate rounded-full bg-surface-muted px-2.5 py-1 text-[10px] font-semibold text-muted">{artwork.category.name}</span>}
            </div>
            <Link data-ui="artwork-media" to={`/artworks/${artwork.slug}`} className="relative block overflow-hidden bg-surface-muted outline-none" aria-label={`مشاهده اثر ${title}`}>
                <div className="aspect-[4/5] overflow-hidden">
                    <MediaImage src={artwork.image_url} alt={title} variant="card" className="h-full w-full" imageClassName="h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.02]"/>
                </div>
                <span className="absolute bottom-3 left-3 grid h-9 w-9 place-items-center rounded-full bg-black/55 text-white backdrop-blur"><ArrowUpLeft size={17}/></span>
            </Link>
            <div className="grid gap-2 px-3 pb-4 pt-3 sm:px-4">
                <div className="flex items-start justify-between gap-3">
                    <Link to={`/artworks/${artwork.slug}`} className="line-clamp-2 text-sm font-bold leading-6 text-ink no-underline hover:text-terracotta-strong">{title}</Link>
                    <span className="shrink-0 pt-0.5 text-xs font-bold tabular-nums text-ink">{price}</span>
                </div>
                <div className="flex items-center justify-between border-t border-border pt-2 text-[11px] text-muted">
                    <span>اثر منتخب در راد آرت</span>
                    <span className="inline-flex items-center gap-1"><Heart size={13}/> کشف اثر</span>
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
        <article data-ui="artist-card" className={`group min-w-0 overflow-hidden rounded-2xl border border-border bg-paper transition-colors hover:border-border-strong ${className}`} dir="rtl">
            <Link to={artist.slug ? `/artists/${artist.slug}` : '/artists'} className="flex h-full min-w-0 items-center gap-4 p-4 text-ink no-underline outline-none sm:p-5">
                <span data-ui="artist-avatar" className="grid h-16 w-16 shrink-0 place-items-center rounded-full border-2 border-paper bg-surface-muted text-xl font-extrabold text-ink shadow-soft" aria-hidden="true">{initial}</span>
                <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold group-hover:text-terracotta-strong">{name}</span>
                    {artist.city && <span className="mt-1 block truncate text-xs text-muted">{artist.city}</span>}
                    {artist.bio && <span className="mt-2 line-clamp-2 block text-xs leading-6 text-muted">{artist.bio}</span>}
                    <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-terracotta-strong">مشاهده پروفایل <ArrowUpLeft size={13}/></span>
                </span>
            </Link>
        </article>
    );
}
