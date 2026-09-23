export type RepoTelemetry = {
  repository: string;
  available: boolean;
  latestCommit?: {
    sha: string;
    message: string;
    date: string;
    url: string;
  };
  openIssues?: number;
  defaultBranch?: string;
  visibility?: "public" | "private";
  error?: string;
};

function parseGitHubRepo(repoUrl?: string) {
  if (!repoUrl) return null;
  const match = repoUrl.match(/^https:\/\/github\.com\/([^/]+)\/([^/#?]+?)(?:\.git)?$/i);
  if (!match) return null;
  return { owner: match[1], repo: match[2] };
}

function githubHeaders(): HeadersInit {
  const token = process.env.GITHUB_TOKEN;
  return {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function getRepoTelemetry(repoUrl?: string): Promise<RepoTelemetry | null> {
  const parsed = parseGitHubRepo(repoUrl);
  if (!parsed) return null;

  const repository = `${parsed.owner}/${parsed.repo}`;
  const headers = githubHeaders();
  const options = { headers, next: { revalidate: 300 } };

  try {
    const repoResponse = await fetch(
      `https://api.github.com/repos/${parsed.owner}/${parsed.repo}`,
      options
    );

    if (!repoResponse.ok) {
      return {
        repository,
        available: false,
        error: repoResponse.status === 404
          ? "Repository telemetry is unavailable. Private repositories require GITHUB_TOKEN."
          : `GitHub returned ${repoResponse.status}.`,
      };
    }

    const repoData = await repoResponse.json();

    const [commitResponse, issuesResponse] = await Promise.all([
      fetch(
        `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/commits?per_page=1&sha=${encodeURIComponent(repoData.default_branch)}`,
        options
      ),
      fetch(
        `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/issues?state=open&per_page=100`,
        options
      ),
    ]);

    const commits = commitResponse.ok ? await commitResponse.json() : [];
    const issues = issuesResponse.ok ? await issuesResponse.json() : [];

    const latest = Array.isArray(commits) ? commits[0] : undefined;
    const openIssues = Array.isArray(issues)
      ? issues.filter((item: { pull_request?: unknown }) => !item.pull_request).length
      : undefined;

    return {
      repository,
      available: true,
      defaultBranch: repoData.default_branch,
      visibility: repoData.private ? "private" : "public",
      openIssues,
      latestCommit: latest ? {
        sha: latest.sha,
        message: latest.commit?.message?.split("\n")[0] ?? "Commit",
        date: latest.commit?.committer?.date ?? latest.commit?.author?.date ?? "",
        url: latest.html_url,
      } : undefined,
    };
  } catch {
    return {
      repository,
      available: false,
      error: "GitHub telemetry could not be reached.",
    };
  }
}

export function formatTelemetryDate(value?: string) {
  if (!value) return "Unknown";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}
