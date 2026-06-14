import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { HistoryList } from "@/components/app/HistoryList";
import NotConfigured from "@/components/mission-control/NotConfigured";
import { Panel } from "@/components/ui/Panel";
import { getDecisionDetail } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { fmtDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function DecisionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  if (!isSupabaseConfigured) return <NotConfigured />;
  const { id } = await params;
  const detail = await getDecisionDetail(id);
  if (!detail) notFound();
  const { decision, project, history } = detail;

  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 py-5 sm:px-6">
      <Link
        href="/decisions"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-accent"
      >
        <ArrowLeft size={14} /> Decisions
      </Link>

      <header className="mb-5">
        <h1 className="text-xl font-semibold tracking-wide text-accent-2">{decision.decision}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
          <span>{fmtDateTime(decision.created_at)}</span>
          {project && (
            <Link href={`/projects/${project.id}`} className="text-accent hover:underline">
              {project.name}
            </Link>
          )}
        </div>
      </header>

      <div className="space-y-4">
        <Panel title="Rationale">
          {decision.rationale ? (
            <p className="text-sm text-fg">{decision.rationale}</p>
          ) : (
            <p className="text-sm text-muted">No rationale recorded.</p>
          )}
        </Panel>

        <HistoryList events={history} />
      </div>
    </div>
  );
}
