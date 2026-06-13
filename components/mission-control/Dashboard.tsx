"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  Activity,
  Boxes,
  Cpu,
  Lightbulb,
  ListChecks,
  Send,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  activity,
  operatingModes,
  opportunities,
  projects,
  systemStatus,
  tasks,
  type SystemStatus,
} from "@/lib/mock";

// The 3D canvas is client and browser only, so load it without server rendering.
const CentralSphere = dynamic(() => import("./CentralSphere"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse-glow" />,
});

const STATUS_TEXT: Record<SystemStatus, string> = {
  healthy: "ALL SYSTEMS NOMINAL",
  warning: "ATTENTION REQUIRED",
  error: "FAULT DETECTED",
};

const STATUS_DOT: Record<SystemStatus, string> = {
  healthy: "bg-ok",
  warning: "bg-warn",
  error: "bg-danger",
};

function Panel({
  title,
  icon,
  children,
  className,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("panel panel-hover p-4 transition-colors", className)}>
      <header className="mb-3 flex items-center gap-2">
        <span className="text-accent">{icon}</span>
        <h2 className="hud-label">{title}</h2>
      </header>
      {children}
    </section>
  );
}

function Clock() {
  const [now, setNow] = useState<string | null>(null);
  useEffect(() => {
    const tick = () =>
      setNow(
        new Date().toLocaleTimeString("en-GB", { hour12: false, timeZone: "UTC" }) + " UTC",
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="font-mono text-sm text-accent tabular-nums">{now ?? "--:--:--"}</span>;
}

const priorityColor: Record<string, string> = {
  high: "text-danger",
  medium: "text-warn",
  low: "text-muted",
};

export default function Dashboard() {
  const counts = {
    projects: projects.filter((p) => p.status === "active").length,
    tasks: tasks.filter((t) => t.status !== "done").length,
    opportunities: opportunities.length,
  };

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-5 sm:px-6">
      {/* Top bar */}
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className={cn("h-2.5 w-2.5 rounded-full animate-pulse-glow", STATUS_DOT[systemStatus])} />
          <div>
            <h1 className="text-xl font-semibold tracking-wide text-accent text-glow">
              NEXUS COMMAND CENTER
            </h1>
            <p className="hud-label">Personal Operating Center</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="hud-label hidden sm:inline">{STATUS_TEXT[systemStatus]}</span>
          <Clock />
        </div>
      </header>

      {/* Main grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Left column */}
        <div className="flex flex-col gap-4 lg:col-span-3">
          <Panel title="System Status" icon={<ShieldCheck size={14} />}>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { label: "Projects", value: counts.projects },
                { label: "Open Tasks", value: counts.tasks },
                { label: "Leads", value: counts.opportunities },
              ].map((s) => (
                <div key={s.label} className="rounded-lg border border-line bg-surface/40 py-3">
                  <div className="text-2xl font-semibold text-accent">{s.value}</div>
                  <div className="hud-label mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Projects" icon={<Boxes size={14} />}>
            <ul className="space-y-3">
              {projects.map((p) => (
                <li key={p.id}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="truncate text-fg">{p.name}</span>
                    <span className={cn("hud-label", priorityColor[p.priority])}>{p.priority}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{ width: `${p.progress}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        {/* Center column */}
        <div className="flex flex-col gap-4 lg:col-span-6">
          <section className="panel relative overflow-hidden">
            <div className="absolute left-4 top-4 z-10">
              <div className="hud-label">Core</div>
              <div className="text-sm text-accent text-glow">JARVIS</div>
            </div>
            <div className="absolute right-4 top-4 z-10 text-right">
              <div className="hud-label">Engine</div>
              <div className="text-sm text-muted">Step 3</div>
            </div>
            <div className="h-[360px] w-full sm:h-[420px]">
              <CentralSphere status={systemStatus} />
            </div>
            <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
              <div className="hud-label">{STATUS_TEXT[systemStatus]}</div>
            </div>
          </section>

          {/* Operating modes strip */}
          <Panel title="Operating Modes" icon={<Cpu size={14} />}>
            <div className="flex flex-wrap gap-2">
              {operatingModes.map((m) => (
                <span
                  key={m.key}
                  className={cn(
                    "rounded-md border px-2.5 py-1 text-xs font-medium",
                    m.state === "active"
                      ? "border-accent/50 text-accent glow-cyan"
                      : m.state === "standby"
                        ? "border-line text-fg"
                        : "border-line text-muted",
                  )}
                >
                  {m.label}
                </span>
              ))}
            </div>
          </Panel>

          {/* Command bar (engine arrives in Step 3) */}
          <section className="panel p-3">
            <div className="flex items-center gap-2">
              <input
                disabled
                placeholder="Command bar activates in Step 3 (Claude engine)"
                className="h-10 flex-1 rounded-md border border-line bg-surface/50 px-3 text-sm text-fg placeholder:text-muted focus:outline-none disabled:cursor-not-allowed"
              />
              <button
                disabled
                className="flex h-10 items-center gap-2 rounded-md border border-line px-4 text-sm text-muted disabled:cursor-not-allowed"
              >
                <Send size={14} /> Run
              </button>
            </div>
          </section>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4 lg:col-span-3">
          <Panel title="Opportunities" icon={<Lightbulb size={14} />}>
            <ul className="space-y-3">
              {opportunities.map((o) => (
                <li key={o.id} className="rounded-lg border border-line bg-surface/40 p-3">
                  <div className="text-sm text-fg">{o.title}</div>
                  <div className="mt-1 flex items-center justify-between">
                    <span className={cn("hud-label", priorityColor[o.potential])}>
                      {o.potential} potential
                    </span>
                    <span className="text-xs text-muted">{o.nextAction}</span>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Open Tasks" icon={<ListChecks size={14} />}>
            <ul className="space-y-2">
              {tasks.map((t) => (
                <li key={t.id} className="flex items-center gap-2 text-sm">
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      t.status === "doing" ? "bg-accent" : "bg-muted",
                    )}
                  />
                  <span className="truncate text-fg">{t.title}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        {/* Activity feed */}
        <div className="lg:col-span-12">
          <Panel title="Activity Feed" icon={<Activity size={14} />}>
            <ul className="space-y-2 font-mono text-xs">
              {activity.map((e) => (
                <li key={e.id} className="flex items-center gap-3">
                  <span className="w-16 shrink-0 text-muted">[{e.time}]</span>
                  <span className="text-accent">{e.kind}</span>
                  <span className="text-fg">{e.message}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>

      <footer className="mt-6 text-center">
        <span className="hud-label">Nexus v0.1 . Step 1 foundation . built fresh</span>
      </footer>
    </div>
  );
}
