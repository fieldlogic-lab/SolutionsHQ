import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

test('migration CLI redacts invalid credential URLs and reports missing configuration safely',()=>{
 const script=fileURLToPath(new URL('../scripts/migrate-workspace.mjs',import.meta.url));
 const env={...process.env,DATABASE_URL:'postgres://owner:private-secret@invalid host/database'};
 const invalid=spawnSync(process.execPath,[script],{cwd:tmpdir(),env,encoding:'utf8',timeout:15000});
 assert.equal(invalid.status,1);
 assert.match(invalid.stderr,/Workspace migration failed/);
 assert.doesNotMatch(invalid.stderr,/private-secret|invalid host|postgres:\/\//);
 delete env.DATABASE_URL;
 const missing=spawnSync(process.execPath,[script],{cwd:tmpdir(),env,encoding:'utf8',timeout:15000});
 assert.equal(missing.status,1);assert.match(missing.stderr,/Set server DATABASE_URL/);
});
