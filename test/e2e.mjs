// End-to-end check of the stack + base44-compat adapter, through Caddy over HTTPS.
// LOCAL ONLY: it wipes all users and the demo app's data. See README "Testing".
import { createClient as createSupabase } from '@supabase/supabase-js';
import { createClient } from '../packages/base44-compat/src/index.js';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const env = Object.fromEntries(
  readFileSync('.env', 'utf8').split('\n')
    .map((l) => l.match(/^([A-Z_]+)=(.*)$/)).filter(Boolean).map((m) => [m[1], m[2]]),
);
const URL_ = 'https://api.localhost';
if (env.DOMAIN !== 'localhost') {
  console.error('Refusing to run: the e2e test deletes all users. Use a local stack with DOMAIN=localhost.');
  process.exit(1);
}
const psql = (sql) => execSync(`docker compose exec -T db psql -U supabase_admin -h localhost -d postgres -Atc "${sql}"`).toString().trim();

async function makeUser(email) {
  const res = await fetch(`${URL_}/auth/v1/admin/users`, {
    method: 'POST',
    headers: { apikey: env.SERVICE_ROLE_KEY, Authorization: `Bearer ${env.SERVICE_ROLE_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'pw-123456!', email_confirm: true, user_metadata: { full_name: email.split('@')[0] } }),
  });
  assert.ok(res.ok || res.status === 422, `create user ${res.status} ${await res.text()}`);
  const supabase = createSupabase(URL_, env.ANON_KEY, { auth: { persistSession: false } });
  const { error } = await supabase.auth.signInWithPassword({ email, password: 'pw-123456!' });
  assert.ifError(error);
  return { supabase, base44: createClient({ supabase, schema: 'demo' }) };
}

psql('truncate demo.\\"Task\\", demo.\\"Note\\", demo.profiles; delete from auth.users');
let step = 0;
const ok = (msg) => console.log(`  ✓ ${++step}. ${msg}`);

const alice = await makeUser('alice@test.dev');
const bob = await makeUser('bob@test.dev');

const me = await alice.base44.auth.me();
assert.equal(me.email, 'alice@test.dev'); assert.equal(me.role, 'user'); assert.equal(me.full_name, 'alice');
ok('auth.me() creates the profile on first visit with role=user');

const t1 = await alice.base44.entities.Task.create({ title: 'Ship it', priority: 3, tags: ['a', 'b'], due_date: '2026-12-01', created_by: 'evil@x.com' });
assert.equal(t1.created_by, 'alice@test.dev'); assert.equal(t1.status, 'todo'); assert.deepEqual(t1.tags, ['a', 'b']);
assert.match(t1.id, /^[0-9a-f]{32}$/); assert.ok(t1.created_date);
ok('create() sets id/created_date/created_by; spoofed created_by is ignored; defaults applied');

const bulk = await alice.base44.entities.Task.bulkCreate([{ title: 'Two', priority: 1 }, { title: 'Three', priority: 5, status: 'done' }]);
assert.equal(bulk[0].status, 'todo', 'missing field in bulkCreate gets the column default');
const list = await alice.base44.entities.Task.list('-priority', 2);
assert.deepEqual(list.map((t) => t.title), ['Three', 'Ship it']);
const filtered = await alice.base44.entities.Task.filter({ priority: { $gte: 2 }, status: { $in: ['todo', 'done'] } }, 'priority');
assert.deepEqual(filtered.map((t) => t.title), ['Ship it', 'Three']);
const nin = await alice.base44.entities.Task.filter({ status: { $nin: ['done'] } });
assert.equal(nin.length, 2);
await alice.base44.entities.Task.create({ title: 'He said "hi", ok', status: null });
const ne = await alice.base44.entities.Task.filter({ status: { $ne: 'done' }, title: { $ne: 'Two' } });
assert.deepEqual(ne.map((t) => t.title).sort(), ['He said "hi", ok', 'Ship it']);
assert.equal((await alice.base44.entities.Task.filter({ title: { $in: ['He said "hi", ok'] } })).length, 1);
assert.equal((await alice.base44.entities.Task.filter({ title: { $nin: ['He said "hi", ok', 'Two'] } })).length, 2);
assert.equal((await alice.base44.entities.Task.filter({ status: null })).length, 1);
await alice.base44.entities.Task.deleteMany({ status: null });
const skip = await alice.base44.entities.Task.list('priority', 1, 1);
assert.deepEqual(skip.map((t) => t.title), ['Ship it']);
ok('bulkCreate defaults; list/filter: sort, limit, skip, $gte, $in, $nin, $ne (incl. empty fields), quoting; deleteMany');

await assert.rejects(alice.base44.entities.Task.create({ title: 'x', status: 'bogus' }), /Task_status_enum/);
ok('enum values enforced by the database');

const upd = await alice.base44.entities.Task.update(t1.id, { status: 'in_progress', created_by: 'evil@x.com' });
assert.equal(upd.status, 'in_progress'); assert.equal(upd.created_by, 'alice@test.dev'); assert.ok(upd.updated_date > t1.updated_date);
assert.equal((await alice.base44.entities.Task.get(t1.id)).status, 'in_progress');
ok('update()/get(); updated_date bumps, created_by stays');

assert.equal((await bob.base44.entities.Task.get(t1.id)).title, 'Ship it');
await assert.rejects(bob.base44.entities.Task.update(t1.id, { title: 'hacked' }), (e) => e.response.status === 404);
await bob.base44.entities.Task.delete(t1.id);
assert.ok(await alice.base44.entities.Task.get(t1.id));
ok("shared preset: bob reads alice's task but cannot edit or delete it");

const note = await alice.base44.entities.Note.create({ body: 'secret' });
assert.equal((await bob.base44.entities.Note.list()).length, 0);
await assert.rejects(bob.base44.entities.Note.get(note.id), (e) => e.status === 404);
assert.equal((await alice.base44.entities.Note.list()).length, 1);
ok("private preset: bob cannot see alice's note");

const anon = createClient({ supabase: createSupabase(URL_, env.ANON_KEY, { auth: { persistSession: false } }), schema: 'demo' });
await assert.rejects(anon.entities.Task.list(), /permission denied/);
await assert.rejects(anon.auth.me(), (e) => e.status === 401);
ok('signed-out visitors cannot read data; me() throws 401');

const me2 = await alice.base44.auth.updateMe({ role: 'admin', theme: 'dark', full_name: 'Alice A' });
assert.equal(me2.role, 'user'); assert.equal(me2.theme, 'dark'); assert.equal(me2.full_name, 'Alice A');
ok('updateMe stores custom fields but cannot self-promote to admin');

assert.equal((await alice.base44.entities.User.list()).length, 1);
await bob.base44.auth.me();
psql("update demo.profiles set role='admin' where email='alice@test.dev'");
assert.equal((await alice.base44.entities.User.list()).length, 2);
const bobTask = await bob.base44.entities.Task.create({ title: "bob's" });
assert.equal((await alice.base44.entities.Task.update(bobTask.id, { title: 'admin edit' })).title, 'admin edit');
const bobProfile = (await alice.base44.entities.User.filter({ email: 'bob@test.dev' }))[0];
assert.equal((await alice.base44.entities.User.update(bobProfile.id, { role: 'admin' })).role, 'admin');
const bobDemoted = await bob.base44.auth.updateMe({ role: 'user' });
assert.equal(bobDemoted.role, 'admin');
ok('admins list users, edit any row and change roles; users cannot change their own role');

const file = new File(['hello from storage'], 'My report (final).txt', { type: 'text/plain' });
const { file_url } = await alice.base44.integrations.Core.UploadFile({ file });
assert.match(file_url, /^https:\/\/api\.localhost\/storage\/v1\/object\/public\/demo\/[0-9a-f-]+\/[0-9a-f-]+-My_report_final_.txt$/);
assert.equal(await (await fetch(file_url)).text(), 'hello from storage');
const aliceId = (await alice.base44.auth.me()).id;
const { error: crossErr } = await bob.supabase.storage.from('demo').upload(`${aliceId}/x.txt`, new Blob(['x']));
assert.ok(crossErr, 'bob must not write into alice folder');
ok('UploadFile returns a working public file_url; users cannot write into other users folders');

await assert.rejects(alice.base44.integrations.Core.InvokeLLM({ prompt: 'hi' }), (e) => e.status === 501 && /InvokeLLM/.test(e.message));
const withLLM = createClient({ supabase: alice.supabase, schema: 'demo', integrations: { InvokeLLM: async ({ prompt }) => `echo:${prompt}` } });
assert.equal(await withLLM.integrations.Core.InvokeLLM({ prompt: 'hi' }), 'echo:hi');
ok('unmigrated integrations fail loudly (501); custom handlers plug in');

console.log('\nall e2e checks passed');
