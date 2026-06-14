"use client";

import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CheckCircle2, ListTodo, ShieldAlert, Lock } from "lucide-react";
import type { Agent, PhaseWithTasks, Task, Team } from "@/lib/db/types";

const C = {
  accent: "#6c5cff",
  info: "#4aa8ff",
  ok: "#3ecf8e",
  warn: "#e8b94a",
  danger: "#f0616d",
  accent2: "#b06cff",
  muted: "#9398a8",
};

function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <div className="panel p-4">
      <div className="flex items-center gap-2 text-muted">
        <span className={tone}>{icon}</span>
        <span className="hud-label">{label}</span>
      </div>
      <div className="mt-1 text-2xl font-semibold text-fg">{value}</div>
    </div>
  );
}

export default function ProjectDashboard({
  phases,
  unphased,
  teams,
  agents,
}: {
  phases: PhaseWithTasks[];
  unphased: Task[];
  teams: Team[];
  agents: Agent[];
}) {
  const tasks = [...phases.flatMap((p) => p.tasks), ...unphased];
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "done").length;
  const doneSet = new Set(tasks.filter((t) => t.status === "done").map((t) => t.id));
  const awaiting = tasks.filter((t) => t.requires_approval && t.status !== "done").length;
  const blocked = tasks.filter(
    (t) => t.status !== "done" && (t.depends_on ?? []).some((d) => !doneSet.has(d)),
  ).length;

  const statusData = [
    { name: "To do", value: tasks.filter((t) => t.status === "todo").length, color: C.muted },
    { name: "Doing", value: tasks.filter((t) => t.status === "doing").length, color: C.info },
    { name: "Done", value: done, color: C.ok },
  ].filter((d) => d.value > 0);

  const teamName = (id: string | null) => {
    if (!id) return "No team";
    const t = teams.find((x) => x.id === id);
    return t?.name ?? "No team";
  };
  const byTeamMap = new Map<string, number>();
  for (const t of tasks) {
    const k = teamName(t.team_id);
    byTeamMap.set(k, (byTeamMap.get(k) ?? 0) + 1);
  }
  const byTeam = Array.from(byTeamMap, ([name, value]) => ({ name, value }));

  if (total === 0) {
    return (
      <div className="panel p-6 text-sm text-muted">
        No tasks yet. Build the plan in the Plan tab and this dashboard fills in: status breakdown,
        load per team, and what is blocked or awaiting your approval.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={<ListTodo size={15} />} label="Total tasks" value={total} tone="text-accent" />
        <StatCard icon={<CheckCircle2 size={15} />} label="Done" value={done} tone="text-ok" />
        <StatCard icon={<Lock size={15} />} label="Blocked" value={blocked} tone="text-danger" />
        <StatCard
          icon={<ShieldAlert size={15} />}
          label="Awaiting approval"
          value={awaiting}
          tone="text-warn"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="panel p-4">
          <h3 className="hud-label mb-3">Status breakdown</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={2}
                  stroke="none"
                >
                  {statusData.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#181a20",
                    border: "1px solid #24262e",
                    borderRadius: 8,
                    color: "#e7e9f0",
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex flex-wrap justify-center gap-3 text-xs text-muted">
            {statusData.map((d) => (
              <span key={d.name} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: d.color }} />
                {d.name} ({d.value})
              </span>
            ))}
          </div>
        </section>

        <section className="panel p-4">
          <h3 className="hud-label mb-3">Tasks by team</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byTeam} layout="vertical" margin={{ left: 10, right: 10 }}>
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={110}
                  tick={{ fill: C.muted, fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.04)" }}
                  contentStyle={{
                    background: "#181a20",
                    border: "1px solid #24262e",
                    borderRadius: 8,
                    color: "#e7e9f0",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} fill={C.accent} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <section className="panel p-4">
        <h3 className="hud-label mb-3">Progress by phase</h3>
        <div className="space-y-3">
          {phases.length === 0 && <p className="text-sm text-muted">No phases defined.</p>}
          {phases.map((p) => {
            const pct = p.tasks.length
              ? Math.round((p.tasks.filter((t) => t.status === "done").length / p.tasks.length) * 100)
              : 0;
            return (
              <div key={p.id}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-fg">{p.name}</span>
                  <span className="text-muted">{pct}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-base">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <p className="px-1 text-[11px] text-muted">
        {agents.length} agents across {teams.length} teams available to own these tasks.
      </p>
    </div>
  );
}
