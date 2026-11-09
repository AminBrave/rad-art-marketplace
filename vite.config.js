import { defineConfig, loadEnv } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), 'VITE_');
    const localHttps = env.VITE_DEV_HTTPS === 'true';

    return {
        // This deployment profile serves the repository root as the document root.
        // Keep Vite's generated manifest and assets at ./build, not ./public/build.
        // Static files from ./public are copied manually to the document root.
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
