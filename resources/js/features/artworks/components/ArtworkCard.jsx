import { Link } from 'react-router-dom';
import { formatArtworkPrice } from '../../../utils/formatArtworkPrice';
import { useLanguage } from '../../../shared/i18n';
import { localizedValue } from '../../../utils/localizedContent';
import { MediaImage } from '../../../shared/ui';
import { cn } from '../../../lib/utils';

export function ArtworkCard({ artwork, className = '' }) {
    const { locale } = useLanguage();
    if (!artwork) return null;
    const title = localizedValue(artwork, 'title', locale) || (locale === 'en' ? 'Artwork' : 'اثر هنری');
    const artistName = localizedValue(artwork.artist, 'display_name', locale) || artwork.artist?.name || '';
    const price = formatArtworkPrice(artwork.price, locale);

    return (
        <article className={cn('group min-w-0', className)}>
            <Link to={`/artworks/${artwork.slug}`} className="block outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus">
                <div className="relative overflow-hidden bg-[linear-gradient(145deg,var(--color-surface-muted),var(--color-paper))]">
                    <div className="flex aspect-[3/4] items-center justify-center bg-[linear-gradient(145deg,var(--color-surface-muted),var(--color-paper))] p-3 sm:p-4">
                        <MediaImage src={artwork.image_url} alt={title} variant="card" className="h-full w-full" imageClassName="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.045]" />
                    </div>
                    <span aria-hidden="true" className="pointer-events-none absolute inset-0 border border-[color:color-mix(in_srgb,var(--color-ink)_5%,transparent)] transition-colors group-hover:border-[color:color-mix(in_srgb,var(--color-terracotta)_50%,transparent)]" />
                </div>
                <div className="grid gap-1.5 border-b border-border px-0.5 pb-4 pt-4 transition-colors group-hover:border-terracotta/60">
                    <div className="flex min-h-5 items-center justify-between gap-3">
                        {localizedValue(artwork.category, 'name', locale) ? <span className="text-[11px] font-semibold text-terracotta-strong">{localizedValue(artwork.category, 'name', locale)}</span> : <span />}
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
