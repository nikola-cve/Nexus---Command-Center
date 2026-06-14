"use client";

import { useState, useTransition } from "react";
import { Copy, FileText, X } from "lucide-react";
import { toast } from "sonner";
import { saveHandoffAction } from "@/app/actions";
import { fmtDateTime } from "@/lib/format";
import type { Decision, Project, Task } from "@/lib/db/types";

function build(project: Project, tasks: Task[], decisions: Decision[]): string {
  const byStatus = (s: Task["status"]) => tasks.filter((t) => t.status === s);
  const line = (t: Task) => `- ${t.title}`;
  const open = [...byStatus("doing"), ...byStatus("todo")];

  return [
    `# Handoff: ${project.name}`,
    ``,
    `Status: ${project.status} | Priority: ${project.priority} | Progress: ${project.progress}%`,
    ``,
    `## What this is`,
    project.notes?.trim() || "(no description yet)",
    ``,
    `## Done`,
    byStatus("done").map(line).join("\n") || "- (nothing yet)",
    ``,
    `## In progress`,
    byStatus("doing").map(line).join("\n") || "- (nothing)",
    ``,
    `## Next steps`,
    open.map(line).join("\n") || "- (none)",
    ``,
    `## Decisions`,
    decisions.map((d) => `- ${d.decision}${d.rationale ? ` (${d.rationale})` : ""}`).join("\n") ||
      "- (none)",
    ``,
    `Generated ${fmtDateTime(new Date().toISOString())} Belgrade`,
  ].join("\n");
}

export default function HandoffButton({
  project,
  tasks,
  decisions,
}: {
  project: Project;
  tasks: Task[];
  decisions: Decision[];
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [pending, start] = useTransition();

  function openDialog() {
    setText(build(project, tasks, decisions));
    setOpen(true);
  }

  return (
    <>
      <button
        onClick={openDialog}
        className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm text-fg transition-colors hover:border-accent/50"
      >
        <FileText size={14} /> Handoff
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 px-4 pt-[10vh]"
          onClick={() => setOpen(false)}
        >
          <div className="panel w-full max-w-2xl p-4" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-fg">Handoff: {project.name}</h3>
              <button onClick={() => setOpen(false)} className="text-muted hover:text-fg">
                <X size={16} />
              </button>
            </div>
            <textarea
              readOnly
              value={text}
              rows={16}
              className="w-full rounded-md border border-line bg-surface-2 px-3 py-2 font-mono text-xs text-fg focus:outline-none"
            />
            <div className="mt-3 flex justify-end gap-2">
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(text);
                  toast.success("Copied to clipboard");
                }}
                className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm text-fg transition-colors hover:border-accent/50"
              >
                <Copy size={14} /> Copy
              </button>
              <button
                disabled={pending}
                onClick={() =>
                  start(async () => {
                    const r = await saveHandoffAction(project.name, text);
                    if (r.ok) toast.success("Handoff saved");
                    else toast.error(r.error);
                  })
                }
                className="rounded-lg border border-accent/50 px-3 py-1.5 text-sm font-medium text-accent transition-colors hover:bg-accent/10 disabled:opacity-40"
              >
                {pending ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
