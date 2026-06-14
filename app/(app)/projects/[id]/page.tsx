import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, GitBranch, ListChecks, Notebook } from "lucide-react";
import { updateProjectNotesAction } from "@/app/actions";
import { HistoryList } from "@/components/app/HistoryList";
import HandoffButton from "@/components/app/HandoffButton";
import NotesEditor from "@/components/app/NotesEditor";
import { DecisionRow, ResearchRow, TaskRow } from "@/components/mission-control/BoardRows";
import NotConfigured from "@/components/mission-control/NotConfigured";
import { Panel } from "@/components/ui/Panel";
import { getProjectDetail } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const priorityColor: Record<string, string> = {
  high: "text-danger",
  medium: "text-warn",
  low: "text-muted",
};

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  if (!isSupabaseConfigured) return <NotConfigured />;
  const { id } = await params;
  const detail = await getProjectDetail(id);
  if (!detail) notFound();
  const { project, tasks, decisions, research, history } = detail;

  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 py-5 sm:px-6">
      <Link
        href="/projects"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-accent"
      >
        <ArrowLeft size={14} /> Projects
      </Link>

      <header className="mb-5">
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
            <p className="text-sm text-muted">No tasks for this project yet.</p>
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

        <HistoryList events={history} />
      </div>
    </div>
  );
}
