import Link from "next/link";
import { Bot } from "lucide-react";
import AddBar from "@/components/app/AddBar";
import { SectionHeader } from "@/components/app/SectionHeader";
import NotConfigured from "@/components/mission-control/NotConfigured";
import { Panel } from "@/components/ui/Panel";
import { getAgents } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { agentColor } from "@/lib/agent-color";

export const dynamic = "force-dynamic";

export default async function AgentsPage() {
  if (!isSupabaseConfigured) return <NotConfigured />;
  const agents = await getAgents();

  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 py-5 sm:px-6">
      <SectionHeader sectionKey="agents" subtitle="Your operating modes, editable" />
      <div className="space-y-4">
        <Panel>
          <AddBar kind="agent" />
        </Panel>

        {agents.length === 0 ? (
          <Panel>
            <p className="text-sm text-muted">No agents yet. Add one above.</p>
          </Panel>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {agents.map((a) => (
              <Link
                key={a.id}
                href={`/agents/${a.id}`}
                className="panel panel-hover block p-4 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Bot size={16} className={agentColor(a.color)} />
                  <span className="font-medium text-fg">{a.name}</span>
                  {!a.enabled && <span className="hud-label ml-auto text-muted">off</span>}
                </div>
                <p className="mt-1 text-sm text-muted">{a.role}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
