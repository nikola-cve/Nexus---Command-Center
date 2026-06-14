import { cn } from "@/lib/utils";

/** Shared panel container used across the app. */
export function Panel({
  title,
  icon,
  action,
  children,
  className,
}: {
  title?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("panel panel-hover p-4 transition-colors", className)}>
      {title && (
        <header className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-accent">{icon}</span>
            <h2 className="hud-label">{title}</h2>
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}
