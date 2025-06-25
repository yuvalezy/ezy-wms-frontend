import path from "path"
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [
    react(),
    // Use PostCSS with Tailwind instead of the Vite plugin for better compatibility
  ],
  css: {
    postcss: './postcss.config.js',
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5001,
  },
});
