import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BarChart3, CalendarRange, FileText, GitBranch, LayoutList, Notebook } from "lucide-react";
import { updateProjectNotesAction } from "@/app/actions";
import { HistoryList } from "@/components/app/HistoryList";
import HandoffButton from "@/components/app/HandoffButton";
import NotesEditor from "@/components/app/NotesEditor";
import PlanEditor from "@/components/app/PlanEditor";
import GanttView from "@/components/app/GanttView";
import DocsManager from "@/components/app/DocsManager";
import ProjectDashboard from "@/components/app/ProjectDashboard";
import { DecisionRow, ResearchRow } from "@/components/mission-control/BoardRows";
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

const SECTIONS = [
  { id: "overview", label: "Overview", icon: Notebook },
  { id: "plan", label: "Plan", icon: LayoutList },
  { id: "timeline", label: "Timeline", icon: CalendarRange },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
];

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  if (!isSupabaseConfigured) return <NotConfigured />;
  const { id } = await params;

  const [detail, plan, documents, agents, teams] = await Promise.all([
    getProjectDetail(id),
    getProjectPlan(id),
    getDocuments(id),
    getAgents(),
    getTeams(),
  ]);
  if (!detail) notFound();
  const { project, tasks, decisions, research, history } = detail;

  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 py-5 sm:px-6">
      <Link href="/projects" className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-accent">
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
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
          <div className="h-full rounded-full bg-accent" style={{ width: `${project.progress}%` }} />
        </div>
      </header>

      {/* Jump nav (anchors, not tabs): every module stays on the page */}
      <nav className="sticky top-0 z-10 -mx-4 mb-5 flex gap-1 overflow-x-auto border-b border-line bg-base/90 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6">
        {SECTIONS.map((s) => {
          const Icon = s.icon;
          return (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm text-muted transition-colors hover:bg-surface-2 hover:text-fg"
            >
              <Icon size={14} /> {s.label}
            </a>
          );
        })}
      </nav>

      <div className="space-y-8">
        <section id="overview" className="scroll-mt-16 space-y-4">
          <Panel title="Description" icon={<Notebook size={14} />}>
            <NotesEditor
              id={project.id}
              initial={project.notes ?? ""}
              action={updateProjectNotesAction}
              placeholder="What is this project? Goal, scope, notes..."
            />
          </Panel>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Panel title={`Decisions (${decisions.length})`} icon={<GitBranch size={14} />}>
              {decisions.length === 0 ? (
                <p className="text-sm text-muted">No decisions yet.</p>
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
                <p className="text-sm text-muted">No research yet.</p>
              ) : (
                <ul className="space-y-3">
                  {research.map((r) => (
                    <ResearchRow key={r.id} research={r} />
                  ))}
                </ul>
              )}
            </Panel>
          </div>
        </section>

        <section id="plan" className="scroll-mt-16">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-fg">
            <LayoutList size={18} className="text-accent" /> Plan
          </h2>
          <PlanEditor
            projectId={id}
            phases={plan.phases}
            unphased={plan.unphased}
            agents={agents}
            teams={teams}
          />
        </section>

        <section id="timeline" className="scroll-mt-16">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-fg">
            <CalendarRange size={18} className="text-accent" /> Timeline
          </h2>
          <GanttView phases={plan.phases} unphased={plan.unphased} agents={agents} />
        </section>

        <section id="documents" className="scroll-mt-16">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-fg">
            <FileText size={18} className="text-accent" /> Documents
          </h2>
          <DocsManager projectId={id} documents={documents} />
        </section>

        <section id="dashboard" className="scroll-mt-16">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-fg">
            <BarChart3 size={18} className="text-accent" /> Dashboard
          </h2>
          <ProjectDashboard
            phases={plan.phases}
            unphased={plan.unphased}
            teams={teams}
            agents={agents}
          />
        </section>

        <section className="scroll-mt-16">
          <HistoryList events={history} />
        </section>
      </div>
    </div>
  );
}
