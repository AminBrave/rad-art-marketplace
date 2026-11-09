import { defineConfig, loadEnv } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), 'VITE_');
    const localHttps = env.VITE_DEV_HTTPS === 'true';

    return {
        plugins: [
            laravel({
                input: ['resources/css/app.css', 'resources/js/app.jsx'],
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
