import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/pages': path.resolve(__dirname, './src/pages'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/stores': path.resolve(__dirname, './src/stores'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/types': path.resolve(__dirname, './src/types'),
    },
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false, // Disable source maps in production for smaller bundle
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Core vendors
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/react-router-dom')) {
            return 'vendor-router';
          }

          // Supabase & Auth
          if (id.includes('node_modules/@supabase')) {
            return 'vendor-auth';
          }

          // State management & queries
          if (id.includes('node_modules/@tanstack/react-query') || id.includes('node_modules/zustand')) {
            return 'vendor-state';
          }

          // UI libraries - split heavy radix components
          if (id.includes('node_modules/@radix-ui')) {
            return 'vendor-radix';
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'vendor-icons-lucide';
          }
          if (id.includes('node_modules/@heroicons')) {
            return 'vendor-icons-hero';
          }

          // Form libraries
          if (id.includes('node_modules/react-hook-form') || id.includes('node_modules/zod') || id.includes('node_modules/@hookform')) {
            return 'vendor-forms';
          }

          // Utilities
          if (id.includes('node_modules/date-fns')) {
            return 'vendor-date';
          }
          if (id.includes('node_modules/framer-motion')) {
            return 'vendor-animation';
          }

          // DnD
          if (id.includes('node_modules/@dnd-kit')) {
            return 'vendor-dnd';
          }

          // Analytics & monitoring
          if (id.includes('node_modules/posthog-js')) {
            return 'vendor-analytics';
          }

          // Other utilities
          if (id.includes('node_modules')) {
            return 'vendor-other';
          }
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
  server: {
    port: 3000,
    open: true,
  },
  preview: {
    port: 3000,
    open: true,
  },
});
