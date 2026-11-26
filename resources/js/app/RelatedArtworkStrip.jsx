import { MediaImage, Button } from '../components/ui';
import { Link } from 'react-router-dom';
import { Image as ImageIcon } from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { localizedValue } from '../utils/localizedContent';

export default function RelatedArtworkStrip({ contexts, role, onSelectArtwork }) {
    const { t, locale } = useLanguage();
    const artworks = (contexts ?? [])
        .filter((context) => context.artwork?.slug)
        .map((context) => context.artwork);

    if (!artworks.length) return null;

    return (
        <div className="flex w-full min-w-0 items-center gap-2 border-t border-border bg-surface-muted px-5 py-2 max-md:px-3 md:gap-2.5">
            <span className="shrink-0 text-[11px] font-semibold text-muted">{t('آثار مرتبط:')}</span>
            <div className="flex min-w-0 flex-1 flex-row items-center gap-1.5 overflow-x-auto overflow-y-hidden px-px py-0.5 [scrollbar-width:none] [overscroll-behavior-inline:contain]" role="list" aria-label={t("آثار مرتبط")}>
                {artworks.map((artwork) => {
                    const chipContent = (
                        <>
                            <span className="relative inline-flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden bg-border text-muted">
                                {artwork.image_url ? (
                                    <MediaImage src={artwork.image_url} alt="" className="h-full w-full" imageClassName="object-cover" loading="lazy" decoding="async" />
                                ) : (
                                    <ImageIcon size={15} aria-hidden="true" />
                                )}
                            </span>
                            <span className="max-w-[7.5rem] truncate">{localizedValue(artwork, 'title', locale)}</span>
                            {role === 'buyer' && <span className="border-s border-border ps-1.5 text-[9px] text-terracotta-strong">{t('پاسخ')}</span>}
                        </>
                    );

                    const className = "inline-flex min-w-0 max-w-48 min-h-10 shrink-0 items-center gap-[.4rem] whitespace-nowrap border border-border bg-surface-muted pe-2.5 ps-1 py-1 text-[11px] font-semibold leading-tight text-ink no-underline transition-colors hover:border-terracotta hover:bg-surface hover:text-terracotta-strong motion-reduce:transition-none";

                    return role === 'buyer' ? (
                        <Button variant="ghost"
                            key={artwork.slug}
                            type="button"
                            role="listitem"
                            onClick={() => onSelectArtwork(artwork)}
                            aria-label={t('ارسال پیام درباره ') + localizedValue(artwork, 'title', locale)}
                            className={className}
                        >
                            {chipContent}
                        </Button>
                    ) : (
                        <Link
                            key={artwork.slug}
                            role="listitem"
                            to={'/artworks/' + artwork.slug}
                            className={className}
                        >
                            {chipContent}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
