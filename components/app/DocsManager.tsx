"use client";

import { useMemo, useState, useTransition } from "react";
import { marked } from "marked";
import { Eye, FileText, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  createDocumentAction,
  deleteDocumentAction,
  updateDocumentAction,
  type ActionResult,
} from "@/app/actions";
import type { DocumentType, ProjectDocument } from "@/lib/db/types";

const TYPES: { value: DocumentType; label: string }[] = [
  { value: "product_map", label: "Product Map" },
  { value: "design", label: "Design" },
  { value: "prd", label: "PRD" },
  { value: "note", label: "Note" },
];

const typeLabel = (t: DocumentType) => TYPES.find((x) => x.value === t)?.label ?? "Note";

const input =
  "h-9 rounded-md border border-line bg-surface/50 px-3 text-sm text-fg placeholder:text-muted focus:border-accent/50 focus:outline-none";

function run(start: (cb: () => void) => void, fn: () => Promise<ActionResult>, ok?: string) {
  start(async () => {
    const r = await fn();
    if (r.ok) {
      if (ok) toast.success(ok);
    } else toast.error(r.error);
  });
}

function Editor({ doc }: { doc: ProjectDocument }) {
  const [title, setTitle] = useState(doc.title);
  const [content, setContent] = useState(doc.content);
  const [mode, setMode] = useState<"write" | "preview">("write");
  const [pending, start] = useTransition();
  const dirty = title !== doc.title || content !== doc.content;
  const html = useMemo(() => marked.parse(content || "*Nothing yet.*"), [content]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <input value={title} onChange={(e) => setTitle(e.target.value)} className={`flex-1 ${input}`} />
        <div className="flex rounded-md border border-line p-0.5">
          <button
            onClick={() => setMode("write")}
            className={`flex items-center gap-1 rounded px-2 py-1 text-xs ${mode === "write" ? "bg-surface text-fg" : "text-muted"}`}
          >
            <Pencil size={12} /> Write
          </button>
          <button
            onClick={() => setMode("preview")}
            className={`flex items-center gap-1 rounded px-2 py-1 text-xs ${mode === "preview" ? "bg-surface text-fg" : "text-muted"}`}
          >
            <Eye size={12} /> Preview
          </button>
        </div>
      </div>

      {mode === "write" ? (
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={18}
          placeholder="Write in Markdown. Headings, lists, tables, code all work."
          className="w-full rounded-md border border-line bg-surface/50 px-3 py-2 font-mono text-sm text-fg placeholder:text-muted focus:border-accent/50 focus:outline-none"
        />
      ) : (
        <div
          className="prose-doc min-h-[18rem] rounded-md border border-line bg-surface/40 px-4 py-3"
          dangerouslySetInnerHTML={{ __html: html as string }}
        />
      )}

      <div className="flex items-center justify-between">
        <button
          disabled={pending}
          onClick={() => run(start, () => deleteDocumentAction(doc.id), "Document deleted")}
          className="flex items-center gap-1.5 rounded-md border border-line px-3 py-2 text-sm text-muted hover:border-danger/50 hover:text-danger disabled:opacity-40"
        >
          <Trash2 size={14} /> Delete
        </button>
        <button
          disabled={pending || !dirty}
          onClick={() => run(start, () => updateDocumentAction(doc.id, { title, content }), "Saved")}
          className="rounded-md border border-accent/50 px-4 py-2 text-sm font-medium text-accent hover:bg-accent/10 disabled:opacity-40"
        >
          {pending ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}

export default function DocsManager({
  projectId,
  documents,
}: {
  projectId: string;
  documents: ProjectDocument[];
}) {
  const [selected, setSelected] = useState<string | null>(documents[0]?.id ?? null);
  const [pending, start] = useTransition();
  const current = documents.find((d) => d.id === selected) ?? null;

  function add(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set("projectId", projectId);
    run(
      start,
      async () => {
        const r = await createDocumentAction(fd);
        if (r.ok) form.reset();
        return r;
      },
      "Document created",
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[260px_1fr]">
      <div className="space-y-3">
        <section className="panel p-3">
          <form onSubmit={add} className="space-y-2">
            <input name="title" placeholder="Document title" className={`w-full ${input}`} />
            <div className="flex gap-2">
              <select name="type" defaultValue="product_map" className={`flex-1 ${input}`}>
                {TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                disabled={pending}
                className="flex h-9 items-center gap-1 rounded-md border border-accent/50 px-2.5 text-sm text-accent hover:bg-accent/10 disabled:opacity-50"
              >
                <Plus size={14} />
              </button>
            </div>
          </form>
        </section>

        <nav className="space-y-1">
          {documents.length === 0 && (
            <p className="px-1 text-xs text-muted">No documents yet. Create a Product Map or Design above.</p>
          )}
          {documents.map((d) => (
            <button
              key={d.id}
              onClick={() => setSelected(d.id)}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                d.id === selected ? "bg-surface text-fg" : "text-muted hover:bg-surface/60 hover:text-fg"
              }`}
            >
              <FileText size={14} className="shrink-0 text-accent-2" />
              <span className="min-w-0 flex-1 truncate">{d.title || "Untitled"}</span>
              <span className="shrink-0 rounded border border-line px-1 py-0.5 text-[9px] text-muted">
                {typeLabel(d.type)}
              </span>
            </button>
          ))}
        </nav>
      </div>

      <section className="panel p-4">
        {current ? (
          <Editor key={current.id} doc={current} />
        ) : (
          <p className="text-sm text-muted">Select or create a document to edit it.</p>
        )}
      </section>
    </div>
  );
}
