/** @type {import('tailwindcss').Config} */
export default {
    content: ['./resources/**/*.blade.php', './resources/**/*.js', './resources/**/*.jsx'],
    theme: {
        extend: {
            keyframes: {
                'skeleton-shimmer': {
                    to: { backgroundPositionX: '-200%' },
                },
            },
            animation: {
                'skeleton-shimmer': 'skeleton-shimmer 1.35s ease-in-out infinite',
            },
            colors: {
                brand: {
                    ivory: 'var(--rd-brand-ivory)',
                    charcoal: 'var(--rd-brand-charcoal)',
                    terracotta: 'var(--rd-brand-terracotta)',
                    sand: 'var(--rd-brand-sand)',
                    olive: 'var(--rd-brand-olive)',
                },
                canvas: 'var(--rd-canvas)',
                ink: 'var(--rd-text-primary)',
                terracotta: {
                    DEFAULT: 'var(--rd-action)',
                    strong: 'var(--rd-action-hover)',
                },
                sand: 'var(--rd-brand-sand)',
                olive: 'var(--rd-success)',
                paper: 'var(--rd-surface)',
                muted: 'var(--rd-text-secondary)',
                subtle: 'var(--rd-text-tertiary)',
                border: {
                    DEFAULT: 'var(--rd-border-subtle)',
                    strong: 'var(--rd-border-strong)',
                },
                divider: {
                    section: 'var(--rd-divider-section)',
                    group: 'var(--rd-divider-group)',
                    nested: 'var(--rd-divider-nested)',
                },
                surface: {
                    DEFAULT: 'var(--rd-surface)',
                    muted: 'var(--rd-surface-muted)',
                },
                success: { DEFAULT: 'var(--rd-success)', surface: 'var(--rd-success-surface)' },
                danger: { DEFAULT: 'var(--rd-danger)', surface: 'var(--rd-danger-surface)' },
                warning: { DEFAULT: 'var(--rd-warning)', surface: 'var(--rd-warning-surface)' },
                info: { DEFAULT: 'var(--rd-info)', surface: 'var(--rd-info-surface)' },
                accent: { DEFAULT: 'var(--rd-action)', surface: 'var(--rd-accent-surface)' },
                inverse: 'var(--rd-inverse-text)',
                focus: 'var(--rd-focus)',
            },
            fontFamily: {
                sans: ['var(--rd-font-sans)'],
                persian: ['var(--rd-font-persian)'],
                latin: ['var(--rd-font-latin)'],
            },
            fontSize: {
                xs: 'var(--rd-text-xs)', sm: 'var(--rd-text-sm)', base: 'var(--rd-text-base)',
                lg: 'var(--rd-text-lg)', xl: 'var(--rd-text-xl)', '2xl': 'var(--rd-text-2xl)',
                '3xl': 'var(--rd-text-3xl)', '4xl': 'var(--rd-text-4xl)', '5xl': 'var(--rd-text-5xl)',
            },
            lineHeight: {
                copy: 'var(--rd-leading-copy)', heading: 'var(--rd-leading-heading)',
                tight: 'var(--rd-leading-tight)', relaxed: 'var(--rd-leading-relaxed)',
            },
            // The product intentionally uses square geometry. Keep legacy Tailwind radius utilities mapped to the zero token during migration; do not use rounded-* as a new component contract.
            borderRadius: {
                DEFAULT: 'var(--rd-radius-0)',
                none: 'var(--rd-radius-0)',
                sm: 'var(--rd-radius-0)',
                md: 'var(--rd-radius-0)',
                lg: 'var(--rd-radius-0)',
                xl: 'var(--rd-radius-0)',
                '2xl': 'var(--rd-radius-0)',
                '3xl': 'var(--rd-radius-0)',
                full: 'var(--rd-radius-0)',
                control: 'var(--rd-radius-0)',
                editorial: 'var(--rd-radius-0)',
                card: 'var(--rd-radius-0)',
                panel: 'var(--rd-radius-0)',
                pill: 'var(--rd-radius-0)',
            },
            boxShadow: {
                soft: 'var(--rd-shadow-soft)',
                raised: 'var(--rd-shadow-raised)',
            },
            maxWidth: {
                content: 'var(--rd-content-width)',
                'content-reading': 'var(--rd-content-reading-width)',
            },
            spacing: {
                'page-gutter': 'var(--rd-page-gutter)',
                'editorial-1': 'var(--rd-space-1)', 'editorial-2': 'var(--rd-space-2)',
                'editorial-3': 'var(--rd-space-3)', 'editorial-4': 'var(--rd-space-4)',
                'editorial-5': 'var(--rd-space-5)', 'editorial-6': 'var(--rd-space-6)',
                'editorial-8': 'var(--rd-space-8)', 'editorial-10': 'var(--rd-space-10)',
                'editorial-12': 'var(--rd-space-12)', 'editorial-16': 'var(--rd-space-16)',
                'editorial-20': 'var(--rd-space-20)', 'editorial-24': 'var(--rd-space-24)',
            },
        },
    },
    plugins: [],
};
