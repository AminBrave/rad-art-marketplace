import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// This build profile targets cPanel accounts that serve the repository root
// (the entire Laravel project) as the domain document root.
export default defineConfig(() => {
    return {
        // Do not copy ./public into ./build. Copy intended public static files
        // to the repository root separately; .htaccess blocks direct /public access.
        publicDir: false,
        plugins: [
            laravel({
                input: ['resources/css/app.css', 'resources/js/app.jsx'],
                publicDirectory: '.',
                buildDirectory: 'build',
                refresh: true,
            }),
            react(),
        ],
    };
});
