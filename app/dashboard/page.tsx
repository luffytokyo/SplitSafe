"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { AppShell } from "../components/app-shell";
import { WalletConnectButton } from "../components/wallet-connect-button";
import { formatAmount, type Split } from "../utils/splits";
import { fetchCreatorSplits } from "../utils/splits-api";

export default function DashboardPage() {
  const wallet = useWallet();
  const [splits, setSplits] = useState<Split[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState("");

  const walletAddress = wallet.publicKey?.toBase58() ?? "";

  useEffect(() => {
    let isCurrent = true;

    async function loadSplits() {
      if (!walletAddress) {
        setSplits([]);
        return;
      }

      setIsLoading(true);
      const nextSplits = await fetchCreatorSplits(walletAddress);
      if (!isCurrent) return;
      setSplits(nextSplits);
      setIsLoading(false);
    }

    void loadSplits();

    return () => {
      isCurrent = false;
    };
  }, [walletAddress]);

  const handleCopy = async (splitId: string) => {
    const url = `${window.location.origin}/split/${splitId}`;
    await navigator.clipboard.writeText(url);
    setCopiedId(splitId);
    window.setTimeout(() => setCopiedId(""), 1400);
  };

  return (
    <AppShell
      eyebrow="Dashboard"
      title="Your private splits"
      subtitle="Track paid counts, copy share links, and keep group payments private."
    >
      {!walletAddress ? (
        <section className="app-card p-6 text-center">
          <h2 className="text-2xl font-semibold">Connect wallet to view splits</h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--muted)]">
            The dashboard filters splits by the connected creator wallet.
          </p>
          <div className="mt-5">
            <WalletConnectButton />
          </div>
        </section>
      ) : isLoading ? (
        <section className="app-card p-6 text-center text-sm text-[var(--muted)]">
          Loading your splits...
        </section>
      ) : splits.length === 0 ? (
        <section className="app-card p-6 text-center">
          <h2 className="text-2xl font-semibold">No splits yet</h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--muted)]">
            Create your first private split and share the link with friends.
          </p>
          <Link className="primary-action mt-5 inline-flex" href="/create">
            Create Split
          </Link>
        </section>
      ) : (
        <section className="grid gap-4 md:grid-cols-2">
          {splits.map((split) => (
            <article key={split.id} className="app-card p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                    {split.token}
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">{split.title}</h2>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    split.status === "completed"
                      ? "bg-[var(--lime)] text-[var(--lime-ink)]"
                      : "bg-white/10 text-[var(--muted)]"
                  }`}
                >
                  {split.status}
                </span>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <Metric label="Total" value={`${formatAmount(split.totalAmount)} ${split.token}`} />
                <Metric
                  label="Per person"
                  value={`${formatAmount(split.perPersonAmount)} ${split.token}`}
                />
                <Metric
                  label="Paid"
                  value={`${split.paidWallets.length} / ${split.totalPeople}`}
                />
                <Metric label="Created" value={new Date(split.createdAt).toLocaleDateString()} />
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Link className="secondary-action flex-1" href={`/split/${split.id}`}>
                  Open Split
                </Link>
                <button
                  className="primary-action flex-1"
                  onClick={() => void handleCopy(split.id)}
                  type="button"
                >
                  {copiedId === split.id ? "Copied" : "Copy split link"}
                </button>
              </div>
            </article>
          ))}
        </section>
      )}
    </AppShell>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-white/[0.04] p-3">
      <p className="text-xs text-[var(--muted)]">{label}</p>
      <p className="mt-1 font-mono text-sm font-semibold">{value}</p>
    </div>
  );
}
