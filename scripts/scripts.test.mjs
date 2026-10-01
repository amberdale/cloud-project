import { test } from 'node:test';
import assert from 'node:assert/strict';
import { columnType, entityToSql } from './entities-to-sql.mjs';
import { parseCsv, coerceCsvValue, prepareRecords } from './import-data.mjs';

test('JSON schema types map to Postgres columns', () => {
  assert.equal(columnType({ type: 'string' }), 'text');
  assert.equal(columnType({ type: 'string', format: 'date' }), 'date');
  assert.equal(columnType({ type: 'string', format: 'date-time' }), 'timestamptz');
  assert.equal(columnType({ type: 'integer' }), 'bigint');
  assert.equal(columnType({ type: 'number' }), 'double precision');
  assert.equal(columnType({ type: ['boolean', 'null'] }), 'boolean');
  assert.equal(columnType({ type: 'array' }), 'jsonb');
  assert.equal(columnType({}), 'jsonb');
});

test('entity SQL skips built-in fields, adds enum checks and the access preset', () => {
  const sql = entityToSql('crm', {
    name: 'Lead',
    'x-access': 'private',
    properties: {
      id: { type: 'string' },
      created_by: { type: 'string' },
      stage: { type: 'string', enum: ['new', "it's won"] },
      score: { type: 'integer', default: 0 },
    },
  });
  assert.match(sql, /create table if not exists "crm"\."Lead"/);
  assert.doesNotMatch(sql, /"created_by" text/);
  assert.match(sql, /check \("stage" is null or "stage" in \('new', 'it''s won'\)\)/);
  assert.match(sql, /"score" bigint default '0'::bigint/);
  assert.match(sql, /select platform\.setup_entity\('crm', 'Lead', 'private'\);/);
});

test('entity names are validated', () => {
  assert.throws(() => entityToSql('crm', { name: 'Bad"; drop', properties: {} }), /invalid entity name/);
});

test('CSV parser handles quotes, commas, newlines and BOM', () => {
  const rows = parseCsv('﻿id,title,tags\r\n1,"a, ""b""","[""x""]"\n2,"multi\nline",\n');
  assert.deepEqual(rows, [
    { id: '1', title: 'a, "b"', tags: '["x"]' },
    { id: '2', title: 'multi\nline', tags: '' },
  ]);
});

test('CSV values: empty is null, JSON arrays/objects are parsed', () => {
  assert.equal(coerceCsvValue(''), null);
  assert.deepEqual(coerceCsvValue('["x"]'), ['x']);
  assert.equal(coerceCsvValue('[not json'), '[not json');
  assert.equal(coerceCsvValue('42'), '42');
});

test('Base44 bookkeeping fields are dropped on import', () => {
  const [rec] = prepareRecords([{ id: 'a', created_by_id: 'b44user', is_sample: false, _x: 1, title: 't' }], new Set(['created_by_id', 'is_sample']));
  assert.deepEqual(rec, { id: 'a', title: 't' });
});
