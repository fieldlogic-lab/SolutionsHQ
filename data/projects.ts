export type ProjectStatus = "Active" | "Inactive" | "Parked" | "Complete";
export type ProjectStage = "Idea" | "Explore" | "Build" | "Launch" | "Operate";

export type ProjectLink = {
  label: string;
  url: string;
};

export type ProjectWorkstreamStatus = "Ready" | "Blocked" | "In Progress" | "Shipped";

export type ProjectWorkstream = {
  label: string;
  title: string;
  nextStep: string;
  status: ProjectWorkstreamStatus;
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
  ssotUrl?: string;
  app?: string;
  supportingLinks?: ProjectLink[];
  chatgptProjectUrl?: string;
  workstreams?: ProjectWorkstream[];
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
    repo: "https://github.com/fieldlogic-lab/HELM",
    ssotUrl: "https://github.com/fieldlogic-lab/HELM/blob/main/OPERATING_SYSTEM.md",
    workstreams: [
      { label: "Household Trial", title: "Run the real-household validation loop", nextStep: "Use HELM on the intended household computer plus a second device or TV, capture friction, and turn the findings into a short prioritized fix list.", status: "Ready" },
      { label: "Today UX", title: "Tighten the daily operating surface", nextStep: "Review the Today experience for fast household use and implement the smallest changes that reduce taps, ambiguity, or missing context.", status: "Ready" },
      { label: "Data Reliability", title: "Harden live household data", nextStep: "Audit the current weather, marine, utilities, and coaching data paths for broken or stale states and fix the highest-impact reliability issue.", status: "Ready" }
    ]
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
    ssotUrl: "https://github.com/fieldlogic-lab/SurveyOS/blob/main/README.md",
    supportingLinks: [
      { label: "Research workflow repo", url: "https://github.com/fieldlogic-lab/parcel-research-workflow" }
    ],
    workstreams: [
      { label: "Intake", title: "Finish intake-to-project handoff", nextStep: "Validate email intake, known-contact handling, project creation, and folder creation as one clean path without changing unrelated modules.", status: "Ready" },
      { label: "Quote", title: "Finish reply-ready quoting", nextStep: "Refine quote generation and the reply-to-original-email flow so a professional quote can be reviewed and sent with minimal manual editing.", status: "Ready" },
      { label: "GIS", title: "Complete the GIS loader handoff", nextStep: "Connect accepted project state and folder creation into the GIS loader so project geometry and production files open in the correct context.", status: "Ready" },
      { label: "Delivery", title: "Close the delivery and billing loop", nextStep: "Validate deliverables, invoice, payment, and closeout state transitions and remove any remaining gaps in the end-to-end workflow.", status: "Ready" }
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
    ssotUrl: "https://github.com/fieldlogic-lab/sbu-crew-coach/blob/main/README.md",
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
    repo: "https://github.com/fieldlogic-lab/Fire-Island-The-Game",
    ssotUrl: "https://github.com/fieldlogic-lab/Fire-Island-The-Game/blob/main/README.md"
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
    repo: "https://github.com/fieldlogic-lab/Point-O-Woods",
    ssotUrl: "https://github.com/fieldlogic-lab/Point-O-Woods/blob/main/README.md"
  },
  {
    slug: "party-chief",
    name: "Party Chief",
    description: "Mobile draft-beer serving product for distributors and keg retailers.",
    status: "Active",
    stage: "Build",
    lastUpdate: "2026-09-14",
    currentStatus: "Party Chief now has its own authoritative repository with product scope, decision log, execution contract, implementation status, validation plan, commercialization plan, and organized CAD/BOM/prototype areas. Remaining work is physical prototype completion and proof.",
    nextStep: "Migrate any existing CAD, drawings, prototype images, and commercial assets into PartyChief, then finish the physical prototype, run the live-keg test, and capture distributor feedback.",
    repo: "https://github.com/fieldlogic-lab/PartyChief",
    ssotUrl: "https://github.com/fieldlogic-lab/PartyChief/blob/main/PRODUCT_SCOPE.md",
    workstreams: [
      { label: "Prototype", title: "Finish the physical prototype", nextStep: "Consolidate the current CAD and drawings, identify the minimum remaining printed and purchased parts, and prepare the first complete assembly.", status: "Ready" },
      { label: "Validation", title: "Prepare the live-keg test", nextStep: "Turn the validation plan into a practical test checklist with pass/fail criteria, measurements, and evidence to capture during the first live-keg run.", status: "Ready" },
      { label: "Commercial", title: "Prepare distributor feedback", nextStep: "Build a concise distributor-facing demo and feedback script focused on setup time, portability, cleaning, durability, and willingness to stock or recommend.", status: "Ready" }
    ]
  },
  {
    slug: "hydrographic-usv",
    name: "TriDrone — Hydrographic Logger",
    description: "Independent Android GNSS and depth logger for Seafloor Systems TriDrone; autopilot deferred.",
    status: "Active",
    stage: "Build",
    lastUpdate: "2026-10-08",
    currentStatus: "Moto G Stylus 5G (2023) offline GNSS logger source and APK CI workflow committed. Target output fixed as NAD83 / New York Long Island State Plane EPSG:6539 (US survey feet; user confirmation pending because 6259 was supplied) and NAVD88 EPSG:6360 elevations (US survey feet); implementation and survey vertical control remain pending. APK build, phone validation and HydroLite Bluetooth connection are unverified.",
    nextStep: "Verify APK build and on-phone GPS logging, implement tested EPSG:6539 (pending confirmation) projection and quality metadata, and keep NAVD88 bottom elevations unavailable until a valid vertical control workflow is established.",
    ssotUrl: "https://github.com/fieldlogic-lab/SolutionsHQ/blob/main/docs/scopes/HYDROGRAPHIC_USV_SCOPE.md",
    supportingLinks: [
      { label: "GitHub project entry", url: "https://github.com/fieldlogic-lab/SolutionsHQ/issues/3" },
      { label: "Android logger source", url: "https://github.com/fieldlogic-lab/SolutionsHQ/tree/main/prototypes/tridrone-logger" },
      { label: "Project scope", url: "https://github.com/fieldlogic-lab/SolutionsHQ/blob/main/docs/scopes/HYDROGRAPHIC_USV_SCOPE.md" }
    ],
    workstreams: [
      { label: "Android logger", title: "Compile and validate phone GPS logging", nextStep: "Build the Kotlin scaffold, deploy to Moto G Stylus 5G 2023, verify foreground GNSS records and data persistence.", status: "In Progress" },
      { label: "HydroLite", title: "Decode live sonar over Bluetooth", nextStep: "Verify Bluetooth Classic RFCOMM pairing and save raw depth observations when HydroLite hardware is available.", status: "Blocked" },
      { label: "Survey data", title: "State Plane + NAVD88 survey deliverables", nextStep: "Implement tested EPSG:6539 (pending confirmation) output and GNSS/depth synchronization; define survey-grade NAVD88 vertical control before calculating bottom elevations.", status: "Ready" }
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
    ssotUrl: "https://github.com/fieldlogic-lab/SolutionsHQ/blob/main/docs/scopes/COXSWAIN_NAVIGATION_SCOPE.md",
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
    ssotUrl: "https://github.com/fieldlogic-lab/SolutionsHQ/blob/main/docs/scopes/IDEAWRITER_SCOPE.md",
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
    ssotUrl: "https://github.com/fieldlogic-lab/SolutionsHQ/blob/main/docs/scopes/MASSI_TV_SCOPE.md",
    supportingLinks: [
      { label: "GitHub project entry", url: "https://github.com/fieldlogic-lab/SolutionsHQ/issues/6" },
      { label: "Project scope", url: "https://github.com/fieldlogic-lab/SolutionsHQ/blob/main/docs/scopes/MASSI_TV_SCOPE.md" }
    ]
  },
  {
    slug: "virtual-rumble-strip",
    name: "WorkZone Thumper",
    description: "Portable roadside warning system that creates rumble-strip-like in-cabin tactile alerts. Earlier names: Virtual Rumble Strip / Active Rumble Zone.",
    status: "Active",
    stage: "Explore",
    lastUpdate: "2026-09-14",
    currentStatus: "WorkZone Thumper is the canonical name for the project previously called Virtual Rumble Strip / Active Rumble Zone. The architecture and development path are defined: manual/radar trigger, controller, low-frequency amplifier/transducer, risk-based pulse cadence, and a later networked work-zone product family. A formal invention/version record now preserves the technical history.",
    nextStep: "Create the dedicated WorkZone Thumper repository, then build the V0 manual prototype and document versioned 75–150 ft in-cabin perception and worker/external exposure testing before adding radar triggering.",
    ssotUrl: "https://github.com/fieldlogic-lab/SolutionsHQ/tree/main/incubator/workzone-thumper",
    supportingLinks: [
      { label: "GitHub project entry", url: "https://github.com/fieldlogic-lab/SolutionsHQ/issues/7" },
      { label: "Project scope", url: "https://github.com/fieldlogic-lab/SolutionsHQ/tree/main/incubator/workzone-thumper" }
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
    ssotUrl: "https://github.com/fieldlogic-lab/SolutionsHQ/blob/main/docs/scopes/LIDAR_BLUFF_PROFILE_SCOPE.md",
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
    ssotUrl: "https://github.com/fieldlogic-lab/SolutionsHQ/blob/main/docs/scopes/AUTODOCK_SCOPE.md",
    supportingLinks: [
      { label: "GitHub project entry", url: "https://github.com/fieldlogic-lab/SolutionsHQ/issues/9" },
      { label: "Project scope", url: "https://github.com/fieldlogic-lab/SolutionsHQ/blob/main/docs/scopes/AUTODOCK_SCOPE.md" }
    ]
  },
  {
    slug: "speaking-platform",
    name: "Speaking Platform",
    description: "People, systems, and performance speaking platform built around alignment, ownership, and better system design.",
    status: "Active",
    stage: "Explore",
    lastUpdate: "2026-10-06",
    currentStatus: "The platform thesis is defined around People, Systems & Performance. Three flagship talk territories are identified: The Boat Tells the Truth, You Can't Order Commitment, and Stop Working So Hard.",
    nextStep: "Build the first structured story bank from existing coaching, maritime, aviation, surveying, utility, technology, and entrepreneurship experiences, tagged to the platform's core concepts.",
    ssotUrl: "https://github.com/fieldlogic-lab/SolutionsHQ/blob/main/docs/scopes/SPEAKING_PLATFORM_SCOPE.md",
    supportingLinks: [
      { label: "Speaking platform scope", url: "https://github.com/fieldlogic-lab/SolutionsHQ/blob/main/docs/scopes/SPEAKING_PLATFORM_SCOPE.md" }
    ],
    workstreams: [
      { label: "Platform", title: "Refine the core point of view", nextStep: "Pressure-test the People, Systems & Performance thesis and preserve the strongest language, frameworks, and distinctions.", status: "Ready" },
      { label: "Story Bank", title: "Build the story inventory", nextStep: "Populate the established story-bank framework with real stories, score them, and promote the strongest material toward Talk Ready or Signature status.", status: "In Progress" },
      { label: "Talks", title: "Develop the flagship talks", nextStep: "Use The Boat Tells the Truth as the first proof point, then outline You Can't Order Commitment and Stop Working So Hard in 15-, 30-, and 45-minute forms.", status: "Ready" },
      { label: "Market", title: "Create the speaking runway", nextStep: "Build a LinkedIn-visible speaker presence, preserve video and audience feedback, and track corporate and conference opportunities without overbuilding a separate brand.", status: "Ready" }
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
    ssotUrl: "https://github.com/fieldlogic-lab/SolutionsHQ/blob/main/OPERATING_SYSTEM.md",
    app: "https://solutions-hq.vercel.app/",
    workstreams: [
      { label: "Execution Panel", title: "Make project drill-downs action-oriented", nextStep: "Refine the project-detail execution panel so each project exposes a clear ship target, blockers, project access, and multiple parallel workstream entry points.", status: "In Progress" },
      { label: "Project State", title: "Improve source-of-truth project state", nextStep: "Replace manual status text where practical with durable GitHub-backed project telemetry and make stale state visible instead of silently trusted.", status: "Ready" },
      { label: "Re-entry", title: "Improve ChatGPT project re-entry", nextStep: "Make each workstream launch with project-specific context, relevant source links, the exact current objective, and explicit scope boundaries.", status: "Ready" }
    ]
  }
];
