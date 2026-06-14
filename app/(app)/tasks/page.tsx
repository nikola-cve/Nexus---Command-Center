import AddBar from "@/components/app/AddBar";
import { SectionHeader } from "@/components/app/SectionHeader";
import { TaskRow } from "@/components/mission-control/BoardRows";
import NotConfigured from "@/components/mission-control/NotConfigured";
import { Panel } from "@/components/ui/Panel";
import { getDashboardData } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const data = await getDashboardData();
  if (!data) return <NotConfigured />;
  const projectName = new Map(data.projects.map((p) => [p.id, p.name]));
  const open = data.tasks.filter((t) => t.status !== "done").length;
  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 py-5 sm:px-6">
      <SectionHeader sectionKey="tasks" subtitle={`${open} open`} />
      <div className="space-y-4">
        <Panel>
          <AddBar kind="task" projects={data.projects} />
        </Panel>
        <Panel title={`All tasks (${data.tasks.length})`}>
          {data.tasks.length === 0 ? (
            <p className="text-sm text-muted">No tasks yet. Add one above.</p>
          ) : (
            <ul className="space-y-2">
              {data.tasks.map((t) => (
                <TaskRow
                  key={t.id}
                  task={t}
                  projectName={t.project_id ? projectName.get(t.project_id) : undefined}
                />
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
