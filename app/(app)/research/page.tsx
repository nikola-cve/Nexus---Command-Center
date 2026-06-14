import AddBar from "@/components/app/AddBar";
import { SectionHeader } from "@/components/app/SectionHeader";
import { ResearchRow } from "@/components/mission-control/BoardRows";
import NotConfigured from "@/components/mission-control/NotConfigured";
import { Panel } from "@/components/ui/Panel";
import { getDashboardData } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function ResearchPage() {
  const data = await getDashboardData();
  if (!data) return <NotConfigured />;
  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 py-5 sm:px-6">
      <SectionHeader sectionKey="research" subtitle="Notes and sources" />
      <div className="space-y-4">
        <Panel>
          <AddBar kind="research" />
        </Panel>
        <Panel title={`All research (${data.research.length})`}>
          {data.research.length === 0 ? (
            <p className="text-sm text-muted">No research saved yet.</p>
          ) : (
            <ul className="space-y-3">
              {data.research.map((r) => (
                <ResearchRow key={r.id} research={r} />
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
