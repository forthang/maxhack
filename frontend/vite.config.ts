import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite configuration for React + TypeScript project
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: true,
  },
  server: {
    port: 5173,
    proxy: {
      // Proxy API requests during development to the FastAPI backend.
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});