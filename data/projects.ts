export type ProjectStatus = "Active" | "Inactive" | "Parked" | "Complete";
export type ProjectStage = "Idea" | "Explore" | "Build" | "Launch" | "Operate";

export type Project = {
  slug: string;
  name: string;
  description: string;
  status: ProjectStatus;
  stage: ProjectStage;
  progress?: number;
  lastUpdate: string;
  currentStatus: string;
  nextStep: string;
  repo?: string;
  app?: string;
};

export const projects: Project[] = [
  {
    slug: "helm",
    name: "HELM",
    description: "Household operating system and intelligence layer.",
    status: "Active",
    stage: "Build",
    progress: 35,
    lastUpdate: "2026-09-22",
    currentStatus: "v0.1 reference implementation is in the repository; implementation review remains.",
    nextStep: "Verify Definition of Done and identify the highest-value missing implementation item.",
    repo: "https://github.com/fieldlogic-lab/HELM"
  },
  {
    slug: "surveyos",
    name: "SurveyOS",
    description: "Desktop operating system for survey intake, research, production, and delivery.",
    status: "Active",
    stage: "Build",
    progress: 55,
    lastUpdate: "2026-09-04",
    currentStatus: "Core modules are defined; delivery workflow is the next major operational module.",
    nextStep: "Continue Delivery Module and connect project state across the workflow."
  },
  {
    slug: "sbu-crew-coach",
    name: "SBU Crew Coach",
    description: "Coaching operations app for training, attendance, planning, and weather decisions.",
    status: "Active",
    stage: "Build",
    progress: 75,
    lastUpdate: "2026-09-16",
    currentStatus: "Core planning work is implemented; attendance integration still needs validation.",
    nextStep: "Validate live attendance sync and simplify the Today editing workflow.",
    repo: "https://github.com/fieldlogic-lab/sbu-crew-coach"
  },
  {
    slug: "fire-island-game",
    name: "Fire Island: The Game",
    description: "Modular retro mini-game collection inspired by Fire Island.",
    status: "Active",
    stage: "Build",
    progress: 45,
    lastUpdate: "2026-09-11",
    currentStatus: "Godot validation failures remain unresolved in the latest known state.",
    nextStep: "Resolve validation failure before adding more gameplay scope.",
    repo: "https://github.com/fieldlogic-lab/Fire-Island-The-Game"
  }
];
