import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatArtworkPrice } from '../../utils/formatArtworkPrice';
import { Badge } from './primitives';
import { cn } from '../../lib/utils';

function ArtworkImage({ src, title }) {
    const [failed, setFailed] = useState(false);
    if (!src || failed) return <span role="img" aria-label={`تصویر اثر ${title} در دسترس نیست`} className="px-4 text-center text-sm text-muted-foreground">تصویر اثر در دسترس نیست</span>;
    return <img src={src} alt={title} loading="lazy" decoding="async" onError={() => setFailed(true)} className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.02]" />;
}
export function ArtworkCard({ artwork, className = '' }) {
    if (!artwork) return null;
    const title = artwork.title ?? 'اثر هنری';
    const artistName = artwork.artist?.display_name ?? artwork.artist?.name ?? '';
    const price = formatArtworkPrice(artwork.price);
    return <article className={cn('group min-w-0 overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-shadow hover:shadow-md', className)}>
        <Link to={`/artworks/${artwork.slug}`} className="block outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring">
            <div className="flex aspect-[4/3] items-center justify-center overflow-hidden bg-muted p-3">
                <ArtworkImage src={artwork.image_url} title={title} />
            </div>
            <div className="grid gap-2 p-4">
                {artwork.category?.name && <Badge variant="accent">{artwork.category.name}</Badge>}
                <h3 className="line-clamp-2 font-semibold">{title}</h3>
                {artistName && <p className="text-sm text-muted-foreground">{artistName}</p>}
                <p className="text-sm font-semibold">{price}</p>
            </div>
        </Link>
    </article>;
}
export function ArtistCard({ artist, className = '' }) {
    if (!artist) return null;
    const name = artist.display_name ?? artist.name ?? 'هنرمند';
    return <article className={cn('grid gap-3 rounded-lg border bg-card p-5 text-card-foreground shadow-sm', className)}>
        <h3 className="font-semibold">{name}</h3>
        {artist.bio && <p className="line-clamp-3 text-sm text-muted-foreground">{artist.bio}</p>}
        <Link to={`/artists/${artist.slug}`} className="text-sm font-medium text-primary underline-offset-4 hover:underline">مشاهده پروفایل</Link>
    </article>;
}
