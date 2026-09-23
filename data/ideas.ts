export type Idea = {
  slug: string;
  name: string;
  description: string;
  status: "Idea" | "Exploring" | "Experimenting" | "Project Candidate" | "Parked";
  lastUpdate: string;
  nextStep: string;
};

export const ideas: Idea[] = [
  {
    slug: "sup-tender",
    name: "Remote SUP Tender",
    description: "Motorized inflatable SUP platform for short remote tender runs.",
    status: "Idea",
    lastUpdate: "2026-09-12",
    nextStep: "Define thrust, battery, and steering requirements."
  },
  {
    slug: "marine-switch-panels",
    name: "Custom Marine Switch Panels",
    description: "Custom printed replacement switch panels for small boats.",
    status: "Project Candidate",
    lastUpdate: "2026-09-12",
    nextStep: "Prototype a replacement panel and validate price point."
  },
  {
    slug: "golf-development-app",
    name: "Golf Development App",
    description: "Full round GPS/score app with watch input, training missions, custom metrics, post-round development reports, and optional cart/bag accessories.",
    status: "Exploring",
    lastUpdate: "2026-06-21",
    nextStep: "Choose the product name and define the smallest phone/watch MVP that can replace a basic round app."
  },
  {
    slug: "milkfresh",
    name: "MilkFresh / Freshness Wand",
    description: "Kitchen-thermometer-style milk freshness detector using an optical pH/color-sensing probe and simple fresh/borderline/spoiled output.",
    status: "Exploring",
    lastUpdate: "2025-12-07",
    nextStep: "Prove a food-safe optical sensing approach works reliably in opaque milk before pursuing DFM, IP, or licensing."
  },
  {
    slug: "vaultmapper",
    name: "VaultMapper",
    description: "Portable utility-vault/manhole mapping and inspection kit combining rugged capture hardware, spatial control, workflow, and GIS/CAD/3D outputs.",
    status: "Project Candidate",
    lastUpdate: "2026-04-26",
    nextStep: "Define the minimum capture kit and one repeatable vault-to-report field test before deciding whether to promote it."
  },
  {
    slug: "marine-logbook-holder",
    name: "Marine Helm Logbook Holder",
    description: "Compact 5.5 × 8.5 inch helm-mounted marine logbook holder with integrated phone position and practical pen/storage features.",
    status: "Project Candidate",
    lastUpdate: "2026-09-01",
    nextStep: "Build and field-test one printed prototype on the Pursuit before treating it as a product."
  },
  {
    slug: "print-your-world",
    name: "Print Your World",
    description: "3D-printed survey and marine product line including equipment tags, QR plates, project markers, case labels, dock accessories, signage, and terrain/bathymetry models.",
    status: "Exploring",
    lastUpdate: "2026-09-13",
    nextStep: "Choose one repeatable product with a real buyer and validate unit economics before expanding the catalog."
  },
  {
    slug: "subsea-repair-cell",
    name: "Subsea Repair Cell",
    description: "Clamp-on underwater inspection and repair concept combining local dry habitat, sensing, robotic manipulation, and supervised welding/repair.",
    status: "Idea",
    lastUpdate: "2026-04-26",
    nextStep: "Keep as a research concept until a narrow repair use case and feasible prototype path are identified."
  }
];
