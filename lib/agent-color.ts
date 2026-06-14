// Static map so Tailwind keeps these classes (no dynamic class names).
const MAP: Record<string, string> = {
  accent: "text-accent",
  info: "text-info",
  ok: "text-ok",
  "accent-2": "text-accent-2",
  warn: "text-warn",
  danger: "text-danger",
  plan: "text-plan",
};

export function agentColor(color: string): string {
  return MAP[color] ?? "text-accent";
}
