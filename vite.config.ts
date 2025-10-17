import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    watch: {
      ignored: ['**/node_modules/**', '**/dist/**', '**/.git/**'],
      usePolling: false,
    },
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    exclude: ['fsevents']
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // Core React bundle
            if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler')) {
              return 'react-core';
            }
            // Router - separate for route-based code splitting
            if (id.includes('react-router-dom')) {
              return 'router';
            }
            // Supabase - only loaded when needed
            if (id.includes('@supabase')) {
              return 'supabase';
            }
            // TanStack Query - defer until data fetching needed
            if (id.includes('@tanstack/react-query')) {
              return 'query';
            }
            // UI components - group all Radix UI together
            if (id.includes('@radix-ui')) {
              return 'radix-ui';
            }
            // Forms - only load when form pages accessed
            if (id.includes('react-hook-form') || id.includes('zod') || id.includes('@hookform')) {
              return 'forms';
            }
            // Icons - defer lucide-react
            if (id.includes('lucide-react')) {
              return 'icons';
            }
            // Charts - only load on pages with charts
            if (id.includes('recharts')) {
              return 'charts';
            }
            // Other vendor code
            return 'vendor-libs';
          }
        },
        // Optimize chunk loading
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    chunkSizeWarningLimit: 1000,
    target: 'esnext',
    minify: 'esbuild', // Faster than terser
    cssMinify: 'esbuild',
    reportCompressedSize: false, // Faster builds
    sourcemap: false
  },
  esbuild: {
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },
}));
