import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';

// Builds straight into hive/ui, which the hub serves. Dev server proxies the API.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/',
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  build: { outDir: '../ui', emptyOutDir: true, chunkSizeWarningLimit: 900 },
  server: { port: 4401, proxy: { '/api': 'http://127.0.0.1:4400' } },
});
