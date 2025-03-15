import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
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
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  optimizeDeps: {
    exclude: ["lottie-web"],
  },
});