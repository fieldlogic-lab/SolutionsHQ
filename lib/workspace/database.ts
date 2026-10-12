import { Pool } from "pg";
export type QueryResult = { rows: Record<string, unknown>[]; rowCount?: number | null };
export interface SqlSession { query(sql: string, values?: unknown[]): Promise<QueryResult> }
export interface WorkspaceDatabase extends SqlSession { transaction<T>(fn: (session: SqlSession) => Promise<T>): Promise<T> }
let pool: Pool | undefined;
export function database(): WorkspaceDatabase {
  if (!process.env.DATABASE_URL) throw new Error("Private workspace database is not configured. Set server DATABASE_URL and run npm run db:migrate.");
  pool ??= new Pool({ connectionString: process.env.DATABASE_URL, max: 3, connectionTimeoutMillis: 10000, statement_timeout: 15000 });
  const current = pool;
  return {
    query: async (sql, values) => current.query(sql, values),
    transaction: async fn => {
      const client = await current.connect();
      try { await client.query("BEGIN"); const value = await fn(client); await client.query("COMMIT"); return value; }
      catch (error) { await client.query("ROLLBACK"); throw error; }
      finally { client.release(); }
    },
  };
}
