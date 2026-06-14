import BridgeView from "@/components/bridge/BridgeView";
import NotConfigured from "@/components/mission-control/NotConfigured";
import { getDashboardData, getOrgTree } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function BridgePage() {
  if (!isSupabaseConfigured) return <NotConfigured />;
  const [org, dash] = await Promise.all([getOrgTree(), getDashboardData()]);
  return <BridgeView departments={org.departments} tasks={dash?.tasks ?? []} />;
}
