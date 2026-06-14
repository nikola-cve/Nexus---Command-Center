"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  Activity,
  Boxes,
  Cpu,
  GitBranch,
  Lightbulb,
  ListChecks,
  LogOut,
  PlusCircle,
  Send,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { operatingModes } from "@/lib/modes";
import type { DashboardData, SystemStatus } from "@/lib/db/types";
import { signOut } from "@/app/login/actions";
import QuickAdd from "./QuickAdd";
import { OpportunityRow, ProjectRow, TaskRow } from "./BoardRows";

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
      setNow(new Date().toLocaleTimeString("en-GB", { hour12: false, timeZone: "UTC" }) + " UTC");
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="font-mono text-sm text-accent tabular-nums">{now ?? "--:--:--"}</span>;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-GB", { hour12: false, timeZone: "UTC" });
}

export default function Dashboard({ data }: { data: DashboardData }) {
  const status: SystemStatus = "healthy";
  const projectName = new Map(data.projects.map((p) => [p.id, p.name]));
  const counts = {
    projects: data.projects.filter((p) => p.status === "active").length,
    tasks: data.tasks.filter((t) => t.status !== "done").length,
    opportunities: data.opportunities.length,
  };
  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-5 sm:px-6">
      {/* Top bar */}
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className={cn("h-2.5 w-2.5 rounded-full animate-pulse-glow", STATUS_DOT[status])} />
          <div>
            <h1 className="text-xl font-semibold tracking-wide text-accent text-glow">
              NEXUS COMMAND CENTER
            </h1>
            <p className="hud-label">Personal Operating Center</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="hud-label hidden sm:inline">{STATUS_TEXT[status]}</span>
          <Clock />
          <form action={signOut}>
            <button
              type="submit"
              title="Sign out"
              className="flex h-8 w-8 items-center justify-center rounded-md border border-line text-muted transition-colors hover:border-accent/50 hover:text-accent"
            >
              <LogOut size={14} />
            </button>
          </form>
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
            {data.projects.length === 0 ? (
              <p className="text-sm text-muted">No projects yet. Add one below.</p>
            ) : (
              <ul className="space-y-3">
                {data.projects.map((p) => (
                  <ProjectRow key={p.id} project={p} />
                ))}
              </ul>
            )}
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
            <div className="h-[340px] w-full sm:h-[400px]">
              <CentralSphere status={status} />
            </div>
            <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
              <div className="hud-label">{STATUS_TEXT[status]}</div>
            </div>
          </section>

          <Panel title="Quick Add" icon={<PlusCircle size={14} />}>
            <QuickAdd projects={data.projects} />
          </Panel>

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
            {data.opportunities.length === 0 ? (
              <p className="text-sm text-muted">No opportunities tracked yet.</p>
            ) : (
              <ul className="space-y-3">
                {data.opportunities.map((o) => (
                  <OpportunityRow key={o.id} opportunity={o} />
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Tasks" icon={<ListChecks size={14} />}>
            {data.tasks.length === 0 ? (
              <p className="text-sm text-muted">No tasks yet. Add one in Quick Add.</p>
            ) : (
              <ul className="space-y-2">
                {data.tasks.map((t) => (
                  <TaskRow
                    key={t.id}
                    task={t}
                    projectName={t.project_id ? projectName.get(t.project_id) : undefined}
                  />
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Decision Log" icon={<GitBranch size={14} />}>
            {data.decisions.length === 0 ? (
              <p className="text-sm text-muted">No decisions logged yet.</p>
            ) : (
              <ul className="space-y-3">
                {data.decisions.slice(0, 4).map((d) => (
                  <li key={d.id}>
                    <div className="text-sm text-fg">{d.decision}</div>
                    {d.rationale && (
                      <div className="mt-0.5 text-xs text-muted">{d.rationale}</div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        {/* Activity feed */}
        <div className="lg:col-span-12">
          <Panel title="Activity Feed" icon={<Activity size={14} />}>
            {data.events.length === 0 ? (
              <p className="text-sm text-muted">No activity yet.</p>
            ) : (
              <ul className="space-y-2 font-mono text-xs">
                {data.events.map((e) => (
                  <li key={e.id} className="flex items-center gap-3">
                    <span className="w-20 shrink-0 text-muted">[{formatTime(e.created_at)}]</span>
                    <span className="w-16 shrink-0 text-accent">{e.type}</span>
                    <span className="text-fg">{e.message}</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>

      <footer className="mt-6 text-center">
        <span className="hud-label">Nexus v0.1 . Step 2.7 usability . Supabase connected</span>
      </footer>
    </div>
  );
}
