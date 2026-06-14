import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Notebook } from "lucide-react";
import { updateTaskNotesAction } from "@/app/actions";
import { HistoryList } from "@/components/app/HistoryList";
import NotesEditor from "@/components/app/NotesEditor";
import NotConfigured from "@/components/mission-control/NotConfigured";
import { Panel } from "@/components/ui/Panel";
import { getTaskDetail } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const statusColor: Record<string, string> = {
  todo: "text-muted",
  doing: "text-accent",
  done: "text-ok",
};

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  if (!isSupabaseConfigured) return <NotConfigured />;
  const { id } = await params;
  const detail = await getTaskDetail(id);
  if (!detail) notFound();
  const { task, project, history } = detail;

  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 py-5 sm:px-6">
      <Link
        href="/tasks"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-accent"
      >
        <ArrowLeft size={14} /> Tasks
      </Link>

      <header className="mb-5">
        <h1 className="text-2xl font-semibold tracking-wide text-fg">{task.title}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
          <span className={`rounded border border-line px-2 py-0.5 ${statusColor[task.status]}`}>
            {task.status}
          </span>
          <span className="text-muted">{task.priority} priority</span>
          {project && (
            <Link href={`/projects/${project.id}`} className="text-accent hover:underline">
              {project.name}
            </Link>
          )}
        </div>
      </header>

      <div className="space-y-4">
        <Panel title="Notes" icon={<Notebook size={14} />}>
          <NotesEditor
            id={task.id}
            initial={task.notes ?? ""}
            action={updateTaskNotesAction}
            placeholder="Details, steps, blockers..."
          />
        </Panel>

        <HistoryList events={history} />
      </div>
    </div>
  );
}
