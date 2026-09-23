import { formatTelemetryDate, type RepoTelemetry } from "@/lib/github/telemetry";

export default function RepoTelemetry({ telemetry, compact = false }: {
  telemetry: RepoTelemetry | null;
  compact?: boolean;
}) {
  if (!telemetry) return null;

  if (!telemetry.available) {
    return compact
      ? <div className="small telemetry-muted">GitHub telemetry unavailable</div>
      : <div className="telemetry-unavailable">
          <div className="eyebrow">GitHub activity</div>
          <p className="small">{telemetry.error}</p>
        </div>;
  }

  if (compact) {
    return <div className="telemetry-compact">
      <span className="activity-dot" aria-hidden="true" />
      <span className="small">
        {telemetry.latestCommit
          ? `${formatTelemetryDate(telemetry.latestCommit.date)} · ${telemetry.latestCommit.message}`
          : "GitHub connected"}
      </span>
    </div>;
  }

  return <div className="telemetry-block">
    <div className="eyebrow">Live GitHub activity</div>
    {telemetry.latestCommit && <div className="telemetry-commit">
      <a href={telemetry.latestCommit.url} target="_blank" rel="noreferrer">
        {telemetry.latestCommit.message}
      </a>
      <div className="small">
        {formatTelemetryDate(telemetry.latestCommit.date)} · {telemetry.latestCommit.sha.slice(0, 7)}
      </div>
    </div>}
    <div className="telemetry-meta">
      <span>{telemetry.defaultBranch ?? "main"} branch</span>
      {telemetry.openIssues !== undefined && <span>{telemetry.openIssues} open issue{telemetry.openIssues === 1 ? "" : "s"}</span>}
      {telemetry.visibility && <span>{telemetry.visibility}</span>}
    </div>
  </div>;
}
