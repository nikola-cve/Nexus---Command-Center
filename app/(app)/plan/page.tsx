import { CircleCheck, CircleDashed, CircleDot } from "lucide-react";
import { SectionHeader } from "@/components/app/SectionHeader";
import { Panel } from "@/components/ui/Panel";
import { cn } from "@/lib/utils";

type Status = "done" | "doing" | "todo";

type Phase = {
  name: string;
  status: Status;
  steps: { label: string; status: Status }[];
};

const roadmap: Phase[] = [
  {
    name: "Phase 1: Foundation",
    status: "done",
    steps: [
      { label: "Step 1: Mission Control shell and particle core", status: "done" },
      { label: "Step 2: Supabase data backbone", status: "done" },
    ],
  },
  {
    name: "Phase 1.5: Hardening",
    status: "done",
    steps: [
      { label: "Step 2.5: Single-user auth, docs, in-app tracking", status: "done" },
      { label: "Step 2.7: Actionable board (edit, delete, toasts)", status: "done" },
    ],
  },
  {
    name: "Phase 1.8: UI restructure",
    status: "doing",
    steps: [
      { label: "Navigation, separate sections, color system", status: "doing" },
      { label: "This Plan and Progress screen", status: "done" },
      { label: "Clickable project detail and polish", status: "todo" },
    ],
  },
  {
    name: "Phase 2: Claude engine",
    status: "todo",
    steps: [
      { label: "Step 3: Messages API, 7 modes, streaming, tool use", status: "todo" },
      { label: "Command bar goes live", status: "todo" },
    ],
  },
  {
    name: "Phase 3: Memory, handoff, polish",
    status: "todo",
    steps: [
      { label: "Experience memory (lessons influence next run)", status: "todo" },
      { label: "Handoff generator", status: "todo" },
      { label: "Full visual styling pass", status: "todo" },
    ],
  },
];

const statusStyle: Record<Status, { icon: typeof CircleCheck; color: string; label: string }> = {
  done: { icon: CircleCheck, color: "text-ok", label: "done" },
  doing: { icon: CircleDot, color: "text-accent", label: "in progress" },
  todo: { icon: CircleDashed, color: "text-muted", label: "planned" },
};

export default function PlanPage() {
  const allSteps = roadmap.flatMap((p) => p.steps);
  const doneCount = allSteps.filter((s) => s.status === "done").length;
  const progress = Math.round((doneCount / allSteps.length) * 100);

  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 py-5 sm:px-6">
      <SectionHeader sectionKey="plan" subtitle="Where we are and where we are going" />

      <Panel className="mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-fg">Overall progress</span>
          <span className="font-mono text-plan">{progress}%</span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface">
          <div className="h-full rounded-full bg-plan" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-3 text-xs text-muted">
          {doneCount} of {allSteps.length} steps done. Built step by step, you confirm each one.
        </p>
      </Panel>

      <div className="space-y-4">
        {roadmap.map((phase) => {
          const ps = statusStyle[phase.status];
          return (
            <Panel key={phase.name}>
              <div className="mb-3 flex items-center gap-2">
                <ps.icon className={ps.color} size={16} />
                <h2 className="text-sm font-semibold text-fg">{phase.name}</h2>
                <span className={cn("hud-label ml-auto", ps.color)}>{ps.label}</span>
              </div>
              <ul className="space-y-2">
                {phase.steps.map((step) => {
                  const ss = statusStyle[step.status];
                  return (
                    <li key={step.label} className="flex items-center gap-2 text-sm">
                      <ss.icon className={cn("shrink-0", ss.color)} size={14} />
                      <span className={step.status === "done" ? "text-muted" : "text-fg"}>
                        {step.label}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </Panel>
          );
        })}
      </div>
    </div>
  );
}
