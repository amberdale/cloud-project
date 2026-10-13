import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Relative paths: the build runs from a domain root, a subfolder or a Claude artifact.
  base: './',
  plugins: [react()],
  server: { port: 3000, host: true },
  preview: { port: 3000, host: true },
});
