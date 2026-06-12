import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    server: {
        port: 5100,
        allowedHosts: true,
        headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            Pragma: 'no-cache',
            Expires: '0',
            'Surrogate-Control': 'no-store',
        },
    },
    plugins: [
        react(),
        
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
