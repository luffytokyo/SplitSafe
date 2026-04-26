import Link from "next/link";

import { WalletConnectButton } from "./wallet-connect-button";

export function AppShell({
  children,
  eyebrow,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <main className="min-h-screen bg-[var(--bg)] px-4 py-5 text-[var(--ink)] sm:px-6 lg:px-8">
      <div className="mx-auto min-h-[calc(100vh-2.5rem)] w-full max-w-6xl rounded-[28px] border border-[var(--line)] bg-[var(--hero-panel)] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.35)] sm:p-7">
        <header className="flex flex-col gap-4 border-b border-[var(--line)] pb-5 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/"
            className="flex min-h-11 items-center gap-3 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lime)]"
          >
            <span className="brand-mark" aria-hidden="true">
              <span />
              <span />
            </span>
            <span className="text-lg font-semibold">SplitSafe</span>
          </Link>
          <div className="flex flex-wrap gap-2">
            <Link className="nav-pill" href="/create">
              Create
            </Link>
            <Link className="nav-pill" href="/dashboard">
              Dashboard
            </Link>
            <WalletConnectButton />
          </div>
        </header>

        <section className="py-8">
          {eyebrow ? (
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--lime)]">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--muted)] sm:text-base">
              {subtitle}
            </p>
          ) : null}
        </section>

        {children}
      </div>
    </main>
  );
}
