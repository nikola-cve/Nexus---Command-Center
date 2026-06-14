"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Activity, Cpu, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { Panel } from "@/components/ui/Panel";
import { operatingModes } from "@/lib/modes";
import type { DashboardData, SystemStatus } from "@/lib/db/types";

const CentralSphere = dynamic(() => import("@/components/mission-control/CentralSphere"), {
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

export default function OverviewView({ data }: { data: DashboardData }) {
  const status: SystemStatus = "healthy";
  const stats = [
    { label: "Projects", value: data.projects.filter((p) => p.status === "active").length, color: "text-accent" },
    { label: "Open Tasks", value: data.tasks.filter((t) => t.status !== "done").length, color: "text-ok" },
    { label: "Leads", value: data.opportunities.length, color: "text-warn" },
    { label: "Decisions", value: data.decisions.length, color: "text-accent-2" },
  ];

  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 py-5 sm:px-6">
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className={cn("h-2.5 w-2.5 rounded-full animate-pulse-glow", STATUS_DOT[status])} />
          <div>
            <h1 className="text-xl font-semibold tracking-wide text-accent text-glow">Overview</h1>
            <p className="hud-label">Personal Operating Center</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="hud-label hidden sm:inline">{STATUS_TEXT[status]}</span>
          <Clock />
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="panel p-4 text-center">
            <div className={cn("text-2xl font-semibold", s.color)}>{s.value}</div>
            <div className="hud-label mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <section className="panel relative mt-4 overflow-hidden">
        <div className="absolute left-4 top-4 z-10">
          <div className="hud-label">Core</div>
          <div className="text-sm text-accent text-glow">JARVIS</div>
        </div>
        <div className="absolute right-4 top-4 z-10 text-right">
          <div className="hud-label">Engine</div>
          <div className="text-sm text-muted">Step 3</div>
        </div>
        <div className="h-[280px] w-full sm:h-[320px]">
          <CentralSphere status={status} />
        </div>
        <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
          <div className="hud-label">{STATUS_TEXT[status]}</div>
        </div>
      </section>

      <div className="mt-4">
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
      </div>

      <section className="panel mt-4 p-3">
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

      <div className="mt-4">
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
  );
}
