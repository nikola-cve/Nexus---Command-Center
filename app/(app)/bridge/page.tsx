import HomeDashboard from "@/components/home/HomeDashboard";
import NotConfigured from "@/components/mission-control/NotConfigured";
import { getDashboardData, getOrgTree, getRecentDocuments } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function BridgePage() {
  if (!isSupabaseConfigured) return <NotConfigured />;
  const [org, dash, documents] = await Promise.all([
    getOrgTree(),
    getDashboardData(),
    getRecentDocuments(6),
  ]);
  return (
    <HomeDashboard
      departments={org.departments}
      agents={dash?.agents ?? []}
      tasks={dash?.tasks ?? []}
      projects={dash?.projects ?? []}
      events={dash?.events ?? []}
      documents={documents}
    />
  );
}
