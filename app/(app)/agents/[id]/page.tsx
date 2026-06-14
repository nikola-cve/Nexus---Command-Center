import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import AgentEditor from "@/components/app/AgentEditor";
import NotConfigured from "@/components/mission-control/NotConfigured";
import { getAgentDetail, getTeams } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AgentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  if (!isSupabaseConfigured) return <NotConfigured />;
  const { id } = await params;
  const [agent, teams] = await Promise.all([getAgentDetail(id), getTeams()]);
  if (!agent) notFound();

  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 py-5 sm:px-6">
      <Link
        href="/agents"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-accent"
      >
        <ArrowLeft size={14} /> Agents
      </Link>
      <header className="mb-5">
        <h1 className="text-2xl font-semibold tracking-wide text-accent-2">{agent.name}</h1>
        <p className="hud-label mt-1">Edit how this agent thinks and acts</p>
      </header>
      <AgentEditor agent={agent} teams={teams} />
    </div>
  );
}
