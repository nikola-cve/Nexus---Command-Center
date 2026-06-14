"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { signOut } from "@/app/login/actions";
import { sections } from "@/lib/sections";
import { cn } from "@/lib/utils";

export default function SideNav() {
  const path = usePathname();
  return (
    <nav className="flex shrink-0 items-center gap-1 overflow-x-auto border-b border-line bg-surface/30 p-2 lg:sticky lg:top-0 lg:h-screen lg:w-56 lg:flex-col lg:items-stretch lg:overflow-y-auto lg:border-b-0 lg:border-r">
      <div className="mr-2 hidden px-2 py-3 lg:block">
        <div className="text-lg font-semibold tracking-wide text-accent text-glow">NEXUS</div>
        <div className="hud-label">Command Center</div>
      </div>

      {sections.map((s) => {
        const active = path === s.href;
        const Icon = s.icon;
        return (
          <Link
            key={s.key}
            href={s.href}
            className={cn(
              "flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm transition-colors",
              active
                ? cn("bg-surface/70 lg:border-l-2", s.text, s.border)
                : "border-transparent text-muted hover:bg-surface/40 hover:text-fg lg:border-l-2",
            )}
          >
            <Icon size={16} className={active ? s.text : ""} />
            {s.label}
          </Link>
        );
      })}

      <form action={signOut} className="lg:mt-auto">
        <button
          type="submit"
          className="flex w-full items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm text-muted transition-colors hover:bg-surface/40 hover:text-danger"
        >
          <LogOut size={16} /> Sign out
        </button>
      </form>
    </nav>
  );
}
