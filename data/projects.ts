export type ProjectStatus = "Active" | "Inactive" | "Parked" | "Complete";
export type ProjectStage = "Idea" | "Explore" | "Build" | "Launch" | "Operate";

export type ProjectLink = {
  label: string;
  url: string;
};

export type Project = {
  slug: string;
  name: string;
  description: string;
  status: ProjectStatus;
  stage: ProjectStage;
  lastUpdate: string;
  currentStatus: string;
  nextStep: string;
  repo?: string;
  app?: string;
  supportingLinks?: ProjectLink[];
  chatgptProjectUrl?: string;
};

export const projects: Project[] = [
  {
    slug: "helm",
    name: "HELM",
    description: "Household operating system and intelligence layer.",
    status: "Active",
    stage: "Operate",
    lastUpdate: "2026-09-23",
    currentStatus: "The household prototype is ready for real household evaluation. Live weather and marine data, Boat, Utilities, HELM TV rotation, and Port Jefferson practice-weather refinements are merged and verified.",
    nextStep: "Run HELM on the intended household computer and a second device or TV, record friction from real use, and prioritize fixes before adding another major module.",
    repo: "https://github.com/fieldlogic-lab/HELM"
  },
  {
    slug: "surveyos",
    name: "SurveyOS",
    description: "Desktop operating system for survey intake, research, production, GIS, and delivery.",
    status: "Active",
    stage: "Build",
    lastUpdate: "2026-09-04",
    currentStatus: "SurveyOS is in consolidation with working intake, research-folder tooling, SQLite-backed project/quote/delivery/invoice/payment/closeout state, and GeoPackage project synchronization. A unified release has not yet been cut.",
    nextStep: "Validate the consolidated end-to-end workflow from accepted quote through project creation, GIS, delivery, invoice, payment, and closeout; then stabilize module boundaries and the responsive UI before the first unified release.",
    repo: "https://github.com/fieldlogic-lab/SurveyOS",
    supportingLinks: [
      { label: "Research workflow repo", url: "https://github.com/fieldlogic-lab/parcel-research-workflow" }
    ]
  },
  {
    slug: "sbu-crew-coach",
    name: "SBU Crew Coach",
    description: "Coaching operations app for training, attendance, planning, public information, and weather decisions.",
    status: "Active",
    stage: "Operate",
    lastUpdate: "2026-09-16",
    currentStatus: "Core coaching and planning systems are operating. Drive-backed planning work is established and the Google OAuth nightly attendance-refresh preview is ready, while the live attendance path still needs production validation.",
    nextStep: "Validate live attendance synchronization in production, simplify the Today editing workflow, and classify the older ChatGPT Sites builds as reference or archive rather than parallel sources of truth.",
    repo: "https://github.com/fieldlogic-lab/sbu-crew-coach",
    supportingLinks: [
      { label: "Public site repo", url: "https://github.com/fieldlogic-lab/rtpny-public-site" }
    ]
  },
  {
    slug: "fire-island-game",
    name: "Fire Island: The Game",
    description: "Five-event retro arcade game inspired by Fire Island.",
    status: "Active",
    stage: "Build",
    lastUpdate: "2026-09-21",
    currentStatus: "v0.7a is a complete five-event prototype. The latest work added a Ferry Dash compatibility shim; earlier Godot validation failures still warrant a clean QA pass. Scope should now favor polish and reliability rather than new events.",
    nextStep: "Run the full five-event playthrough in Godot 4.7.2 or newer, fix any remaining validation or flow issues, then move into v0.8 polish: scoring balance, event flow, initials, attract mode, arcade typography, and cabinet presentation.",
    repo: "https://github.com/fieldlogic-lab/Fire-Island-The-Game"
  },
  {
    slug: "point-o-woods",
    name: "Point O’ Woods",
    description: "Short top-down 8-bit mystery adventure set on Fire Island.",
    status: "Active",
    stage: "Build",
    lastUpdate: "2026-09-04",
    currentStatus: "The existing four-area prototype has a reusable Chapter One foundation with persistent state, objectives, dialogue, reusable interactables, and a single interaction input.",
    nextStep: "Place the opening investigation beats in the existing maps, then build the Back Path and Restricted Interior.",
    repo: "https://github.com/fieldlogic-lab/Point-O-Woods"
  },
  {
    slug: "solutions-hq",
    name: "Solutions HQ",
    description: "Portfolio, re-entry, and innovation command center for Massi Solutions.",
    status: "Active",
    stage: "Build",
    lastUpdate: "2026-09-23",
    currentStatus: "v0.1 is deployed and healthy on Vercel. Project pages, Innovation Lab, production build validation, and the first re-entry workflow are in place.",
    nextStep: "Finish the project-resume experience and replace manually maintained repository activity with GitHub-backed status and checkpoints.",
    repo: "https://github.com/fieldlogic-lab/SolutionsHQ",
    app: "https://solutions-hq.vercel.app/"
  }
];
