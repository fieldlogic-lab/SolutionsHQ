export const teamProjects: Record<string, { repo: string; enabled: boolean }> = {
  "hydrographic-usv": { repo: "fieldlogic-lab/TriDroneUpgrades", enabled: true },
  surveyos: { repo: "fieldlogic-lab/SurveyOS", enabled: false },
  helm: { repo: "fieldlogic-lab/HELM", enabled: false },
  "sbu-crew-coach": { repo: "fieldlogic-lab/sbu-crew-coach", enabled: false },
  "fire-island-game": { repo: "fieldlogic-lab/Fire-Island-The-Game", enabled: false },
  "point-o-woods": { repo: "fieldlogic-lab/Point-O-Woods", enabled: false },
  "party-chief": { repo: "fieldlogic-lab/PartyChief", enabled: false },
  "solutions-hq": { repo: "fieldlogic-lab/SolutionsHQ", enabled: false },
};
export const requestMarker = (requestId: string, project: string) => `<!-- solutionshq-request:${JSON.stringify({ version: 1, requestId, project })} -->`;
export function parseRequest(body: string): { version: number; requestId: string; project: string } | null {
  try { const value = JSON.parse(body.match(/<!-- solutionshq-request:(.*?) -->/)?.[1] ?? "null");
    return value?.version === 1 && typeof value.requestId === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value.requestId) && typeof value.project === "string" && Object.hasOwn(teamProjects, value.project) ? value : null;
  } catch { return null; }
}
export function parseEvent(body: string) {
  try {
    const event = JSON.parse(body.match(/<!-- solutionshq-event:(.*?) -->/)?.[1] ?? "null");
    if (!event || event.version !== 1 || typeof event.requestId !== "string" || !["plan", "status", "qa"].includes(event.type)) return null;
    for (const field of ["summary", "status", "headSha", "buildStatus"]) if (event[field] !== undefined && typeof event[field] !== "string") return null;
    if (event.prNumber !== undefined && (!Number.isSafeInteger(event.prNumber) || event.prNumber < 1)) return null;
    return event as Record<string, unknown>;
  } catch { return null; }
}
