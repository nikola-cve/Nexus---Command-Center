"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, ChevronDown, ChevronRight, FolderClosed, FolderOpen } from "lucide-react";
import { deptIcon } from "@/lib/dept-icon";
import { deriveAgentStatus, statusMeta } from "@/lib/status";
import { cn } from "@/lib/utils";
import { createElement } from "react";
import type { DepartmentWithTeams, Project, Task } from "@/lib/db/types";

function Glyph({ icon, className }: { icon: string | null; className?: string }) {
  return createElement(deptIcon(icon), { size: 13, className });
}

function Group({
  label,
  defaultOpen = true,
  children,
}: {
  label: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mb-1">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-1 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted hover:text-fg"
      >
        {open ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
        {label}
      </button>
      {open && <div className="mt-0.5">{children}</div>}
    </div>
  );
}

function Tree({
  departments,
  projects,
  tasks,
}: {
  departments: DepartmentWithTeams[];
  projects: Project[];
  tasks: Task[];
}) {
  const path = usePathname();
  const [openDept, setOpenDept] = useState<Record<string, boolean>>({});

  return (
    <div className="telemetry select-none px-1 pb-4">
      <Group label="Organization">
        {departments.map((d) => {
          const open = openDept[d.id] ?? false;
          return (
            <div key={d.id}>
              <button
                onClick={() => setOpenDept((s) => ({ ...s, [d.id]: !open }))}
                className="flex w-full items-center gap-1.5 rounded px-2 py-1 text-left text-[12px] text-fg/90 hover:bg-white/5"
              >
                {open ? <ChevronDown size={11} className="text-muted" /> : <ChevronRight size={11} className="text-muted" />}
                <Glyph icon={d.icon} className="text-accent" />
                <span className="truncate">{d.name}</span>
              </button>
              {open && (
                <div className="ml-3 border-l border-white/8 pl-2">
                  {d.teams.map((t) => (
                    <div key={t.id} className="py-0.5">
                      <div className="px-2 py-0.5 text-[11px] text-muted">{t.name}</div>
                      {t.agents.map((a) => {
                        const st = deriveAgentStatus(a.id, tasks);
                        const active = path === `/agents/${a.id}`;
                        return (
                          <Link
                            key={a.id}
                            href={`/agents/${a.id}`}
                            className={cn(
                              "flex items-center gap-1.5 rounded px-2 py-1 text-[12px] hover:bg-white/5",
                              active ? "bg-white/8 text-fg" : "text-fg/80",
                            )}
                          >
                            <span className={cn("node-dot h-1.5 w-1.5", statusMeta[st].text)} />
                            <Bot size={12} className="text-muted" />
                            <span className="truncate">{a.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </Group>

      <Group label="Projects">
        {projects.length === 0 && <div className="px-3 py-1 text-[11px] text-muted">No projects.</div>}
        {projects.map((p) => {
          const active = path === `/projects/${p.id}`;
          return (
            <Link
              key={p.id}
              href={`/projects/${p.id}`}
              className={cn(
                "flex items-center gap-1.5 rounded px-2 py-1 text-[12px] hover:bg-white/5",
                active ? "bg-white/8 text-fg" : "text-fg/80",
              )}
            >
              {active ? (
                <FolderOpen size={12} className="text-accent" />
              ) : (
                <FolderClosed size={12} className="text-muted" />
              )}
              <span className="truncate">{p.name}</span>
              <span className="ml-auto text-[10px] text-muted">{p.progress}%</span>
            </Link>
          );
        })}
      </Group>
    </div>
  );
}

export default function Explorer({
  departments,
  projects,
  tasks,
  className,
}: {
  departments: DepartmentWithTeams[];
  projects: Project[];
  tasks: Task[];
  className?: string;
}) {
  return (
    <aside
      className={cn(
        "scroll-thin w-60 shrink-0 overflow-y-auto border-r border-white/10 bg-black/20 backdrop-blur",
        className,
      )}
    >
      <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted/70">
        Explorer
      </div>
      <Tree departments={departments} projects={projects} tasks={tasks} />
    </aside>
  );
}
