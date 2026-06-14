import type { Agent, PhaseWithTasks, Task } from "@/lib/db/types";

const DAY = 86400000;

const barColor: Record<Task["status"], string> = {
  todo: "bg-muted/50",
  doing: "bg-info",
  done: "bg-ok",
};

function parse(d: string | null): number | null {
  if (!d) return null;
  const t = Date.parse(d);
  return Number.isNaN(t) ? null : t;
}

/** A task's [start, end] in ms, inferred from start_date and due. Null if undatable. */
function span(task: Task): [number, number] | null {
  const s = parse(task.start_date);
  const e = parse(task.due);
  if (s === null && e === null) return null;
  const start = s ?? (e as number);
  const end = e ?? (s as number);
  return start <= end ? [start, end] : [end, start];
}

function fmt(ms: number): string {
  return new Date(ms).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function GanttView({
  phases,
  unphased,
  agents,
}: {
  phases: PhaseWithTasks[];
  unphased: Task[];
  agents: Agent[];
}) {
  const groups = [
    ...phases.map((p) => ({ name: p.name, tasks: p.tasks })),
    ...(unphased.length ? [{ name: "Not in a phase", tasks: unphased }] : []),
  ];
  const all = groups.flatMap((g) => g.tasks);
  const dated = all.map((t) => ({ task: t, span: span(t) })).filter((x) => x.span) as {
    task: Task;
    span: [number, number];
  }[];

  if (dated.length === 0) {
    return (
      <div className="panel p-6 text-sm text-muted">
        No dated tasks yet. Add a start or due date to tasks in the Plan tab and they will appear on
        the timeline here.
      </div>
    );
  }

  const min = Math.min(...dated.map((d) => d.span[0]));
  const max = Math.max(...dated.map((d) => d.span[1]));
  const range = Math.max(max - min, DAY);
  const totalDays = Math.round(range / DAY) + 1;

  const agentName = (id: string | null) => agents.find((a) => a.id === id)?.name;

  return (
    <div className="panel overflow-x-auto p-4">
      <div className="mb-3 flex items-center justify-between text-[11px] text-muted">
        <span>{fmt(min)}</span>
        <span>{totalDays} days</span>
        <span>{fmt(max)}</span>
      </div>
      <div className="space-y-4">
        {groups.map((g) => {
          const rows = g.tasks.map((t) => ({ task: t, span: span(t) }));
          return (
            <div key={g.name}>
              <div className="mb-1.5 text-xs font-semibold text-fg">{g.name}</div>
              <div className="space-y-1">
                {rows.map(({ task, span: s }) => (
                  <div key={task.id} className="flex items-center gap-3">
                    <div className="w-40 shrink-0 truncate text-xs text-muted" title={task.title}>
                      {task.title}
                    </div>
                    <div className="relative h-5 flex-1 rounded bg-base/40">
                      {s ? (
                        <div
                          className={`absolute top-0.5 h-4 rounded ${barColor[task.status]}`}
                          style={{
                            left: `${((s[0] - min) / range) * 100}%`,
                            width: `${Math.max(((s[1] - s[0]) / range) * 100, 2)}%`,
                          }}
                          title={`${fmt(s[0])} to ${fmt(s[1])}${
                            agentName(task.assignee_agent_id)
                              ? " - " + agentName(task.assignee_agent_id)
                              : ""
                          }`}
                        />
                      ) : (
                        <span className="absolute left-1 top-0.5 text-[10px] text-muted">
                          no dates
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
