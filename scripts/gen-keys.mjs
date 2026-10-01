#!/usr/bin/env node
// Prints fresh secrets for .env: POSTGRES_PASSWORD, JWT_SECRET and the
// anon / service_role API keys (HS256 JWTs signed with JWT_SECRET).
//   node scripts/gen-keys.mjs >> .env   (then delete the empty placeholders)
import { createHmac, randomBytes } from 'node:crypto';

const b64url = (buf) => Buffer.from(buf).toString('base64url');

function sign(payload, secret) {
  const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = b64url(JSON.stringify(payload));
  const sig = createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${sig}`;
}

const jwtSecret = randomBytes(32).toString('hex');
const iat = Math.floor(Date.now() / 1000);
const exp = iat + 10 * 365 * 24 * 3600;

console.log(`POSTGRES_PASSWORD=${randomBytes(24).toString('hex')}`);
console.log(`JWT_SECRET=${jwtSecret}`);
console.log(`ANON_KEY=${sign({ role: 'anon', iss: 'supabase', iat, exp }, jwtSecret)}`);
console.log(`SERVICE_ROLE_KEY=${sign({ role: 'service_role', iss: 'supabase', iat, exp }, jwtSecret)}`);
