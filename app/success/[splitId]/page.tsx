"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { AppShell } from "../../components/app-shell";
import { ShareSplitLink } from "../../components/share-split-link";
import { formatAmount, type Split } from "../../utils/splits";
import { fetchSplitRecord } from "../../utils/splits-api";

export default function SuccessPage() {
  const params = useParams<{ splitId: string }>();
  const [split, setSplit] = useState<Split | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCurrent = true;

    async function loadSplit() {
      setIsLoading(true);
      const nextSplit = await fetchSplitRecord(params.splitId);
      if (!isCurrent) return;
      setSplit(nextSplit);
      setIsLoading(false);
    }

    void loadSplit();

    return () => {
      isCurrent = false;
    };
  }, [params.splitId]);

  if (isLoading) {
    return (
      <AppShell eyebrow="Success" title="Loading payment status">
        <section className="app-card p-6 text-sm text-[var(--muted)]">
          Fetching private payment status...
        </section>
      </AppShell>
    );
  }

  if (!split) {
    return (
      <AppShell eyebrow="Success" title="Split not found">
        <Link className="primary-action inline-flex" href="/create">
          Create Split
        </Link>
      </AppShell>
    );
  }

  return (
    <AppShell
      eyebrow="Private payment complete"
      title="Payment sent privately"
      subtitle="The payment status updated without exposing the amount publicly on-chain."
    >
      <section className="app-card mx-auto max-w-2xl p-5 text-center sm:p-7">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[var(--lime)] text-2xl font-semibold text-[var(--lime-ink)]">
          ✓
        </div>
        <h2 className="mt-5 text-3xl font-semibold">{split.title}</h2>
        <p className="mt-3 font-mono text-xl">
          {formatAmount(split.perPersonAmount)} {split.token}
        </p>
        <div className="mt-6 rounded-[22px] border border-[var(--line)] bg-white/[0.04] p-4 text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            Private transaction status
          </p>
          <p className="mt-2 text-sm font-semibold text-[var(--lime)]">
            Confirmed privately via Loyal private tx SDK
          </p>
        </div>
        <div className="mt-4 text-left">
          <ShareSplitLink splitId={split.id} title={split.title} />
        </div>
        <Link className="primary-action mt-6 inline-flex" href={`/split/${split.id}`}>
          Back to Split
        </Link>
      </section>
    </AppShell>
  );
}
