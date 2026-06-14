"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteAgentAction, updateAgentAction } from "@/app/actions";
import { Panel } from "@/components/ui/Panel";
import type { Agent } from "@/lib/db/types";

const COLORS = ["accent", "info", "ok", "accent-2", "warn", "danger", "plan"];

const inputClass =
  "w-full rounded-md border border-line bg-surface/50 px-3 py-2 text-sm text-fg placeholder:text-muted focus:border-accent/50 focus:outline-none";

export default function AgentEditor({ agent }: { agent: Agent }) {
  const router = useRouter();
  const [name, setName] = useState(agent.name);
  const [role, setRole] = useState(agent.role);
  const [prompt, setPrompt] = useState(agent.system_prompt);
  const [color, setColor] = useState(agent.color);
  const [enabled, setEnabled] = useState(agent.enabled);
  const [pending, start] = useTransition();

  const dirty =
    name !== agent.name ||
    role !== agent.role ||
    prompt !== agent.system_prompt ||
    color !== agent.color ||
    enabled !== agent.enabled;

  function save() {
    start(async () => {
      const r = await updateAgentAction(agent.id, {
        name,
        role,
        system_prompt: prompt,
        color,
        enabled,
      });
      if (r.ok) toast.success("Agent saved");
      else toast.error(r.error);
    });
  }

  function remove() {
    start(async () => {
      const r = await deleteAgentAction(agent.id);
      if (r.ok) {
        toast.success("Agent deleted");
        router.push("/agents");
      } else {
        toast.error(r.error);
      }
    });
  }

  return (
    <div className="space-y-4">
      <Panel title="Identity">
        <div className="space-y-3">
          <label className="block">
            <span className="hud-label">Name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} className={`mt-1 ${inputClass}`} />
          </label>
          <label className="block">
            <span className="hud-label">Role</span>
            <input value={role} onChange={(e) => setRole(e.target.value)} className={`mt-1 ${inputClass}`} />
          </label>
          <div className="flex flex-wrap items-center gap-4">
            <label className="block">
              <span className="hud-label">Color</span>
              <select
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="mt-1 h-9 rounded-md border border-line bg-surface/50 px-2 text-sm text-fg focus:outline-none"
              >
                {COLORS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="mt-5 flex items-center gap-2 text-sm text-fg">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="h-4 w-4 accent-cyan-400"
              />
              Enabled
            </label>
          </div>
        </div>
      </Panel>

      <Panel title="System prompt" icon={null}>
        <p className="mb-2 text-xs text-muted">
          This is the instruction the engine will give Claude when this agent runs. Write it like a
          job brief.
        </p>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={8}
          className={inputClass}
        />
      </Panel>

      <div className="flex items-center justify-between">
        <button
          onClick={remove}
          disabled={pending}
          className="flex items-center gap-1.5 rounded-md border border-line px-3 py-2 text-sm text-muted transition-colors hover:border-danger/50 hover:text-danger disabled:opacity-40"
        >
          <Trash2 size={14} /> Delete
        </button>
        <button
          onClick={save}
          disabled={pending || !dirty}
          className="glow-cyan rounded-md border border-accent/50 px-4 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent/10 disabled:opacity-40"
        >
          {pending ? "Saving..." : "Save changes"}
        </button>
      </div>
    </div>
  );
}
