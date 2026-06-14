"use client";

import { usePathname } from "next/navigation";
import { PanelLeft, Search } from "lucide-react";

function crumb(path: string): string {
  const seg = path.split("/").filter(Boolean)[0] ?? "bridge";
  const map: Record<string, string> = {
    bridge: "Bridge",
    org: "Organization",
    projects: "Projects",
    agents: "Organization",
    research: "Library",
    "mission-control": "Activity",
    tasks: "Tasks",
    decisions: "Decisions",
    opportunities: "Opportunities",
    plan: "Plan",
  };
  return map[seg] ?? seg;
}

export default function CommandBar({ onToggleExplorer }: { onToggleExplorer: () => void }) {
  const path = usePathname();
  return (
    <header className="flex h-12 shrink-0 items-center gap-3 border-b border-white/10 bg-black/40 px-3 backdrop-blur">
      <button
        onClick={onToggleExplorer}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-white/5 hover:text-fg"
        title="Toggle explorer"
      >
        <PanelLeft size={16} />
      </button>
      <div className="flex items-baseline gap-2">
        <span className="text-sm font-semibold tracking-tight text-fg">Nexus</span>
        <span className="telemetry hidden text-[10px] uppercase tracking-widest text-muted sm:inline">
          Operating System
        </span>
      </div>
      <span className="telemetry text-muted/60">/</span>
      <span className="telemetry text-[12px] text-fg/80">{crumb(path)}</span>

      <button
        onClick={() => window.dispatchEvent(new CustomEvent("nexus:command"))}
        className="ml-auto flex h-8 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-muted transition-colors hover:border-white/20 hover:text-fg"
      >
        <Search size={15} />
        <span className="hidden sm:inline">Search or run a command</span>
        <span className="telemetry ml-1 hidden rounded border border-white/10 px-1.5 py-0.5 text-[10px] sm:inline">
          Cmd K
        </span>
      </button>
    </header>
  );
}
