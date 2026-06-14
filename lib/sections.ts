import {
  Bot,
  Boxes,
  GitBranch,
  LayoutDashboard,
  Lightbulb,
  ListChecks,
  Map,
  Notebook,
  type LucideIcon,
} from "lucide-react";

export type Section = {
  key: string;
  label: string;
  href: string;
  icon: LucideIcon;
  text: string;
  border: string;
};

/** Navigation sections. Each has its own accent color so the app is not all one color. */
export const sections: Section[] = [
  { key: "overview", label: "Overview", href: "/mission-control", icon: LayoutDashboard, text: "text-accent", border: "border-accent" },
  { key: "agents", label: "Agents", href: "/agents", icon: Bot, text: "text-accent-2", border: "border-accent-2" },
  { key: "projects", label: "Projects", href: "/projects", icon: Boxes, text: "text-accent", border: "border-accent" },
  { key: "tasks", label: "Tasks", href: "/tasks", icon: ListChecks, text: "text-ok", border: "border-ok" },
  { key: "decisions", label: "Decisions", href: "/decisions", icon: GitBranch, text: "text-accent-2", border: "border-accent-2" },
  { key: "opportunities", label: "Opportunities", href: "/opportunities", icon: Lightbulb, text: "text-warn", border: "border-warn" },
  { key: "research", label: "Research", href: "/research", icon: Notebook, text: "text-info", border: "border-info" },
  { key: "plan", label: "Plan", href: "/plan", icon: Map, text: "text-plan", border: "border-plan" },
];
