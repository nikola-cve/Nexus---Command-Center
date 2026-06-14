import { notFound } from "next/navigation";
import SectorOffice from "@/components/sector/SectorOffice";
import NotConfigured from "@/components/mission-control/NotConfigured";
import { getDashboardData, getOrgTree } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function SectorPage({ params }: { params: Promise<{ id: string }> }) {
  if (!isSupabaseConfigured) return <NotConfigured />;
  const { id } = await params;
  const [org, dash] = await Promise.all([getOrgTree(), getDashboardData()]);
  const dept = org.departments.find((d) => d.id === id);
  if (!dept) notFound();
  return <SectorOffice dept={dept} agents={dash?.agents ?? []} tasks={dash?.tasks ?? []} />;
}
