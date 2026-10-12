export const migrationSql = `
CREATE TABLE IF NOT EXISTS hq_workspace (
  owner_id text NOT NULL, project text NOT NULL, revision integer NOT NULL DEFAULT 0,
  state jsonb NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(owner_id, project)
);
CREATE TABLE IF NOT EXISTS hq_workspace_operation (
  owner_id text NOT NULL, project text NOT NULL, request_id uuid NOT NULL,
  fingerprint text NOT NULL, result jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(owner_id, project, request_id)
);
CREATE TABLE IF NOT EXISTS hq_dispatch_tombstone (
  owner_id text NOT NULL, project text NOT NULL, request_id uuid NOT NULL,
  outcome text NOT NULL, issue_number integer, created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(owner_id, request_id)
);
CREATE TABLE IF NOT EXISTS hq_deleted_operation (
  owner_id text NOT NULL, project text NOT NULL, request_id uuid NOT NULL,
  PRIMARY KEY(owner_id, project, request_id)
);
CREATE TABLE IF NOT EXISTS hq_schema_migration (version integer PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now());
INSERT INTO hq_schema_migration(version) VALUES(1) ON CONFLICT DO NOTHING;
`;
