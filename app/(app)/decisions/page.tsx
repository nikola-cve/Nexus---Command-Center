import AddBar from "@/components/app/AddBar";
import { SectionHeader } from "@/components/app/SectionHeader";
import { DecisionRow } from "@/components/mission-control/BoardRows";
import NotConfigured from "@/components/mission-control/NotConfigured";
import { Panel } from "@/components/ui/Panel";
import { getDashboardData } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function DecisionsPage() {
  const data = await getDashboardData();
  if (!data) return <NotConfigured />;
  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 py-5 sm:px-6">
      <SectionHeader sectionKey="decisions" subtitle="Your decision log" />
      <div className="space-y-4">
        <Panel>
          <AddBar kind="decision" projects={data.projects} />
        </Panel>
        <Panel title={`All decisions (${data.decisions.length})`}>
          {data.decisions.length === 0 ? (
            <p className="text-sm text-muted">No decisions logged yet.</p>
          ) : (
            <ul className="space-y-3">
              {data.decisions.map((d) => (
                <DecisionRow key={d.id} decision={d} />
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
