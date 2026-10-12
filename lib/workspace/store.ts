import { createHash, randomUUID } from "node:crypto";
import type { WorkspaceDatabase, SqlSession } from "./database";
import type { WorkspaceState } from "./types";
export const ownerId = "owner";
export const emptyState = (): WorkspaceState => ({ messages: [], facts: [], assignments: [], recommendations: [], development: [], events: [] });
export const contentHash = (value: string) => createHash("sha256").update(value).digest("hex");
export function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value && typeof value === "object") return `{${Object.entries(value).filter(([, item]) => item !== undefined).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => `${JSON.stringify(key)}:${canonicalJson(item)}`).join(",")}}`;
  return JSON.stringify(value) ?? "null";
}
export class WorkspaceError extends Error { status: number; constructor(message: string, status = 400) { super(message); this.status = status; } }
export type WorkspaceRecord = { revision: number; state: WorkspaceState };
export class WorkspaceStore {
  db: WorkspaceDatabase;
  constructor(db: WorkspaceDatabase) { this.db = db; }
  async read(project: string): Promise<WorkspaceRecord> {
    const result = await this.db.query("SELECT revision,state FROM hq_workspace WHERE owner_id=$1 AND project=$2", [ownerId, project]);
    return result.rows.length ? { revision: Number(result.rows[0].revision), state: result.rows[0].state as WorkspaceState } : { revision: 0, state: emptyState() };
  }
  async mutate<T>(project: string, requestId: string, revision: number, input: unknown, change: (record: WorkspaceRecord, sql: SqlSession) => Promise<T> | T) {
    const fingerprint = contentHash(canonicalJson(input));
    return this.db.transaction(async sql => {
      await sql.query("INSERT INTO hq_workspace(owner_id,project,state) VALUES($1,$2,$3::jsonb) ON CONFLICT DO NOTHING", [ownerId, project, JSON.stringify(emptyState())]);
      const locked = await sql.query("SELECT revision,state FROM hq_workspace WHERE owner_id=$1 AND project=$2 FOR UPDATE", [ownerId, project]);
      const prior = await sql.query("SELECT fingerprint,result FROM hq_workspace_operation WHERE owner_id=$1 AND project=$2 AND request_id=$3::uuid", [ownerId, project, requestId]);
      if (prior.rows.length) {
        if (prior.rows[0].fingerprint !== fingerprint) throw new WorkspaceError("This request ID was already used for different content.", 409);
        return { ...(prior.rows[0].result as object), replay: true } as T & { revision: number; replay?: boolean };
      }
      const deleted = await sql.query("SELECT request_id FROM hq_deleted_operation WHERE owner_id=$1 AND project=$2 AND request_id=$3::uuid", [ownerId, project, requestId]);
      if (deleted.rows.length) throw new WorkspaceError("This attempt belonged to deleted private context and cannot be replayed. Start a new attempt with a new request ID.", 409);
      const tombstone = await sql.query("SELECT project FROM hq_dispatch_tombstone WHERE owner_id=$1 AND request_id=$2::uuid", [ownerId, requestId]);
      if (tombstone.rows.length) throw new WorkspaceError("This development request ID is permanently reserved. Inspect the existing GitHub workflow; it cannot be replayed.", 409);
      const record: WorkspaceRecord = { revision: Number(locked.rows[0].revision), state: locked.rows[0].state as WorkspaceState };
      if (record.revision !== revision) throw new WorkspaceError("Project context changed in another session. Refresh before saving.", 409);
      const result = await change(record, sql);
      const next = record.revision + 1;
      await sql.query("UPDATE hq_workspace SET revision=$3,state=$4::jsonb,updated_at=now() WHERE owner_id=$1 AND project=$2", [ownerId, project, next, JSON.stringify(record.state)]);
      const response: T & { revision: number; replay?: boolean } = { ...result, revision: next };
      await sql.query("INSERT INTO hq_workspace_operation(owner_id,project,request_id,fingerprint,result) VALUES($1,$2,$3::uuid,$4,$5::jsonb)", [ownerId, project, requestId, fingerprint, JSON.stringify(response)]);
      return response;
    });
  }
  async finish(project: string, operationId: string, apply: (state: WorkspaceState) => void | boolean) {
    return this.db.transaction(async sql => {
      const locked = await sql.query("SELECT revision,state FROM hq_workspace WHERE owner_id=$1 AND project=$2 FOR UPDATE", [ownerId, project]);
      if (!locked.rows.length) return;
      const state = locked.rows[0].state as WorkspaceState;
      // A privacy deletion removes the pending operation: late provider results must not restore it.
      const operation = await sql.query("SELECT request_id FROM hq_workspace_operation WHERE owner_id=$1 AND project=$2 AND request_id=$3::uuid", [ownerId, project, operationId]);
      if (!operation.rows.length) return;
      if (apply(state) === false) return;
      await sql.query("UPDATE hq_workspace SET revision=revision+1,state=$3::jsonb,updated_at=now() WHERE owner_id=$1 AND project=$2", [ownerId, project, JSON.stringify(state)]);
    });
  }
  async delete(project: string, requestId: string, revision: number) {
    return this.db.transaction(async sql => {
      await sql.query("INSERT INTO hq_workspace(owner_id,project,state) VALUES($1,$2,$3::jsonb) ON CONFLICT DO NOTHING", [ownerId, project, JSON.stringify(emptyState())]);
      const locked = await sql.query("SELECT revision,state FROM hq_workspace WHERE owner_id=$1 AND project=$2 FOR UPDATE", [ownerId, project]);
      if (locked.rows.length && Number(locked.rows[0].revision) !== revision) throw new WorkspaceError("Project context changed. Refresh before deleting.", 409);
      if (!locked.rows.length && revision !== 0) throw new WorkspaceError("Project context changed.", 409);
      const pending = await sql.query("SELECT request_id FROM hq_dispatch_tombstone WHERE owner_id=$1 AND project=$2 AND outcome='pending'", [ownerId, project]);
      if (pending.rows.length) throw new WorkspaceError("A development submission is in progress. Wait for its outcome before deleting private context.", 409);
      await sql.query("INSERT INTO hq_deleted_operation(owner_id,project,request_id) SELECT owner_id,project,request_id FROM hq_workspace_operation WHERE owner_id=$1 AND project=$2 ON CONFLICT DO NOTHING", [ownerId, project]);
      await sql.query("DELETE FROM hq_workspace_operation WHERE owner_id=$1 AND project=$2", [ownerId, project]);
      await sql.query("INSERT INTO hq_workspace(owner_id,project,revision,state) VALUES($1,$2,$3,$4::jsonb) ON CONFLICT(owner_id,project) DO UPDATE SET revision=EXCLUDED.revision,state=EXCLUDED.state,updated_at=now()", [ownerId, project, revision + 1, JSON.stringify(emptyState())]);
      return { revision: revision + 1, message: "Private project context deleted. GitHub records and non-sensitive dispatch UUID tombstones are retained." };
    });
  }
  async dispatches(project: string) {
    const result = await this.db.query("SELECT request_id,outcome,issue_number,updated_at FROM hq_dispatch_tombstone WHERE owner_id=$1 AND project=$2 ORDER BY created_at DESC LIMIT 20", [ownerId, project]);
    return result.rows;
  }
}
export const event = (type: string, sourceRefs: string[] = []) => ({ id: randomUUID(), type, createdAt: new Date().toISOString(), sourceRefs });
