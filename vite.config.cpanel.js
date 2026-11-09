import { defineConfig, loadEnv } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

// This build profile targets cPanel accounts that serve the repository root
// (the entire Laravel project) as the domain document root.
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), 'VITE_');
    const localHttps = env.VITE_DEV_HTTPS === 'true';

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
        server: localHttps
            ? {
                host: '127.0.0.1',
                port: 5173,
                strictPort: true,
                origin: 'https://rad.localhost',
                hmr: {
                    host: 'rad.localhost',
                    protocol: 'wss',
                    clientPort: 443,
                    path: '/__vite_hmr',
                },
            }
            : {},
    };
});
