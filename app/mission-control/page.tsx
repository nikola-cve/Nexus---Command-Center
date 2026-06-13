import Dashboard from "@/components/mission-control/Dashboard";
import NotConfigured from "@/components/mission-control/NotConfigured";
import { getDashboardData } from "@/lib/data";

// Always render per request so newly created data shows immediately.
export const dynamic = "force-dynamic";

export default async function MissionControlPage() {
  const data = await getDashboardData();
  if (!data) return <NotConfigured />;
  return <Dashboard data={data} />;
}
