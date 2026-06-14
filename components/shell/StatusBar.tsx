"use client";

import { useEffect, useState } from "react";
import { nowClock } from "@/lib/format";

function StatItem({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`h-1.5 w-1.5 rounded-full ${color}`} />
      <span className="text-muted">{label}</span>
      <span className="text-fg/90">{value}</span>
    </span>
  );
}

export default function StatusBar({
  agents,
  working,
  blocked,
  awaiting,
}: {
  agents: number;
  working: number;
  blocked: number;
  awaiting: number;
}) {
  const [now, setNow] = useState<string | null>(null);
  useEffect(() => {
    const tick = () => setNow(nowClock());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <footer className="telemetry flex h-7 shrink-0 items-center gap-4 border-t border-line bg-surface px-3 text-[11px] text-muted backdrop-blur">
      <span className="flex items-center gap-1.5 text-ok">
        <span className="node-dot node-pulse h-1.5 w-1.5 bg-current" />
        <span className="text-fg/90">ONLINE</span>
      </span>
      <StatItem label="agents" value={agents} color="bg-accent" />
      <StatItem label="working" value={working} color="bg-info" />
      <StatItem label="blocked" value={blocked} color="bg-danger" />
      <StatItem label="awaiting" value={awaiting} color="bg-warn" />
      <span className="ml-auto hidden text-muted sm:inline">model Opus 4.8</span>
      <span className="text-fg/80 tabular-nums">{now ?? "--:--:--"} Belgrade</span>
    </footer>
  );
}
