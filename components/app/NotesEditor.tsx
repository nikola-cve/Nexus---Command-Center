"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { ActionResult } from "@/app/actions";

/** Editable notes/description bound to a server action(id, value). */
export default function NotesEditor({
  id,
  initial,
  action,
  placeholder,
}: {
  id: string;
  initial: string;
  action: (id: string, value: string) => Promise<ActionResult>;
  placeholder?: string;
}) {
  const [value, setValue] = useState(initial);
  const [pending, start] = useTransition();
  const dirty = value !== initial;

  return (
    <div>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder ?? "Add a description..."}
        rows={4}
        className="w-full rounded-md border border-line bg-surface/50 px-3 py-2 text-sm text-fg placeholder:text-muted focus:border-accent/50 focus:outline-none"
      />
      <div className="mt-2 flex justify-end">
        <button
          disabled={pending || !dirty}
          onClick={() =>
            start(async () => {
              const r = await action(id, value);
              if (r.ok) toast.success("Saved");
              else toast.error(r.error);
            })
          }
          className="rounded-md border border-accent/50 px-3 py-1.5 text-sm font-medium text-accent transition-colors hover:bg-accent/10 disabled:opacity-40"
        >
          {pending ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
