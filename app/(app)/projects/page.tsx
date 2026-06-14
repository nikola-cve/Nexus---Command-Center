import AddBar from "@/components/app/AddBar";
import { SectionHeader } from "@/components/app/SectionHeader";
import { ProjectRow } from "@/components/mission-control/BoardRows";
import NotConfigured from "@/components/mission-control/NotConfigured";
import { Panel } from "@/components/ui/Panel";
import { getDashboardData } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const data = await getDashboardData();
  if (!data) return <NotConfigured />;
  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 py-5 sm:px-6">
      <SectionHeader sectionKey="projects" subtitle="What you are building" />
      <div className="space-y-4">
        <Panel>
          <AddBar kind="project" />
        </Panel>
        <Panel title={`All projects (${data.projects.length})`}>
          {data.projects.length === 0 ? (
            <p className="text-sm text-muted">No projects yet. Add one above.</p>
          ) : (
            <ul className="space-y-3">
              {data.projects.map((p) => (
                <ProjectRow key={p.id} project={p} />
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
