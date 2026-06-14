"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteAgentAction, updateAgentAction } from "@/app/actions";
import { Panel } from "@/components/ui/Panel";
import type { Agent, Team } from "@/lib/db/types";

const COLORS = ["accent", "info", "ok", "accent-2", "warn", "danger", "plan"];

/** Verified model IDs (see CLAUDE.md / claude-api skill). Opus 4.8 is the default. */
const MODELS = [
  { id: "claude-opus-4-8", label: "Opus 4.8 (default: coding, agentic)" },
  { id: "claude-sonnet-4-6", label: "Sonnet 4.6 (balance, volume)" },
  { id: "claude-haiku-4-5", label: "Haiku 4.5 (fast, cheap, subagents)" },
  { id: "claude-fable-5", label: "Fable 5 (hardest reasoning)" },
];

const inputClass =
  "w-full rounded-md border border-line bg-surface/50 px-3 py-2 text-sm text-fg placeholder:text-muted focus:border-accent/50 focus:outline-none";

function parseList(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function AgentEditor({ agent, teams = [] }: { agent: Agent; teams?: Team[] }) {
  const router = useRouter();
  const [name, setName] = useState(agent.name);
  const [role, setRole] = useState(agent.role);
  const [prompt, setPrompt] = useState(agent.system_prompt);
  const [color, setColor] = useState(agent.color);
  const [enabled, setEnabled] = useState(agent.enabled);
  const [teamId, setTeamId] = useState(agent.team_id ?? "");
  const [model, setModel] = useState(agent.model);
  const [skills, setSkills] = useState((agent.skills ?? []).join(", "));
  const [tools, setTools] = useState((agent.tools ?? []).join(", "));
  const [pending, start] = useTransition();

  const dirty =
    name !== agent.name ||
    role !== agent.role ||
    prompt !== agent.system_prompt ||
    color !== agent.color ||
    enabled !== agent.enabled ||
    teamId !== (agent.team_id ?? "") ||
    model !== agent.model ||
    skills !== (agent.skills ?? []).join(", ") ||
    tools !== (agent.tools ?? []).join(", ");

  function save() {
    start(async () => {
      const r = await updateAgentAction(agent.id, {
        name,
        role,
        system_prompt: prompt,
        color,
        enabled,
        team_id: teamId || null,
        model,
        skills: parseList(skills),
        tools: parseList(tools),
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
        router.push("/org");
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

      <Panel title="Capability">
        <p className="mb-3 text-xs text-muted">
          Where this agent sits, what powers it, and what it knows. Skills and tools are
          comma separated.
        </p>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-3">
            <label className="block flex-1 min-w-[180px]">
              <span className="hud-label">Team</span>
              <select
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
                className="mt-1 h-9 w-full rounded-md border border-line bg-surface/50 px-2 text-sm text-fg focus:outline-none"
              >
                <option value="">Unassigned</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block flex-1 min-w-[180px]">
              <span className="hud-label">Model</span>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="mt-1 h-9 w-full rounded-md border border-line bg-surface/50 px-2 text-sm text-fg focus:outline-none"
              >
                {MODELS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
                {!MODELS.some((m) => m.id === model) && <option value={model}>{model}</option>}
              </select>
            </label>
          </div>
          <label className="block">
            <span className="hud-label">Skills / knowledge</span>
            <input
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="sourced research, find similar, verified vs assumption"
              className={`mt-1 ${inputClass}`}
            />
          </label>
          <label className="block">
            <span className="hud-label">Tools (MCP / skills)</span>
            <input
              value={tools}
              onChange={(e) => setTools(e.target.value)}
              placeholder="web_search, supabase, github, figma"
              className={`mt-1 ${inputClass}`}
            />
          </label>
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
