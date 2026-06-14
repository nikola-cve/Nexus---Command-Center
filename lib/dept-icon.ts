import {
  Boxes,
  Code2,
  Cog,
  Compass,
  Layers,
  Megaphone,
  Network,
  Rocket,
  Shapes,
  Telescope,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";

// Static map so the icon names stored on departments resolve to real components.
const MAP: Record<string, LucideIcon> = {
  Compass,
  Telescope,
  Shapes,
  Code2,
  Megaphone,
  Cog,
  Layers,
  Rocket,
  Wrench,
  Users,
  Boxes,
  Network,
};

export const DEPT_ICON_NAMES = Object.keys(MAP);

export function deptIcon(name: string | null): LucideIcon {
  return (name && MAP[name]) || Boxes;
}
