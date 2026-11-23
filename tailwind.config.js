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
                paper: 'var(--rd-surface)',
                muted: 'var(--rd-text-2)',
                subtle: 'var(--rd-text-3)',
                border: { DEFAULT: 'var(--rd-line)', strong: 'var(--rd-line-strong)' },
                surface: { DEFAULT: 'var(--rd-surface)', muted: 'var(--rd-surface-2)' },
                success: { DEFAULT: 'var(--rd-positive)', surface: 'color-mix(in srgb,var(--rd-positive) 10%,var(--rd-surface))' },
                danger: { DEFAULT: 'var(--rd-negative)', surface: 'color-mix(in srgb,var(--rd-negative) 9%,var(--rd-surface))' },
                warning: { DEFAULT: 'var(--rd-warning)', surface: 'color-mix(in srgb,var(--rd-warning) 10%,var(--rd-surface))' },
                info: { DEFAULT: 'var(--rd-info)', surface: 'color-mix(in srgb,var(--rd-info) 9%,var(--rd-surface))' },
                accent: { DEFAULT: 'var(--rd-accent)', strong: 'var(--rd-link)', surface: 'var(--rd-accent-soft)' },
                line: 'var(--rd-line)',
                inverse: 'var(--rd-inverse)',
                focus: 'var(--rd-focus)',
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
            boxShadow: {
                soft: 'var(--shadow-soft)',
                raised: 'var(--shadow-raised)',
            },
            maxWidth: { content: 'var(--content-width)' },
        },
    },
    plugins: [],
};
