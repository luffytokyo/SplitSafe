"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import Link from "next/link";

import {
  HERO_TRUST_POINTS,
  NAV_ITEMS,
  SPLIT_FIELDS,
  SPLIT_MEMBERS,
  SPLIT_STATS,
} from "../constants/split-safe";
import { truncateAddress } from "../utils/wallet";

export function SplitSafeLanding() {
  const { connected, connecting, disconnect, publicKey } = useWallet();
  const { setVisible } = useWalletModal();

  const handleWalletButton = () => {
    if (connected) {
      void disconnect();
      return;
    }

    setVisible(true);
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[var(--bg)] text-[var(--ink)]">
      {/* Motion storyboard: 0ms shell/grid -> 80ms header -> 160ms copy -> 260ms actions -> 430ms preview/details. */}
      <section className="hero-shell relative min-h-screen px-3 py-3 sm:px-5 sm:py-4">
        <div className="site-shell-enter mx-auto flex h-[calc(100vh-1.5rem)] min-h-[640px] w-full max-w-[1440px] flex-col overflow-hidden rounded-[28px] border border-[var(--line)] bg-[var(--hero-panel)] shadow-[0_30px_90px_rgba(0,0,0,0.35)] sm:h-[calc(100vh-2rem)] lg:min-h-[680px]">
          <SplitSafeHeader
            connectedLabel={
              publicKey ? truncateAddress(publicKey.toBase58()) : "Wallet connected"
            }
            isConnected={connected}
            isConnecting={connecting}
            onConnectWallet={handleWalletButton}
          />

          <div className="relative z-10 grid flex-1 items-center gap-7 px-5 pb-7 pt-4 sm:px-8 md:gap-10 lg:grid-cols-[0.94fr_0.86fr] lg:px-12 lg:pb-8 lg:pt-2 xl:px-16">
            <HeroCopy />
            <SplitPreview />
          </div>
        </div>
      </section>
    </main>
  );
}

function SplitSafeHeader({
  connectedLabel,
  isConnected,
  isConnecting,
  onConnectWallet,
}: {
  connectedLabel: string;
  isConnected: boolean;
  isConnecting: boolean;
  onConnectWallet: () => void;
}) {
  return (
    <header className="motion-rise motion-delay-1 relative z-10 flex items-start justify-between gap-4 px-5 py-5 sm:px-8 lg:px-12 xl:px-16">
      <Link
        href="/"
        className="flex min-h-11 items-center gap-3 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lime)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]"
        aria-label="SplitSafe home"
      >
        <span className="brand-mark" aria-hidden="true">
          <span />
          <span />
        </span>
        <span className="text-lg font-semibold tracking-[-0.02em] sm:text-xl">
          SplitSafe
        </span>
      </Link>

      <nav
        className="hidden items-center rounded-full border border-[var(--line)] bg-white/[0.045] p-1 text-sm text-[var(--muted)] backdrop-blur-xl lg:flex"
        aria-label="Primary"
      >
        <Link
          href="/create"
          className="rounded-full px-5 py-3 transition hover:bg-white/[0.08] hover:text-[var(--ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lime)]"
        >
          Create
        </Link>
        <Link
          href="/dashboard"
          className="rounded-full px-5 py-3 transition hover:bg-white/[0.08] hover:text-[var(--ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lime)]"
        >
          Dashboard
        </Link>
        {NAV_ITEMS.slice(2).map((item) => (
          <a
            key={item}
            href={`#${item.toLowerCase()}`}
            className="rounded-full px-5 py-3 transition hover:bg-white/[0.08] hover:text-[var(--ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lime)]"
          >
            {item}
          </a>
        ))}
      </nav>

      <div className="flex flex-col items-end gap-2">
        <button
          type="button"
          onClick={onConnectWallet}
          aria-busy={isConnecting}
          className="interactive-lift min-h-11 rounded-full bg-[var(--lime)] px-5 py-3 text-sm font-semibold text-[var(--lime-ink)] transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] disabled:cursor-wait disabled:opacity-80 sm:px-6"
          disabled={isConnecting}
        >
          {isConnecting
            ? "Connecting..."
            : isConnected
              ? connectedLabel
              : "Connect wallet"}
        </button>
      </div>
    </header>
  );
}

function HeroCopy() {
  return (
    <div className="max-w-3xl">
      <div className="motion-rise motion-delay-2 mb-6 inline-flex items-center gap-3 rounded-full border border-[var(--line)] bg-white/[0.05] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--muted)] backdrop-blur-xl">
        <span className="h-2 w-2 rounded-full bg-[var(--lime)] shadow-[0_0_22px_var(--lime)]" />
        Loyal private tx SDK
      </div>

      <h1 className="motion-rise motion-delay-3 max-w-4xl text-[clamp(3rem,6.2vw,5.8rem)] font-extrabold leading-[0.94] tracking-[-0.035em] text-balance">
        Split bills without public drama.
      </h1>

      <p className="motion-rise motion-delay-4 mt-5 max-w-xl text-sm leading-7 text-white/70 sm:text-base">
        Share a bill, collect private USDC payments, and show only who settled.
        Amounts stay hidden from public explorers and awkward group chats.
      </p>

      <div className="motion-rise motion-delay-5 mt-7 flex flex-col gap-3 sm:flex-row text-black/70">
        <a
          href="/create"
          className="interactive-lift inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--lime)] px-6 py-3 text-sm font-semibold text-black transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]"
        >
          Create private split
        </a>
        <a
          href="/dashboard"
          className="interactive-lift inline-flex min-h-12 items-center justify-center rounded-full border border-black/15 bg-white/15 px-6 py-3 text-sm font-medium text-black backdrop-blur-xl transition hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lime)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]"
        >
          View dashboard
        </a>
      </div>

      <div className="motion-rise motion-delay-6 mt-8 grid max-w-xl gap-2.5 sm:grid-cols-3">
        {HERO_TRUST_POINTS.map((point) => (
          <TrustPoint key={point.label} label={point.label} value={point.value} />
        ))}
      </div>
    </div>
  );
}

function SplitPreview() {
  return (
    <aside className="motion-rise motion-delay-6 relative mx-auto w-full max-w-[520px] lg:mr-0" aria-label="SplitSafe payment preview">
      <div className="split-orbit" aria-hidden="true" />

      <div id="create" className="preview-float glass-panel relative z-10 overflow-hidden p-4 sm:p-5">
        <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[var(--lime)]/20 blur-3xl" />

        <div className="preview-stage preview-delay-1 relative flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
              Private split
            </p>
            <h2 className="mt-1 text-3xl font-semibold tracking-[-0.03em]">
              Goa Trip
            </h2>
          </div>
          <span className="rounded-full bg-[var(--lime)] px-3 py-1.5 text-xs font-semibold text-[var(--lime-ink)]">
            Live
          </span>
        </div>

        <div className="preview-stage preview-delay-2 relative mt-5 grid gap-2.5 sm:grid-cols-2">
          {SPLIT_FIELDS.map((field) => (
            <PrivateField key={field.label} label={field.label} value={field.value} />
          ))}
        </div>

        <div className="preview-stage preview-delay-3 relative mt-3 grid grid-cols-2 gap-2.5">
          {SPLIT_STATS.map((stat) => (
            <CompactStat key={stat.label} label={stat.label} value={stat.value} />
          ))}
        </div>

        <div className="preview-stage preview-delay-4 relative mt-4 rounded-[22px] border border-white/12 bg-[var(--frost)] p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                Next step
              </p>
              <p className="mt-1 text-xl font-semibold tracking-[-0.02em]">
                Pay privately
              </p>
            </div>
            <button
              type="button"
              className="interactive-lift min-h-11 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-[var(--lime)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lime)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]"
            >
              Shield
            </button>
          </div>
        </div>

        <div id="status" className="preview-stage preview-delay-5 relative mt-4">
          <div className="mb-2.5 flex items-center justify-between">
            <p className="text-sm font-semibold">Split status</p>
            <p className="font-mono text-sm text-[var(--muted)]">Paid 2 / 4</p>
          </div>

          <div className="space-y-2">
            {SPLIT_MEMBERS.map((member) => (
              <StatusRow key={member.name} name={member.name} state={member.state} />
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

function TrustPoint({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white/12 p-3.5 text-black backdrop-blur-xl">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-black/45">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold leading-5 text-black">{value}</p>
    </div>
  );
}

function PrivateField({ label, value }: { label: string; value: string }) {
  return (
    <div className="interactive-card rounded-[18px] border border-white/10 bg-white/[0.06] p-3.5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-2 font-mono text-sm font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function CompactStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="interactive-card rounded-2xl bg-black/20 px-3.5 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--soft)]">
        {label}
      </p>
      <p className="mt-1 font-mono text-sm font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function StatusRow({ name, state }: { name: string; state: string }) {
  const isPaid = state === "Paid";

  return (
    <div className="interactive-card flex min-h-10 items-center justify-between rounded-2xl border border-white/10 bg-white/[0.055] px-3">
      <div className="flex items-center gap-2.5">
        <span
          className="grid h-7 w-7 place-items-center rounded-full bg-white/10 text-[11px] font-semibold"
          aria-hidden="true"
        >
          {name.slice(0, 1)}
        </span>
        <span className="text-sm font-medium">{name}</span>
      </div>
      <span
        className={
          isPaid
            ? "text-xs font-semibold text-[var(--lime)]"
            : "text-xs font-medium text-[var(--muted)]"
        }
      >
        {state}
      </span>
    </div>
  );
}
