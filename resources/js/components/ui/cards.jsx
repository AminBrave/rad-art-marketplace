import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatArtworkPrice } from '../../utils/formatArtworkPrice';
import { Badge } from './primitives';
import { Avatar, AvatarFallback, AvatarImage } from './misc';
import { Card, CardContent } from './card';

function ArtworkImage({ src, title }) {
    const [failed, setFailed] = useState(false);
    if (!src || failed) return <div role="img" aria-label={`تصویر اثر ${title} در دسترس نیست`} className="grid h-full w-full place-items-center bg-muted p-6 text-center text-sm text-muted-foreground">تصویر اثر در دسترس نیست</div>;
    return <img src={src} alt={title} loading="lazy" decoding="async" onError={() => setFailed(true)} className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.025]" />;
}

export function ArtworkCard({ artwork, className = '' }) {
    if (!artwork) return null;
    const title = artwork.title ?? 'اثر هنری';
    const artistName = artwork.artist?.display_name ?? artwork.artist?.name ?? '';
    const price = formatArtworkPrice(artwork.price);
    return <Card className={`group min-w-0 overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${className}`}>
        <Link to={`/artworks/${artwork.slug}`} className="block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            <div className="aspect-[4/3] overflow-hidden border-b bg-muted/40 p-3 sm:p-4"><ArtworkImage src={artwork.image_url} title={title} /></div>
            <CardContent className="grid gap-2 p-4">
                <div className="flex min-h-6 items-center justify-between gap-2">{artwork.category?.name ? <Badge variant="secondary">{artwork.category.name}</Badge> : <span />}<span className="text-xs text-muted-foreground">راد آرت</span></div>
                <h3 className="line-clamp-2 min-h-7 font-semibold leading-6 text-card-foreground">{title}</h3>
                {artistName && <p className="truncate text-sm text-muted-foreground">{artistName}</p>}
                <div className="mt-1 flex items-center justify-between gap-3 border-t pt-3"><span className="text-sm font-semibold tabular-nums text-foreground">{price}</span><span className="text-xs font-medium text-primary">مشاهده اثر ←</span></div>
            </CardContent>
        </Link>
    </Card>;
}

export function ArtistCard({ artist, className = '' }) {
    if (!artist) return null;
    const name = artist.display_name ?? artist.name ?? 'هنرمند';
    return <Card className={`grid content-start gap-4 p-5 transition-all hover:-translate-y-0.5 hover:shadow-md ${className}`} dir="rtl">
        <div className="flex items-center gap-3">
            <Avatar className="size-12 border">{artist.avatar_url && <AvatarImage src={artist.avatar_url} alt={name} />}<AvatarFallback>{name.trim().slice(0, 1) || 'ه'}</AvatarFallback></Avatar>
            <div className="min-w-0"><h3 className="truncate font-semibold text-card-foreground">{name}</h3>{artist.city && <p className="mt-1 text-xs text-muted-foreground">{artist.city}</p>}</div>
        </div>
        {artist.bio && <p className="line-clamp-3 text-sm leading-7 text-muted-foreground">{artist.bio}</p>}
        {artist.slug && <Link to={`/artists/${artist.slug}`} className="mt-1 inline-flex min-h-9 items-center text-sm font-medium text-primary underline-offset-4 hover:underline">مشاهده پروفایل</Link>}
    </Card>;
}
