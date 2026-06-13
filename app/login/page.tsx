import { LogIn } from "lucide-react";
import { signIn } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="flex flex-1 items-center justify-center px-6">
      <div className="panel w-full max-w-sm p-6">
        <div className="mb-5 text-center">
          <span className="hud-label">Personal Operating Center</span>
          <h1 className="mt-1 text-2xl font-semibold tracking-wide text-accent text-glow">
            NEXUS
          </h1>
          <p className="mt-2 text-sm text-muted">Sign in to access Mission Control.</p>
        </div>

        <form action={signIn} className="space-y-3">
          <input
            name="email"
            type="email"
            required
            placeholder="Email"
            className="h-10 w-full rounded-md border border-line bg-surface/50 px-3 text-sm text-fg placeholder:text-muted focus:border-accent/50 focus:outline-none"
          />
          <input
            name="password"
            type="password"
            required
            placeholder="Password"
            className="h-10 w-full rounded-md border border-line bg-surface/50 px-3 text-sm text-fg placeholder:text-muted focus:border-accent/50 focus:outline-none"
          />
          {error && <p className="text-xs text-danger">{error}</p>}
          <button
            type="submit"
            className="glow-cyan flex h-10 w-full items-center justify-center gap-2 rounded-md border border-accent/50 text-sm font-medium text-accent transition-colors hover:bg-accent/10"
          >
            <LogIn size={15} /> Sign in
          </button>
        </form>
      </div>
    </main>
  );
}
