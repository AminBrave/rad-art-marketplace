import { MediaImage, Button } from '../shared/ui';
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
        <div className="flex w-full min-w-0 items-center gap-[.45rem] border-t border-border bg-surface-muted px-5 py-[.45rem] max-md:px-[.65rem] md:gap-[.55rem]">
            <span className="shrink-0 text-[11px] font-semibold text-muted">{t('آثار مرتبط:')}</span>
            <div className="flex min-w-0 flex-1 flex-row items-center gap-[.4rem] overflow-x-auto overflow-y-hidden px-[.05rem] py-[.1rem] [scrollbar-width:none] [overscroll-behavior-inline:contain]" role="list" aria-label={t("آثار مرتبط")}>
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
                            {role === 'buyer' && <span className="border-s border-border ps-[.4rem] text-[9px] text-terracotta-strong">{t('پاسخ')}</span>}
                        </>
                    );

                    const className = "inline-flex min-w-0 max-w-48 min-h-[2.35rem] shrink-0 items-center gap-[.4rem] whitespace-nowrap border border-border bg-surface-muted pe-[.6rem] ps-[.25rem] py-[.2rem] text-[11px] font-semibold leading-tight text-ink no-underline transition-colors hover:border-terracotta hover:bg-surface hover:text-terracotta-strong motion-reduce:transition-none";

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
