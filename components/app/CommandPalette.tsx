"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CornerDownLeft, Search } from "lucide-react";
import { sections } from "@/lib/sections";

type Entry = { label: string; meta: string; href: string };

const CREATE: Entry[] = [
  { label: "New project", meta: "Create", href: "/projects" },
  { label: "New task", meta: "Create", href: "/tasks" },
  { label: "New decision", meta: "Create", href: "/decisions" },
  { label: "New opportunity", meta: "Create", href: "/opportunities" },
  { label: "New research", meta: "Create", href: "/research" },
  { label: "New agent", meta: "Create", href: "/agents" },
];

const GOTO: Entry[] = sections.map((s) => ({ label: s.label, meta: "Go to", href: s.href }));

export default function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<Entry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [index, setIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setIndex(0);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    }
    function onOpen() {
      setOpen(true);
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("nexus:command", onOpen as EventListener);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("nexus:command", onOpen as EventListener);
    };
  }, []);

  useEffect(() => {
    if (open && !loaded) {
      fetch("/api/search")
        .then((r) => (r.ok ? r.json() : []))
        .then((data: { type: string; title: string; href: string }[]) => {
          setItems(data.map((d) => ({ label: d.title, meta: d.type, href: d.href })));
          setLoaded(true);
        })
        .catch(() => setLoaded(true));
    }
    if (open) setTimeout(() => inputRef.current?.focus(), 10);
  }, [open, loaded]);

  const q = query.trim().toLowerCase();
  const match = (e: Entry) => !q || e.label.toLowerCase().includes(q);
  const results = (q ? items.filter(match).slice(0, 8) : items.slice(0, 5));
  const visible: Entry[] = [...results, ...CREATE.filter(match), ...GOTO.filter(match)];
  const clampedIndex = Math.min(index, Math.max(0, visible.length - 1));

  function activate(e?: Entry) {
    const target = e ?? visible[clampedIndex];
    if (!target) return;
    router.push(target.href);
    close();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 px-4 pt-[12vh]" onClick={close}>
      <div
        className="panel w-full max-w-xl overflow-hidden p-0 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-line px-3">
          <Search size={16} className="text-muted" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIndex(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setIndex((i) => Math.min(i + 1, visible.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setIndex((i) => Math.max(i - 1, 0));
              } else if (e.key === "Enter") {
                e.preventDefault();
                activate();
              }
            }}
            placeholder="Search or jump to..."
            className="h-12 w-full bg-transparent text-sm text-fg placeholder:text-muted focus:outline-none"
          />
        </div>
        <ul className="max-h-[50vh] overflow-y-auto p-1.5">
          {visible.length === 0 && (
            <li className="px-3 py-6 text-center text-sm text-muted">No matches.</li>
          )}
          {visible.map((e, i) => (
            <li key={`${e.href}-${e.label}-${i}`}>
              <button
                onMouseEnter={() => setIndex(i)}
                onClick={() => activate(e)}
                className={
                  "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors " +
                  (i === clampedIndex ? "bg-surface-2 text-fg" : "text-fg/90 hover:bg-surface-2/60")
                }
              >
                <span className="truncate">{e.label}</span>
                <span className="flex items-center gap-2">
                  <span className="hud-label">{e.meta}</span>
                  {i === clampedIndex && <CornerDownLeft size={13} className="text-muted" />}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
