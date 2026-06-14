import { SectionHeader } from "@/components/app/SectionHeader";
import OrgManager from "@/components/app/OrgManager";
import NotConfigured from "@/components/mission-control/NotConfigured";
import { getOrgTree } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function OrgPage() {
  if (!isSupabaseConfigured) return <NotConfigured />;
  const { departments, unassigned } = await getOrgTree();

  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 py-5 sm:px-6">
      <SectionHeader
        sectionKey="org"
        subtitle="Departments, teams, and the agents who run them"
      />
      <OrgManager departments={departments} unassigned={unassigned} />
    </div>
  );
}
