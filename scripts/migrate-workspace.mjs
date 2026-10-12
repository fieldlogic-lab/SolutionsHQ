import { Pool } from "pg";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
let pool;
let client;
let transaction = false;
try {
  try { process.loadEnvFile('.env.local'); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  if (!process.env.DATABASE_URL) {
    console.error('Set server DATABASE_URL in your shell or ignored .env.local before running migration.');
    process.exitCode = 1;
  } else {
  const source = stripTypeScriptTypes(await readFile(new URL('../lib/workspace/schema.ts', import.meta.url), 'utf8'));
  const { migrationSql } = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
  pool = new Pool({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 10000, max: 1 });
  client = await pool.connect();
  await client.query('BEGIN');
  transaction = true;
  await client.query('SELECT pg_advisory_xact_lock(8260412)');
  await client.query(migrationSql);
  await client.query('COMMIT');
  transaction = false;
  console.log('Workspace schema migration 1 applied.');
  }
} catch {
  if (client && transaction) await client.query('ROLLBACK').catch(() => {});
  // Driver errors can embed connection URLs. Never print the raw error or stack.
  console.error('Workspace migration failed. Check private database configuration, connectivity, permissions, and schema. Connection details were withheld.');
  process.exitCode = 1;
} finally {
  client?.release();
  if (pool) await pool.end().catch(() => { process.exitCode = 1; });
}
