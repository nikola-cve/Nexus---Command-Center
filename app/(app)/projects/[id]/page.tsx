import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BarChart3,
  CalendarRange,
  FileText,
  GitBranch,
  History,
  LayoutList,
  ListChecks,
  Notebook,
} from "lucide-react";
import { updateProjectNotesAction } from "@/app/actions";
import { HistoryList } from "@/components/app/HistoryList";
import HandoffButton from "@/components/app/HandoffButton";
import NotesEditor from "@/components/app/NotesEditor";
import PlanEditor from "@/components/app/PlanEditor";
import GanttView from "@/components/app/GanttView";
import DocsManager from "@/components/app/DocsManager";
import ProjectDashboard from "@/components/app/ProjectDashboard";
import { DecisionRow, ResearchRow, TaskRow } from "@/components/mission-control/BoardRows";
import NotConfigured from "@/components/mission-control/NotConfigured";
import { Panel } from "@/components/ui/Panel";
import { getAgents, getDocuments, getProjectDetail, getProjectPlan, getTeams } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const priorityColor: Record<string, string> = {
  high: "text-danger",
  medium: "text-warn",
  low: "text-muted",
};

const TABS = [
  { key: "overview", label: "Overview", icon: Notebook },
  { key: "plan", label: "Plan", icon: LayoutList },
  { key: "gantt", label: "Gantt", icon: CalendarRange },
  { key: "docs", label: "Docs", icon: FileText },
  { key: "dashboard", label: "Dashboard", icon: BarChart3 },
  { key: "activity", label: "Activity", icon: History },
] as const;

export default async function ProjectDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  if (!isSupabaseConfigured) return <NotConfigured />;
  const { id } = await params;
  const { tab: tabParam } = await searchParams;
  const tab = TABS.some((t) => t.key === tabParam) ? (tabParam as string) : "overview";

  const detail = await getProjectDetail(id);
  if (!detail) notFound();
  const { project, tasks, decisions, research, history } = detail;

  // Load tab-specific data only when needed.
  const needsPlan = tab === "plan" || tab === "gantt" || tab === "dashboard";
  const [plan, documents, agents, teams] = await Promise.all([
    needsPlan ? getProjectPlan(id) : Promise.resolve({ phases: [], unphased: [] }),
    tab === "docs" ? getDocuments(id) : Promise.resolve([]),
    needsPlan ? getAgents() : Promise.resolve([]),
    needsPlan ? getTeams() : Promise.resolve([]),
  ]);

  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 py-5 sm:px-6">
      <Link
        href="/projects"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-accent"
      >
        <ArrowLeft size={14} /> Projects
      </Link>

      <header className="mb-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-fg">{project.name}</h1>
          <HandoffButton project={project} tasks={tasks} decisions={decisions} />
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded border border-line px-2 py-0.5 text-muted">{project.status}</span>
          <span className={cn("rounded border border-line px-2 py-0.5", priorityColor[project.priority])}>
            {project.priority} priority
          </span>
          <span className="text-muted">{project.progress}% done</span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface">
          <div className="h-full rounded-full bg-accent" style={{ width: `${project.progress}%` }} />
        </div>
      </header>

      <nav className="mb-5 flex gap-1 overflow-x-auto border-b border-line">
        {TABS.map((t) => {
          const active = t.key === tab;
          const Icon = t.icon;
          return (
            <Link
              key={t.key}
              href={`/projects/${id}?tab=${t.key}`}
              className={cn(
                "flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2 text-sm transition-colors",
                active
                  ? "border-accent text-fg"
                  : "border-transparent text-muted hover:text-fg",
              )}
            >
              <Icon size={15} /> {t.label}
            </Link>
          );
        })}
      </nav>

      {tab === "overview" && (
        <div className="space-y-4">
          <Panel title="Description" icon={<Notebook size={14} />}>
            <NotesEditor
              id={project.id}
              initial={project.notes ?? ""}
              action={updateProjectNotesAction}
              placeholder="What is this project? Goal, scope, notes..."
            />
          </Panel>

          <Panel title={`Tasks (${tasks.length})`} icon={<ListChecks size={14} />}>
            {tasks.length === 0 ? (
              <p className="text-sm text-muted">
                No tasks yet. Build the full plan with phases and owners in the Plan tab.
              </p>
            ) : (
              <ul className="space-y-2">
                {tasks.map((t) => (
                  <TaskRow key={t.id} task={t} />
                ))}
              </ul>
            )}
          </Panel>

          <Panel title={`Decisions (${decisions.length})`} icon={<GitBranch size={14} />}>
            {decisions.length === 0 ? (
              <p className="text-sm text-muted">No decisions for this project yet.</p>
            ) : (
              <ul className="space-y-3">
                {decisions.map((d) => (
                  <DecisionRow key={d.id} decision={d} />
                ))}
              </ul>
            )}
          </Panel>

          <Panel title={`Research (${research.length})`} icon={<Notebook size={14} />}>
            {research.length === 0 ? (
              <p className="text-sm text-muted">No research for this project yet.</p>
            ) : (
              <ul className="space-y-3">
                {research.map((r) => (
                  <ResearchRow key={r.id} research={r} />
                ))}
              </ul>
            )}
          </Panel>
        </div>
      )}

      {tab === "plan" && (
        <PlanEditor
          projectId={id}
          phases={plan.phases}
          unphased={plan.unphased}
          agents={agents}
          teams={teams}
        />
      )}

      {tab === "gantt" && (
        <GanttView phases={plan.phases} unphased={plan.unphased} agents={agents} />
      )}

      {tab === "docs" && <DocsManager projectId={id} documents={documents} />}

      {tab === "dashboard" && (
        <ProjectDashboard
          phases={plan.phases}
          unphased={plan.unphased}
          teams={teams}
          agents={agents}
        />
      )}

      {tab === "activity" && <HistoryList events={history} />}
    </div>
  );
}
