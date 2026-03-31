import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // Rewrite /app and /app/* to index.html so React boots on those paths.
    // The landing page (/) is served as-is from index.html.
    historyApiFallback: {
      rewrites: [{ from: /^\/app(\/.*)?$/, to: '/index.html' }],
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test-setup.js',
  },
});
