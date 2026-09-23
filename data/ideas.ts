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
    slug: "auto-slip-docking",
    name: "Auto Slip Docking",
    description: "Dock-mounted system that centers and secures a boat during single-handed docking.",
    status: "Exploring",
    lastUpdate: "2026-08-30",
    nextStep: "Sketch the mechanical centering and capture geometry."
  },
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
  }
];
