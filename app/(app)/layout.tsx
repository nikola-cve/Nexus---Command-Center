import AppShell, { type ShellData } from "@/components/shell/AppShell";
import { getDashboardData, getOrgTree } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const [org, dash] = await Promise.all([getOrgTree(), getDashboardData()]);

  const data: ShellData = {
    departments: org.departments,
    projects: dash?.projects ?? [],
    tasks: dash?.tasks ?? [],
    agents: dash?.agents ?? [],
    events: dash?.events ?? [],
  };

  return <AppShell data={data}>{children}</AppShell>;
}
