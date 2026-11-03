import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Static SPA — no backend. Synthetic JSON is served from public/data/.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, open: true },
  build: { outDir: 'dist' },
});
