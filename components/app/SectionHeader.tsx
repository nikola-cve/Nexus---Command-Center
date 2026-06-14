import { sections } from "@/lib/sections";

export function SectionHeader({
  sectionKey,
  subtitle,
}: {
  sectionKey: string;
  subtitle?: string;
}) {
  const s = sections.find((x) => x.key === sectionKey);
  if (!s) return null;
  const Icon = s.icon;
  return (
    <header className="mb-5 flex items-center gap-3">
      <Icon className={s.text} size={22} />
      <div>
        <h1 className="text-xl font-semibold tracking-wide text-fg">{s.label}</h1>
        {subtitle && <p className="hud-label">{subtitle}</p>}
      </div>
    </header>
  );
}
