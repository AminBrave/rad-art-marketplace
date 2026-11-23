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
                canvas: 'var(--rd-canvas)',
                ink: 'var(--rd-text)',
                terracotta: { DEFAULT: 'var(--rd-accent)', strong: 'var(--rd-link)' },
                sand: 'var(--rd-line)',
                olive: 'var(--rd-positive)',
                paper: 'var(--rd-surface)',
                muted: 'var(--rd-text-2)',
                subtle: 'var(--rd-text-3)',
                border: { DEFAULT: 'var(--rd-line)', strong: 'var(--rd-line-strong)' },
                surface: { DEFAULT: 'var(--rd-surface)', muted: 'var(--rd-surface-2)' },
                success: { DEFAULT: 'var(--rd-positive)', surface: 'color-mix(in srgb,var(--rd-positive) 10%,var(--rd-surface))' },
                danger: { DEFAULT: 'var(--rd-negative)', surface: 'color-mix(in srgb,var(--rd-negative) 9%,var(--rd-surface))' },
                warning: { DEFAULT: 'var(--rd-warning)', surface: 'color-mix(in srgb,var(--rd-warning) 10%,var(--rd-surface))' },
                info: { DEFAULT: 'var(--rd-info)', surface: 'color-mix(in srgb,var(--rd-info) 9%,var(--rd-surface))' },
                accent: { DEFAULT: 'var(--rd-accent)', surface: 'var(--rd-accent-soft)' },
                inverse: 'var(--rd-inverse)',
                focus: 'var(--rd-accent)',
            },
            fontFamily: {
                sans: ['Vazirmatn', 'Inter', 'sans-serif'],
                persian: ['Vazirmatn', 'sans-serif'],
                latin: ['Inter', 'sans-serif'],
            },
            fontSize: {
                xs: 'var(--text-xs)', sm: 'var(--text-sm)', base: 'var(--text-base)',
                lg: 'var(--text-lg)', xl: 'var(--text-xl)', '2xl': 'var(--text-2xl)',
                '3xl': 'var(--text-3xl)', '4xl': 'var(--text-4xl)', '5xl': 'var(--text-5xl)',
            },
            lineHeight: {
                copy: 'var(--leading-copy)', heading: 'var(--leading-heading)',
                tight: 'var(--leading-tight)', relaxed: 'var(--leading-relaxed)',
            },
            borderRadius: {
                editorial: 'var(--radius-md)',
                card: 'var(--radius-lg)',
                panel: 'var(--radius-xl)',
            },
            boxShadow: {
                soft: 'var(--shadow-soft)',
                raised: 'var(--shadow-raised)',
            },
            maxWidth: { content: 'var(--content-width)' },
            spacing: {
                'page-gutter': 'var(--page-gutter)',
                'editorial-1': 'var(--space-1)', 'editorial-2': 'var(--space-2)',
                'editorial-3': 'var(--space-3)', 'editorial-4': 'var(--space-4)',
                'editorial-5': 'var(--space-5)', 'editorial-6': 'var(--space-6)',
                'editorial-8': 'var(--space-8)', 'editorial-10': 'var(--space-10)',
                'editorial-12': 'var(--space-12)', 'editorial-16': 'var(--space-16)',
                'editorial-20': 'var(--space-20)', 'editorial-24': 'var(--space-24)',
            },
        },
    },
    plugins: [],
};
