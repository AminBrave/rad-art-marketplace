import { Link } from 'react-router-dom';
import { useLanguage } from '../../../shared/i18n';
import { localizedValue } from '../../../utils/localizedContent';
import { MediaImage } from '../../../shared/ui';
import { cn } from '../../../lib/utils';

export function ArtistCard({ artist, className = '' }) {
    const { locale } = useLanguage();
    if (!artist) return null;
    const name = localizedValue(artist, 'display_name', locale) || artist.name || (locale === 'en' ? 'Artist' : 'هنرمند');
    const initial = name.trim().slice(0, 1) || (locale === 'en' ? 'A' : 'ه');

    return (
        <article className={cn('group relative min-w-0 overflow-hidden border border-border bg-paper transition-colors duration-300 hover:border-terracotta', className)}>
            <Link to={artist.slug ? `/artists/${artist.slug}` : '/artists'} className="flex h-full flex-col bg-paper p-5 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus sm:p-6">
                <div className="flex items-start justify-between gap-4">
                    <div className="h-16 w-16 shrink-0 overflow-hidden border border-sand bg-surface-muted text-2xl font-black text-terracotta-strong transition-colors duration-300 group-hover:border-ink" aria-hidden="true">
                        {artist.avatar_url ? <MediaImage src={artist.avatar_url} alt="" className="h-full w-full" imageClassName="object-cover" /> : <div className="grid h-full w-full place-items-center">{initial}</div>}
                    </div>
                    <span className="pt-1 text-[11px] font-semibold tracking-wide text-subtle">{locale === 'en' ? 'RAD ART ARTIST' : 'هنرمند راد آرت'}</span>
                </div>
                <div className="mt-5 min-w-0 flex-1">
                    <h3 className="text-lg font-black leading-8 text-ink transition-colors group-hover:text-terracotta-strong">{name}</h3>
                    {localizedValue(artist, 'city', locale) && <p className="mt-1 text-xs font-medium text-muted">{localizedValue(artist, 'city', locale)}</p>}
                    {localizedValue(artist, 'bio', locale) ? (
                        <p className="mt-4 line-clamp-3 text-sm leading-7 text-muted">{localizedValue(artist, 'bio', locale)}</p>
                    ) : (
                        <p className="mt-4 text-sm leading-7 text-subtle">{locale === 'en' ? 'Explore this artist’s creative journey and portfolio.' : 'برای آشنایی با مسیر هنری و آثار این هنرمند، پروفایل او را ببینید.'}</p>
                    )}
                </div>
                <span className="mt-6 flex items-center justify-between border-t border-border pt-4 text-sm font-bold text-terracotta-strong">
                    <span>{locale === 'en' ? 'View profile' : 'مشاهده پروفایل'}</span>
                    <span aria-hidden="true" className="transition-transform group-hover:-translate-x-1">←</span>
                </span>
            </Link>
        </article>
    );
}
