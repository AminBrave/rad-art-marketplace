import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatArtworkPrice } from '../../utils/formatArtworkPrice';
import { Badge } from './primitives';

function ArtworkImage({src,title}) {
 const [failed,setFailed]=useState(false);
 if(!src||failed) return <span role="img" aria-label={`تصویر اثر ${title} در دسترس نیست`} className="px-4 text-center text-sm text-muted-foreground">تصویر اثر در دسترس نیست</span>;
 return <img src={src} alt={title} loading="lazy" decoding="async" onError={()=>setFailed(true)} className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.02]"/>;
}
export function ArtworkCard({artwork,className=''}) {
 if(!artwork)return null;
 const title=artwork.title??'اثر هنری', artistName=artwork.artist?.display_name??artwork.artist?.name??'', price=formatArtworkPrice(artwork.price);
 return <article className={`group min-w-0 overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-shadow hover:shadow-md ${className}`}><Link to={`/artworks/${artwork.slug}`} className="block outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"><div className="ra-artwork-frame p-3">{artwork.image_url?<ArtworkImage src={artwork.image_url} title={title}/>:<ArtworkImage src={null} title={title}/>}</div><div className="grid gap-2 p-4">{artwork.category?.name&&<Badge variant="accent">{artwork.category.name}</Badge>}<h3 className="line-clamp-2 font-bold leading-7 text-foreground">{title}</h3>{artistName&&<p className="text-sm text-muted-foreground">{artistName}</p>}<p className="text-sm font-bold text-foreground">{price}</p></div></Link></article>;
}
export function ArtistCard({artist,className=''}) {
 if(!artist)return null; const name=artist.display_name??artist.name??'هنرمند';
 return <article className={`grid gap-3 rounded-lg border bg-card p-5 text-card-foreground shadow-sm ${className}`} dir="rtl"><div className="flex items-start gap-3"><div aria-hidden="true" className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-muted text-lg font-bold text-primary">{name.trim().slice(0,1)||'ه'}</div><div className="min-w-0"><h3 className="font-bold text-foreground">{name}</h3>{artist.city&&<p className="mt-1 text-xs text-muted-foreground">{artist.city}</p>}</div></div>{artist.bio&&<p className="line-clamp-3 text-sm leading-7 text-muted-foreground">{artist.bio}</p>}{artist.slug&&<Link to={`/artists/${artist.slug}`} className="mt-1 text-sm font-bold text-primary underline underline-offset-4">مشاهده پروفایل</Link>}</article>;
}
