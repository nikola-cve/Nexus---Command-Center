"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Boxes, Network, Notebook, Radar, type LucideIcon } from "lucide-react";
import { signOut } from "@/app/login/actions";
import { cn } from "@/lib/utils";
import { LogOut } from "lucide-react";

const SPACES: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/bridge", label: "Bridge", icon: Radar },
  { href: "/org", label: "Organization", icon: Network },
  { href: "/projects", label: "Projects", icon: Boxes },
  { href: "/research", label: "Library", icon: Notebook },
  { href: "/mission-control", label: "Activity", icon: Activity },
];

export default function Rail() {
  const path = usePathname();
  return (
    <nav className="flex w-14 shrink-0 flex-col items-center gap-1 border-r border-white/10 bg-black/30 py-2 backdrop-blur">
      <Link
        href="/bridge"
        className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-accent-2 text-sm font-bold text-white shadow-lg"
        title="Nexus"
      >
        N
      </Link>
      {SPACES.map((s) => {
        const active = path === s.href || (s.href !== "/bridge" && path.startsWith(s.href));
        const Icon = s.icon;
        return (
          <Link
            key={s.href}
            href={s.href}
            title={s.label}
            className={cn(
              "group relative flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
              active ? "bg-accent/15 text-accent ring-1 ring-inset ring-accent/30" : "text-muted hover:bg-white/5 hover:text-fg",
            )}
          >
            <Icon size={18} />
            {active && <span className="absolute left-0 h-5 w-0.5 rounded-r bg-accent" />}
          </Link>
        );
      })}
      <form action={signOut} className="mt-auto">
        <button
          type="submit"
          title="Sign out"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-muted transition-colors hover:bg-white/5 hover:text-danger"
        >
          <LogOut size={17} />
        </button>
      </form>
    </nav>
  );
}
