/** @type {import('tailwindcss').Config} */
export default {
    content: ['./resources/**/*.blade.php', './resources/**/*.js', './resources/**/*.jsx'],
    theme: {
        extend: {
            colors: {
                canvas: 'var(--color-canvas)',
                ink: 'var(--color-ink)',
                terracotta: {
                    DEFAULT: 'var(--color-terracotta)',
                    strong: 'var(--color-terracotta-strong)',
                },
                sand: 'var(--color-sand)',
                olive: 'var(--color-olive)',
                paper: 'var(--color-paper)',
                muted: 'var(--color-text-muted)',
                subtle: 'var(--color-text-subtle)',
                border: {
                    DEFAULT: 'var(--color-border)',
                    strong: 'var(--color-border-strong)',
                },
                surface: {
                    DEFAULT: 'var(--color-surface)',
                    muted: 'var(--color-surface-muted)',
                },
                success: { DEFAULT: 'var(--color-success)', surface: 'var(--color-success-surface)' },
                danger: { DEFAULT: 'var(--color-danger)', surface: 'var(--color-danger-surface)' },
                warning: { DEFAULT: 'var(--color-warning)', surface: 'var(--color-warning-surface)' },
                info: { DEFAULT: 'var(--color-info)', surface: 'var(--color-info-surface)' },
                accent: { DEFAULT: 'var(--color-terracotta)', surface: 'var(--color-accent-surface)' },
                inverse: 'var(--color-inverse-text)',
                focus: 'var(--color-focus)',
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
