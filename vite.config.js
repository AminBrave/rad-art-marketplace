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
        throw new Error('The default development workflow must provide a detected private LAN IPv4 address.');
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
                // Caddy is the only network-facing listener. Vite stays private.
                host: '127.0.0.1',
                port: 5173,
                strictPort: true,
                // Laravel's hot file uses this origin for every browser, including rad.localhost.
                origin: `https://${lanHost}`,
                allowedHosts: [lanHost, 'rad.localhost', 'rad.home.arpa'],
                cors: {
                    origin: ['https://rad.localhost', 'https://rad.home.arpa', `https://${lanHost}`],
                },
                hmr: {
                    host: lanHost,
                    protocol: 'wss',
                    clientPort: 443,
                    path: '/__vite_hmr',
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
