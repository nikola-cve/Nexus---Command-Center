"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Search } from "lucide-react";
import { signOut } from "@/app/login/actions";
import { sections } from "@/lib/sections";
import { cn } from "@/lib/utils";

export default function SideNav() {
  const path = usePathname();
  return (
    <nav className="flex shrink-0 items-center gap-1 overflow-x-auto border-b border-line bg-base/80 p-2 backdrop-blur lg:sticky lg:top-0 lg:h-screen lg:w-60 lg:flex-col lg:items-stretch lg:gap-0.5 lg:overflow-y-auto lg:border-b-0 lg:border-r lg:p-3">
      <div className="mr-3 hidden items-center gap-2 px-2 py-2 lg:flex">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-accent text-xs font-bold text-white">
          N
        </span>
        <span className="text-[15px] font-semibold tracking-tight text-fg">Nexus</span>
      </div>

      <button
        onClick={() => window.dispatchEvent(new CustomEvent("nexus:command"))}
        className="flex shrink-0 items-center gap-2.5 rounded-lg border border-line px-3 py-2 text-sm text-muted transition-colors hover:bg-surface/60 hover:text-fg lg:mb-1"
      >
        <Search size={17} />
        <span className="hidden sm:inline">Search</span>
        <span className="ml-auto hidden rounded border border-line px-1.5 py-0.5 text-[10px] lg:inline">
          ⌘K
        </span>
      </button>

      {sections.map((s) => {
        const active = path === s.href || (s.href !== "/mission-control" && path.startsWith(s.href));
        const Icon = s.icon;
        return (
          <Link
            key={s.key}
            href={s.href}
            className={cn(
              "flex items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-surface text-fg"
                : "text-muted hover:bg-surface/60 hover:text-fg",
            )}
          >
            <Icon size={17} className={active ? "text-accent" : "text-muted"} />
            {s.label}
          </Link>
        );
      })}

      <form action={signOut} className="lg:mt-auto lg:pt-2">
        <button
          type="submit"
          className="flex w-full items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface/60 hover:text-danger"
        >
          <LogOut size={17} /> Sign out
        </button>
      </form>
    </nav>
  );
}
