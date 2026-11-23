import { Link } from 'react-router-dom';
import { formatArtworkPrice } from '../../utils/formatArtworkPrice';
import { MediaImage } from './feedback';
import { cn } from '../../lib/utils';

export function ArtworkCard({ artwork, className = '' }) {
    if (!artwork) return null;
    const title = artwork.title ?? 'اثر هنری';
    const artistName = artwork.artist?.display_name ?? artwork.artist?.name ?? '';
    const price = formatArtworkPrice(artwork.price);

    return (
        <article className={cn('group min-w-0', className)}>
            <Link to={`/artworks/${artwork.slug}`} className="block outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus">
                <div className="relative overflow-hidden bg-[linear-gradient(145deg,var(--color-surface-muted),var(--color-paper))]">
                    <div className="flex aspect-[4/5] items-center justify-center bg-[linear-gradient(145deg,var(--color-surface-muted),var(--color-paper))] p-3 sm:p-4">
                        <MediaImage src={artwork.image_url} alt={title} variant="card" className="h-full w-full" imageClassName="object-contain transition-transform duration-700 ease-out group-hover:scale-[1.045]" />
                    </div>
                    <span aria-hidden="true" className="pointer-events-none absolute inset-0 border border-[color:color-mix(in_srgb,var(--color-ink)_5%,transparent)] transition-colors group-hover:border-[color:color-mix(in_srgb,var(--color-terracotta)_50%,transparent)]" />
                </div>
                <div className="grid gap-1.5 border-b border-border px-0.5 pb-4 pt-4 transition-colors group-hover:border-terracotta/60">
                    <div className="flex min-h-5 items-center justify-between gap-3">
                        {artwork.category?.name ? <span className="text-[11px] font-semibold text-terracotta-strong">{artwork.category.name}</span> : <span />}
                        <span className="text-[11px] text-subtle transition-transform group-hover:-translate-x-1" aria-hidden="true">←</span>
                    </div>
                    <h3 className="line-clamp-2 text-base font-extrabold leading-7 text-ink transition-colors group-hover:text-terracotta-strong">{title}</h3>
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
        <article className={cn('group relative min-w-0 overflow-hidden border-y border-border bg-transparent transition-colors duration-300 hover:border-terracotta', className)} dir="rtl">
            <Link to={artist.slug ? `/artists/${artist.slug}` : '/artists'} className="flex h-full flex-col p-5 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus sm:p-6">
                <div className="flex items-start justify-between gap-4">
                    <div className="grid h-16 w-16 shrink-0 place-items-center border border-sand bg-surface-muted text-2xl font-black text-terracotta-strong transition-colors duration-300 group-hover:border-ink group-hover:bg-ink group-hover:text-inverse" aria-hidden="true">
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
