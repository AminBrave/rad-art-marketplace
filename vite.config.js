import { defineConfig, loadEnv } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), 'VITE_');
    const localHttps = env.VITE_DEV_HTTPS === 'true';
    const lanDevelopment = mode === 'lan';
    const lanHost = env.VITE_DEV_LAN_HOST;

    if (lanDevelopment && !lanHost) {
        throw new Error('Set RAD_LAN_HOST to this computer’s LAN IPv4 address before starting the LAN development server.');
    }

    return {
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./resources/js', import.meta.url)),
            },
        },
        plugins: [
            laravel({
                input: ['resources/css/app.css', 'resources/js/app.jsx'],
                refresh: true,
            }),
            react(),
        ],
        server: lanDevelopment
            ? {
                host: '0.0.0.0',
                port: 5173,
                strictPort: true,
                origin: `http://${lanHost}:5173`,
                cors: {
                    origin: `http://${lanHost}:8000`,
                },
                allowedHosts: [lanHost],
                hmr: {
                    host: lanHost,
                    protocol: 'ws',
                    clientPort: 5173,
                },
            }
            : localHttps
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
