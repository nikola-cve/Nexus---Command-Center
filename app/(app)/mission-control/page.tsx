import OverviewView from "@/components/app/OverviewView";
import NotConfigured from "@/components/mission-control/NotConfigured";
import { getDashboardData } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const data = await getDashboardData();
  if (!data) return <NotConfigured />;
  return <OverviewView data={data} />;
}
