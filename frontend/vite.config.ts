import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import compression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    react(),
    compression({ algorithm: 'gzip' }),
    compression({ algorithm: 'brotliCompress', ext: '.br' }),
  ],
  build: {
    minify: 'esbuild', // 'esbuild' is faster, 'terser' is more thorough
    cssMinify: true,
    chunkSizeWarningLimit: 800, // Increase the warning limit if needed
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor packages into separate chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'mui-core': ['@mui/material', '@mui/system'],
          'mui-icons': ['@mui/icons-material'],
          'data-grid': ['@mui/x-data-grid'],
          'utils': ['date-fns', 'axios'],
          // Add animation libraries
          'animations': ['framer-motion'],
          // add lottiejs
          'lottie': ['lottie-web'],
          'mui': [
            '@mui/x-charts',
            '@mui/x-data-grid-pro',
            '@mui/x-date-pickers',
            '@mui/x-tree-view',
          ],
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    reportCompressedSize: false,
    // Target modern browsers for smaller bundle
    target: 'es2020'
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  optimizeDeps: {
    exclude: ["lottie-web"],
  },
  server: {
    port: 3001,
    hmr: {
      protocol: 'ws',
      host: 'localhost'
    }
  }  
});