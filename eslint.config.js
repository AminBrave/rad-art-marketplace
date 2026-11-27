
import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default [
    { ignores: ['public/build/**', 'node_modules/**', 'vendor/**'] },
    js.configs.recommended,
    {
        files: ['resources/js/**/*.{js,jsx}'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                window: 'readonly',
                document: 'readonly',
                console: 'readonly',
                FormData: 'readonly',
                URLSearchParams: 'readonly',
                AbortController: 'readonly',
            },
            parserOptions: { ecmaFeatures: { jsx: true } },
        },
        plugins: {
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
        },
        rules: {
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'warn',
            'react-refresh/only-export-components': [
                'warn',
                { allowConstantExport: true, allowExportNames: ['useAuth'] },
            ],
        },
    },
    // These files are deliberate compatibility facades; the react-refresh rule
    // cannot statically validate wildcard re-exports in re-export-only modules.
    {
        files: [
            'resources/js/components/ui/AlertDialog.jsx',
            'resources/js/components/ui/BrandLogo.jsx',
            'resources/js/components/ui/Dialog.jsx',
            'resources/js/components/ui/Tooltip.jsx',
            'resources/js/components/ui/feedback.jsx',
            'resources/js/components/ui/layout.jsx',
            'resources/js/components/ui/navigation.jsx',
            'resources/js/components/ui/primitives.jsx',
            'resources/js/shared/ui/primitives.jsx',
        ],
        rules: {
            'react-refresh/only-export-components': 'off',
        },
    },
];
