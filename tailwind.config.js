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
                success: 'var(--color-success)',
                danger: 'var(--color-danger)',
            },
            fontFamily: {
                sans: ['Vazirmatn', 'Inter', 'sans-serif'],
                persian: ['Vazirmatn', 'sans-serif'],
                latin: ['Inter', 'sans-serif'],
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
            spacing: { 'page-gutter': 'var(--page-gutter)' },
        },
    },
    plugins: [],
};
