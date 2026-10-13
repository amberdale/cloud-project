// Builds the workspace into one self-contained HTML file: scripts, styles
// and photos inlined. Writes dist-embed/amberdale-workspace.html (a full
// document) and dist-embed/amberdale-workspace.fragment.html (no
// <html>/<head>/<body>, for pasting into a page or a Claude artifact).
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const out = 'dist-embed';
execSync('vite build', { stdio: 'inherit', env: { ...process.env, EMBED: '1' } });

const html = readFileSync(join(out, 'workspace.html'), 'utf8');
const assets = join(out, 'assets');
const files = readdirSync(assets);
const read = (ext) => readFileSync(join(assets, files.find((f) => f.endsWith(ext))), 'utf8');
// Keep "</script>" inside the bundle from closing the inline tag.
const js = read('.js').replace(/<\/script/gi, '<\\/script');
const css = read('.css');

const full = html
  .replace(/<script type="module"[^>]*><\/script>/, () => `<script type="module">${js}</script>`)
  .replace(/<link rel="stylesheet"[^>]*href="\.\/assets\/[^"]+\.css"[^>]*>/, () => `<style>${css}</style>`)
  .replace(/\s*<link rel="icon"[^>]*>/, '');
writeFileSync(join(out, 'amberdale-workspace.html'), full);

const head = full.match(/<head>([\s\S]*?)<\/head>/)[1].replace(/<meta charset[^>]*>|<meta name="viewport"[^>]*>/g, '');
const body = full.match(/<body>([\s\S]*?)<\/body>/)[1];
writeFileSync(join(out, 'amberdale-workspace.fragment.html'), `${head.trim()}\n${body.trim()}\n`);

const kb = (s) => `${Math.round(Buffer.byteLength(s) / 1024)} KB`;
console.log(`amberdale-workspace.html ${kb(full)}`);
