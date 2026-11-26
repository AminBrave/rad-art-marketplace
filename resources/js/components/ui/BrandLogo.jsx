import { useLanguage } from '../../app/LanguageContext';

/** Shared application identity. Replace /favicon.svg with the final uploaded brand asset. */
export function BrandLogo({ className = '', compact = false }) {
    const { locale } = useLanguage();
    const name = locale === 'fa' ? 'ردّمن' : 'Rademan';

    return (
        <span className={`inline-flex min-w-0 items-center gap-2.5 text-ink no-underline ${className}`.trim()}>
            <img
                src="/favicon.svg"
                alt=""
                aria-hidden="true"
                className={compact ? 'h-9 w-9 shrink-0 object-contain' : 'h-10 w-10 shrink-0 object-contain sm:h-11 sm:w-11'}
                width="44"
                height="44"
            />
            <span className="min-w-0 truncate text-lg font-black tracking-tight sm:text-xl" lang={locale} dir={locale === 'fa' ? 'rtl' : 'ltr'}>
                {name}
            </span>
        </span>
    );
}
