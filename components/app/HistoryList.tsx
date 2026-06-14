import { History } from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import { fmtDateTime } from "@/lib/format";
import type { ActivityEvent } from "@/lib/db/types";

/** The trace of what happened to an item (or project and its children). */
export function HistoryList({ events }: { events: ActivityEvent[] }) {
  return (
    <Panel title="History" icon={<History size={14} />}>
      {events.length === 0 ? (
        <p className="text-sm text-muted">No history yet.</p>
      ) : (
        <ul className="space-y-2 text-xs">
          {events.map((e) => (
            <li key={e.id} className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="font-mono text-muted">{fmtDateTime(e.created_at)}</span>
              <span className="font-mono text-accent">{e.type}</span>
              <span className="text-fg">{e.message}</span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
