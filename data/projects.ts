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
    slug: "party-chief",
    name: "Party Chief",
    description: "Mobile draft-beer serving product for distributors and keg retailers.",
    status: "Active",
    stage: "Build",
    lastUpdate: "2026-09-14",
    currentStatus: "A functional-looking prototype and business foundation exist. The remaining proof work is CO2 mounting, plumbing, cooling/enclosure completion, live-keg testing, cleanup, and distributor validation.",
    nextStep: "Create the dedicated Party Chief repository from the existing prep package, finish the prototype-to-proof build, run a live-keg test, and capture distributor feedback.",
    supportingLinks: [
      { label: "GitHub project entry", url: "https://github.com/fieldlogic-lab/SolutionsHQ/issues/2" },
      { label: "Project scope", url: "https://github.com/fieldlogic-lab/SolutionsHQ/blob/main/docs/scopes/PARTY_CHIEF_SCOPE.md" }
    ]
  },
  {
    slug: "hydrographic-usv",
    name: "Hydrographic USV",
    description: "Compact autonomous survey vessel for shallow-water hydrographic work.",
    status: "Active",
    stage: "Explore",
    lastUpdate: "2026-09-12",
    currentStatus: "The concept architecture exists around dual GNSS, ArduPilot, 12V LiFePO4 power, printable components, and trolling-motor or brushless propulsion. It now has enough independent engineering scope to graduate from Innovation Lab.",
    nextStep: "Create the dedicated repository, select the propulsion/control architecture, and define the first prototype mission envelope, payload, endurance, and controlled-water validation plan.",
    supportingLinks: [
      { label: "GitHub project entry", url: "https://github.com/fieldlogic-lab/SolutionsHQ/issues/3" },
      { label: "Project scope", url: "https://github.com/fieldlogic-lab/SolutionsHQ/blob/main/docs/scopes/HYDROGRAPHIC_USV_SCOPE.md" }
    ]
  },
  {
    slug: "coxswain-navigation",
    name: "Coxswain Navigation System",
    description: "On-water rowing navigation and workout execution system for coxswains.",
    status: "Active",
    stage: "Explore",
    lastUpdate: "2026-09-14",
    currentStatus: "The concept is defined around a phone-mounted GPS interface, mapped buoys and lanes, split workout/map view, distance and split tracking, battery awareness, and no-touch operation during practice.",
    nextStep: "Create the dedicated repository, define v0.1 field requirements, and build a simple map/workout prototype plus the first phone-holder field test.",
    supportingLinks: [
      { label: "GitHub project entry", url: "https://github.com/fieldlogic-lab/SolutionsHQ/issues/4" },
      { label: "Project scope", url: "https://github.com/fieldlogic-lab/SolutionsHQ/blob/main/docs/scopes/COXSWAIN_NAVIGATION_SCOPE.md" }
    ]
  },
  {
    slug: "ideawriter",
    name: "IdeaWriter",
    description: "Local-first idea capture, transcription, tagging, synthesis, and knowledge-development system.",
    status: "Active",
    stage: "Build",
    lastUpdate: "2026-09-20",
    currentStatus: "A local Python implementation already exists with faster-whisper transcription, SQLite storage, portable inbox/transcripts/summaries/archive, and controlled category/topic/action tagging. Later work defined spatial synthesis and mobile capture directions.",
    nextStep: "Create the authoritative IdeaWriter repository from the existing local implementation, preserve its portable data model, and separate v1 capture/synthesis from later spatial and Android work.",
    supportingLinks: [
      { label: "GitHub project entry", url: "https://github.com/fieldlogic-lab/SolutionsHQ/issues/5" },
      { label: "Project scope", url: "https://github.com/fieldlogic-lab/SolutionsHQ/blob/main/docs/scopes/IDEAWRITER_SCOPE.md" }
    ]
  },
  {
    slug: "massi-tv",
    name: "Massi TV",
    description: "Household television and local-family broadcast interface.",
    status: "Active",
    stage: "Build",
    lastUpdate: "2026-09-23",
    currentStatus: "Massi TV is now treated as a distinct product from HELM. The design includes weather, boating, fishing, surf, local information, passive rotation, ticker behavior, remote navigation, story opening, and family photo/art presentation.",
    nextStep: "Create the dedicated repository, define the HELM/feed-provider contract, and preserve the existing TV-first UI work as the first reference implementation.",
    supportingLinks: [
      { label: "GitHub project entry", url: "https://github.com/fieldlogic-lab/SolutionsHQ/issues/6" },
      { label: "Project scope", url: "https://github.com/fieldlogic-lab/SolutionsHQ/blob/main/docs/scopes/MASSI_TV_SCOPE.md" }
    ]
  },
  {
    slug: "virtual-rumble-strip",
    name: "Virtual Rumble Strip",
    description: "Portable roadside warning system that creates rumble-strip-like in-cabin tactile alerts.",
    status: "Active",
    stage: "Explore",
    lastUpdate: "2026-09-14",
    currentStatus: "The system architecture and development path are defined: radar or manual trigger, controller, low-frequency amplifier/transducer, risk-based pulse cadence, and a later networked work-zone product family.",
    nextStep: "Build the V0 manual prototype and validate 75–150 ft in-cabin perception plus worker/external exposure before adding radar triggering.",
    supportingLinks: [
      { label: "GitHub project entry", url: "https://github.com/fieldlogic-lab/SolutionsHQ/issues/7" },
      { label: "Project scope", url: "https://github.com/fieldlogic-lab/SolutionsHQ/blob/main/docs/scopes/VIRTUAL_RUMBLE_STRIP_SCOPE.md" }
    ]
  },
  {
    slug: "lidar-bluff-profile",
    name: "LiDAR Bluff Profile Pipeline",
    description: "Two-day LiDAR-to-cross-section existing-conditions reporting workflow for bluff and dune access work.",
    status: "Active",
    stage: "Build",
    lastUpdate: "2026-01-03",
    currentStatus: "A working R pipeline has processed LAS/LAZ/DTM inputs, authoritative GeoJSON section geometry and picks, cached profile data, plan/profile graphics, and two-page PDFs on real test sites. Remaining work is consolidation and production hardening.",
    nextStep: "Create the dedicated repository, standardize DTM as the authoritative elevation source, preserve the two-page report format, and package the workflow for repeatable MLS production use.",
    supportingLinks: [
      { label: "GitHub project entry", url: "https://github.com/fieldlogic-lab/SolutionsHQ/issues/8" },
      { label: "Project scope", url: "https://github.com/fieldlogic-lab/SolutionsHQ/blob/main/docs/scopes/LIDAR_BLUFF_PROFILE_SCOPE.md" }
    ]
  },
  {
    slug: "autodock",
    name: "AutoDock",
    description: "Self-centering berth and automatic boat-capture system for single-handed docking.",
    status: "Active",
    stage: "Explore",
    lastUpdate: "2026-08-30",
    currentStatus: "The mechanical concept is defined around passive funnel geometry, soft guides, a dedicated boat receiver, automatic latch, counterweighted centering lines, and tide accommodation. A 1:10 prototype path is already defined.",
    nextStep: "Create the dedicated repository and build the 1:10 slip/Pursuit prototype to test deliberately poor approach angles and latch geometry.",
    supportingLinks: [
      { label: "GitHub project entry", url: "https://github.com/fieldlogic-lab/SolutionsHQ/issues/9" },
      { label: "Project scope", url: "https://github.com/fieldlogic-lab/SolutionsHQ/blob/main/docs/scopes/AUTODOCK_SCOPE.md" }
    ]
  },
  {
    slug: "solutions-hq",
    name: "Solutions HQ",
    description: "Portfolio, re-entry, and innovation command center for Massi Solutions.",
    status: "Active",
    stage: "Build",
    lastUpdate: "2026-09-23",
    currentStatus: "v0.1 is deployed and healthy on Vercel. Project pages, Innovation Lab, production build validation, and the first re-entry workflow are in place.",
    nextStep: "Finish GitHub-backed project telemetry and continue replacing manual portfolio activity with durable source-of-truth integrations.",
    repo: "https://github.com/fieldlogic-lab/SolutionsHQ",
    app: "https://solutions-hq.vercel.app/"
  }
];
