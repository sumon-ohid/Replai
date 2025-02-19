import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [
      react(),
    ],
    base: mode === 'production' ? 'https://easy-email-production.up.railway.app/' : '/',
    server: {
      allowedHosts: ['email-agent.up.railway.app', 'divine-forgiveness-production.up.railway.app'],
    },
  };
});
