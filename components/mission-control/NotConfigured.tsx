import { Database } from "lucide-react";

/** Shown when Supabase env vars are missing, so the app never crashes. */
export default function NotConfigured() {
  return (
    <div className="mx-auto flex max-w-xl flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <Database className="mb-4 text-accent" size={28} />
      <h1 className="text-xl font-semibold text-accent text-glow">Database not connected</h1>
      <p className="mt-3 text-sm text-muted">
        Mission Control is built, but it needs the Supabase keys to load your data. Add{" "}
        <span className="font-mono text-fg">NEXT_PUBLIC_SUPABASE_URL</span> and{" "}
        <span className="font-mono text-fg">NEXT_PUBLIC_SUPABASE_ANON_KEY</span> to the environment,
        then redeploy.
      </p>
    </div>
  );
}
