import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// EMBED=1 builds only the workspace with every asset inlined, for
// scripts/build-embed.mjs to fold into one HTML file.
const embed = process.env.EMBED === '1';

export default defineConfig({
  // Relative paths: the build runs from a domain root, a subfolder or a Claude artifact.
  base: './',
  plugins: [react()],
  build: embed
    ? {
        outDir: 'dist-embed',
        assetsInlineLimit: Number.MAX_SAFE_INTEGER,
        cssCodeSplit: false,
        modulePreload: false,
        rollupOptions: { input: resolve(__dirname, 'workspace.html'), output: { inlineDynamicImports: true } },
      }
    : {
        rollupOptions: { input: { main: resolve(__dirname, 'index.html'), workspace: resolve(__dirname, 'workspace.html') } },
      },
  server: { port: 3000, host: true },
  preview: { port: 3000, host: true },
});
