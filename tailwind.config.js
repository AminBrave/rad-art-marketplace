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
                success: { DEFAULT: 'var(--rd-success)', surface: 'var(--color-success-surface)' },
                danger: { DEFAULT: 'var(--rd-danger)', surface: 'var(--color-danger-surface)' },
                warning: { DEFAULT: 'var(--rd-warning)', surface: 'var(--color-warning-surface)' },
                info: { DEFAULT: 'var(--rd-info)', surface: 'var(--color-info-surface)' },
                accent: { DEFAULT: 'var(--rd-action)', surface: 'var(--color-accent-surface)' },
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
            borderRadius: {
                control: 'var(--rd-radius-sm)',
                editorial: 'var(--rd-radius-md)',
                card: 'var(--rd-radius-lg)',
                panel: 'var(--rd-radius-xl)',
                pill: 'var(--rd-radius-pill)',
            },
            boxShadow: {
                soft: 'var(--shadow-soft)',
                raised: 'var(--shadow-raised)',
            },
            maxWidth: {
                content: 'var(--rd-content-width)',
                'content-reading': 'var(--rd-content-reading-width)',
                'content-wide': 'var(--rd-content-wide-width)',
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
