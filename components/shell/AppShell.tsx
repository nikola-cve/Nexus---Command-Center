"use client";

import { useMemo, useState } from "react";
import CommandPalette from "@/components/app/CommandPalette";
import Rail from "@/components/shell/Rail";
import Explorer from "@/components/shell/Explorer";
import CommandBar from "@/components/shell/CommandBar";
import StatusBar from "@/components/shell/StatusBar";
import OpsConsole, { type Problem } from "@/components/shell/OpsConsole";
import { isBlocked } from "@/lib/status";
import { cn } from "@/lib/utils";
import type { ActivityEvent, Agent, DepartmentWithTeams, Project, Task } from "@/lib/db/types";

export type ShellData = {
  departments: DepartmentWithTeams[];
  projects: Project[];
  tasks: Task[];
  agents: Agent[];
  events: ActivityEvent[];
};

export default function AppShell({ data, children }: { data: ShellData; children: React.ReactNode }) {
  // Two states so one toggle works at every breakpoint: explorerOpen drives the
  // desktop inline panel, mobileNav drives the mobile overlay. Each only matters
  // at its own breakpoint, so toggling both together is correct.
  const [explorerOpen, setExplorerOpen] = useState(true);
  const [mobileNav, setMobileNav] = useState(false);
  const [consoleOpen, setConsoleOpen] = useState(false);
  const toggleExplorer = () => {
    setExplorerOpen((v) => !v);
    setMobileNav((v) => !v);
  };

  const { working, blocked, awaiting, problems } = useMemo(() => {
    const doneIds = new Set(data.tasks.filter((t) => t.status === "done").map((t) => t.id));
    const projectName = new Map(data.projects.map((p) => [p.id, p.name]));
    const blockedTasks = data.tasks.filter((t) => isBlocked(t, doneIds));
    const awaitingTasks = data.tasks.filter((t) => t.requires_approval && t.status !== "done");
    const probs: Problem[] = [
      ...blockedTasks.map((t) => ({
        id: t.id,
        title: t.title,
        kind: "blocked" as const,
        project: t.project_id ? projectName.get(t.project_id) ?? null : null,
      })),
      ...awaitingTasks.map((t) => ({
        id: t.id,
        title: t.title,
        kind: "awaiting" as const,
        project: t.project_id ? projectName.get(t.project_id) ?? null : null,
      })),
    ];
    return {
      working: data.tasks.filter((t) => t.status === "doing").length,
      blocked: blockedTasks.length,
      awaiting: awaitingTasks.length,
      problems: probs,
    };
  }, [data]);

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <CommandBar onToggleExplorer={toggleExplorer} />

      <div className="flex min-h-0 flex-1">
        <Rail />

        <Explorer
          departments={data.departments}
          projects={data.projects}
          tasks={data.tasks}
          className={cn("hidden", explorerOpen && "lg:block")}
        />

        {mobileNav && (
          <div className="fixed inset-0 z-40 flex lg:hidden">
            <div className="absolute inset-0 bg-black/60" onClick={() => setMobileNav(false)} />
            <div className="relative z-10 h-full">
              <Explorer departments={data.departments} projects={data.projects} tasks={data.tasks} />
            </div>
          </div>
        )}

        <main className="scroll-thin min-w-0 flex-1 overflow-y-auto">{children}</main>
      </div>

      <OpsConsole
        events={data.events}
        problems={problems}
        open={consoleOpen}
        onToggle={() => setConsoleOpen((v) => !v)}
      />
      <StatusBar agents={data.agents.length} working={working} blocked={blocked} awaiting={awaiting} />

      <CommandPalette />
    </div>
  );
}
