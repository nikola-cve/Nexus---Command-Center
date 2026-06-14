"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, Lock, ShieldAlert, Terminal } from "lucide-react";
import { fmtTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ActivityEvent } from "@/lib/db/types";

export type Problem = { id: string; title: string; kind: "blocked" | "awaiting"; project: string | null };

export default function OpsConsole({
  events,
  problems,
  open,
  onToggle,
}: {
  events: ActivityEvent[];
  problems: Problem[];
  open: boolean;
  onToggle: () => void;
}) {
  const [tab, setTab] = useState<"log" | "problems">("log");

  return (
    <section className="shrink-0 border-t border-line bg-surface backdrop-blur">
      <div className="flex h-9 items-center gap-1 px-2">
        <Terminal size={13} className="ml-1 mr-1 text-muted" />
        <button
          onClick={() => {
            setTab("log");
            if (!open) onToggle();
          }}
          className={cn(
            "telemetry rounded px-2 py-1 text-[11px] uppercase tracking-wider",
            tab === "log" ? "text-fg" : "text-muted hover:text-fg",
          )}
        >
          Log
        </button>
        <button
          onClick={() => {
            setTab("problems");
            if (!open) onToggle();
          }}
          className={cn(
            "telemetry flex items-center gap-1 rounded px-2 py-1 text-[11px] uppercase tracking-wider",
            tab === "problems" ? "text-fg" : "text-muted hover:text-fg",
          )}
        >
          Problems
          {problems.length > 0 && (
            <span className="rounded-full bg-danger/20 px-1.5 text-[10px] text-danger">{problems.length}</span>
          )}
        </button>
        <button
          onClick={onToggle}
          className="ml-auto flex h-7 w-7 items-center justify-center rounded text-muted hover:bg-surface-2 hover:text-fg"
          title={open ? "Collapse" : "Expand"}
        >
          {open ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
        </button>
      </div>

      {open && (
        <div className="scroll-thin h-44 overflow-y-auto px-3 pb-3">
          {tab === "log" ? (
            events.length === 0 ? (
              <p className="telemetry text-[11px] text-muted">No activity yet.</p>
            ) : (
              <ul className="telemetry space-y-1 text-[11px]">
                {events.map((e) => (
                  <li key={e.id} className="flex items-start gap-3">
                    <span className="shrink-0 text-muted/70">{fmtTime(e.created_at)}</span>
                    <span className="shrink-0 text-accent/80">[{e.type}]</span>
                    <span className="text-fg/85">{e.message}</span>
                  </li>
                ))}
              </ul>
            )
          ) : problems.length === 0 ? (
            <p className="telemetry text-[11px] text-ok">Nothing blocked or awaiting approval.</p>
          ) : (
            <ul className="space-y-1">
              {problems.map((p) => (
                <li key={`${p.kind}-${p.id}`}>
                  <Link
                    href={`/tasks/${p.id}`}
                    className="flex items-center gap-2 rounded px-1 py-1 text-[12px] hover:bg-surface-2"
                  >
                    {p.kind === "blocked" ? (
                      <Lock size={12} className="text-danger" />
                    ) : (
                      <ShieldAlert size={12} className="text-warn" />
                    )}
                    <span className="truncate text-fg/85">{p.title}</span>
                    {p.project && <span className="telemetry ml-auto text-[10px] text-muted">{p.project}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
