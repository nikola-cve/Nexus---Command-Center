import AddBar from "@/components/app/AddBar";
import { SectionHeader } from "@/components/app/SectionHeader";
import { OpportunityRow } from "@/components/mission-control/BoardRows";
import NotConfigured from "@/components/mission-control/NotConfigured";
import { Panel } from "@/components/ui/Panel";
import { getDashboardData } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function OpportunitiesPage() {
  const data = await getDashboardData();
  if (!data) return <NotConfigured />;
  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 py-5 sm:px-6">
      <SectionHeader sectionKey="opportunities" subtitle="Leads and ideas to pursue" />
      <div className="space-y-4">
        <Panel>
          <AddBar kind="opportunity" />
        </Panel>
        <Panel title={`All opportunities (${data.opportunities.length})`}>
          {data.opportunities.length === 0 ? (
            <p className="text-sm text-muted">No opportunities yet. Add one above.</p>
          ) : (
            <ul className="space-y-3">
              {data.opportunities.map((o) => (
                <OpportunityRow key={o.id} opportunity={o} />
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
