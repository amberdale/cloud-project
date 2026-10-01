import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyFilter, applySort, applyPaging, flattenProfile } from '../src/index.js';

// Records the supabase-js query builder calls made by the adapter.
function recorder() {
  const calls = [];
  const q = new Proxy({}, {
    get: (_, method) => (...args) => {
      calls.push([method, ...args]);
      return q;
    },
  });
  return { q, calls };
}

test('sort defaults to newest first and supports multiple fields', () => {
  let r = recorder();
  applySort(r.q);
  assert.deepEqual(r.calls, [['order', 'created_date', { ascending: false }]]);

  r = recorder();
  applySort(r.q, '-priority, title');
  assert.deepEqual(r.calls, [
    ['order', 'priority', { ascending: false }],
    ['order', 'title', { ascending: true }],
  ]);
});

test('paging maps limit and skip to limit/range', () => {
  let r = recorder();
  applyPaging(r.q, 10);
  assert.deepEqual(r.calls, [['limit', 10]]);

  r = recorder();
  applyPaging(r.q, 10, 20);
  assert.deepEqual(r.calls, [['range', 20, 29]]);

  r = recorder();
  applyPaging(r.q);
  assert.deepEqual(r.calls, []);
});

test('filters translate Base44 operators', () => {
  const r = recorder();
  applyFilter(r.q, {
    status: 'open',
    archived_at: null,
    priority: { $gte: 2, $lt: 5 },
    tag: { $in: ['a', 'b "c"'] },
    owner: { $ne: 'x' },
    name: { $regex: '^ab', $options: 'i' },
  });
  assert.deepEqual(r.calls, [
    ['eq', 'status', 'open'],
    ['is', 'archived_at', null],
    ['gte', 'priority', 2],
    ['lt', 'priority', 5],
    ['filter', 'tag', 'in', '("a","b \\"c\\"")'],
    ['or', 'owner.is.null,owner.neq."x"'],
    ['filter', 'name', 'imatch', '^ab'],
  ]);
});

test('unsupported operators fail loudly instead of being ignored', () => {
  assert.throws(() => applyFilter(recorder().q, { $or: [] }), /not supported/);
  assert.throws(() => applyFilter(recorder().q, { a: { $elemMatch: {} } }), /not supported/);
});

test('profiles are flattened so custom fields look like Base44 user fields', () => {
  assert.deepEqual(flattenProfile({ id: '1', role: 'user', data: { theme: 'dark', role: 'admin' } }), {
    id: '1',
    role: 'user',
    theme: 'dark',
  });
});
