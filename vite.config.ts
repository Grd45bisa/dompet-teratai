import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    server: {
        port: 5100,
        allowedHosts: true,
    },
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.ico', 'robots.txt'],
            manifest: {
                name: 'Expense Tracker UMKM',
                short_name: 'ExpenseTracker',
                description: 'Aplikasi pencatat pengeluaran untuk UMKM',
                theme_color: '#43A047',
                background_color: '#F5F5F5',
                display: 'standalone',
                orientation: 'portrait',
                icons: [
                    {
                        src: '/icon-192.png',
                        sizes: '192x192',
                        type: 'image/png',
                    },
                    {
                        src: '/icon-512.png',
                        sizes: '512x512',
                        type: 'image/png',
                    },
                    {
                        src: '/icon-512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'maskable',
                    },
                ],
            },
            workbox: {
                // Cache strategies for better offline support
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/.*/i,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'supabase-api-cache',
                            expiration: {
                                maxEntries: 50,
                                maxAgeSeconds: 60 * 60, // 1 hour
                            },
                            networkTimeoutSeconds: 10,
                        },
                    },
                    {
                        urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'supabase-storage-cache',
                            expiration: {
                                maxEntries: 100,
                                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
                            },
                        },
                    },
                    {
                        urlPattern: /\.(js|css|woff2?)$/i,
                        handler: 'StaleWhileRevalidate',
                        options: {
                            cacheName: 'static-assets',
                            expiration: {
                                maxEntries: 100,
                                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
                            },
                        },
                    },
                ],
            },
        }),
    ],
    build: {
        // Optimize chunk sizes
        rollupOptions: {
            output: {
                manualChunks: {
                    'react-vendor': ['react', 'react-dom', 'react-router-dom'],
                    'chart-vendor': ['recharts'],
                    'form-vendor': ['react-hook-form', 'zod', '@hookform/resolvers'],
                    'supabase': ['@supabase/supabase-js'],
                },
            },
        },
        // Minify
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: true,
                drop_debugger: true,
            },
        },
        // Target modern browsers
        target: 'es2020',
        // Enable source maps for production debugging (optional)
        sourcemap: false,
    },
    // Optimize deps
    optimizeDeps: {
        include: ['react', 'react-dom', 'react-router-dom'],
    },
});
