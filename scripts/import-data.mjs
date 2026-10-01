#!/usr/bin/env node
// Imports records exported from Base44 (CSV or JSON) into an entity table.
// Upserts on id, so it is safe to re-run. Original ids are kept so links
// between entities keep working.
//
//   node scripts/import-data.mjs <app> <Entity> <file.csv|file.json> [--skip field1,field2]
//
// Needs SERVICE_ROLE_KEY and DOMAIN in .env (or SUPABASE_URL to override the API URL).
import { readFileSync, existsSync } from 'node:fs';

// Base44 bookkeeping fields with no counterpart here. created_by_id holds a
// Base44 user id (not one of ours), so ownership is matched by created_by email.
const DEFAULT_SKIP = ['created_by_id', 'is_sample', 'app_id', 'entity_name'];

export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); rows.push(row); row = []; field = '';
    } else field += c;
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  const [header, ...data] = rows.filter((r) => r.some((v) => v !== ''));
  return data.map((r) => Object.fromEntries(header.map((h, i) => [h.replace(/^﻿/, ''), r[i] ?? ''])));
}

// CSV has no types: empty means null, and arrays/objects arrive as JSON text.
export function coerceCsvValue(v) {
  if (v === '') return null;
  if (/^[[{]/.test(v)) {
    try { return JSON.parse(v); } catch { /* plain text that happens to start with a bracket */ }
  }
  return v;
}

export function prepareRecords(records, skip) {
  return records.map((rec) =>
    Object.fromEntries(Object.entries(rec).filter(([k]) => !skip.has(k) && !k.startsWith('_'))),
  );
}

function loadEnv() {
  if (!existsSync('.env')) return;
  for (const line of readFileSync('.env', 'utf8').split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2];
  }
}

async function main() {
  const args = process.argv.slice(2);
  const skipIdx = args.indexOf('--skip');
  const extraSkip = skipIdx >= 0 ? args.splice(skipIdx, 2)[1].split(',') : [];
  const [app, entity, file] = args;
  if (!file) {
    console.error('usage: import-data.mjs <app> <Entity> <file.csv|file.json> [--skip a,b]');
    process.exit(1);
  }
  loadEnv();
  const url = process.env.SUPABASE_URL || `https://api.${process.env.DOMAIN}`;
  const key = process.env.SERVICE_ROLE_KEY;
  if (!key) throw new Error('SERVICE_ROLE_KEY not set');

  const text = readFileSync(file, 'utf8');
  let records = file.endsWith('.json')
    ? JSON.parse(text)
    : parseCsv(text).map((r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, coerceCsvValue(v)])));
  records = prepareRecords(records, new Set([...DEFAULT_SKIP, ...extraSkip]));

  // PostgREST takes the column list from the first row unless told otherwise,
  // and JSON exports can have different fields per record.
  const columns = [...new Set(records.flatMap((r) => Object.keys(r)))].join(',');

  const BATCH = 500;
  for (let i = 0; i < records.length; i += BATCH) {
    const batch = records.slice(i, i + BATCH);
    const qs = new URLSearchParams({ on_conflict: 'id', columns });
    const res = await fetch(`${url}/rest/v1/${encodeURIComponent(entity)}?${qs}`, {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        'Content-Profile': app,
        Prefer: 'resolution=merge-duplicates,missing=default,return=minimal',
      },
      body: JSON.stringify(batch),
    });
    if (!res.ok) {
      console.error(`batch starting at row ${i} failed: ${res.status} ${await res.text()}`);
      process.exit(1);
    }
    console.log(`imported ${Math.min(i + BATCH, records.length)}/${records.length}`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((e) => { console.error(e.message); process.exit(1); });
}
