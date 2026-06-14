import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <span className="hud-label mb-4">Personal Operating Center</span>
      <h1 className="text-4xl font-semibold tracking-wide text-accent text-glow sm:text-6xl">
        NEXUS COMMAND CENTER
      </h1>
      <p className="mt-5 max-w-xl text-balance text-muted">
        One place to run your work: projects, decisions, tasks, research, and opportunities, with
        Claude on call as the execution backend.
      </p>
      <Link
        href="/bridge"
        className="mt-9 rounded-md border border-accent/50 px-6 py-3 text-sm font-medium text-accent transition-colors hover:bg-accent/10"
      >
        Enter the Bridge
      </Link>
    </main>
  );
}
