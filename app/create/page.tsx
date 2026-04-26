"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { AppShell } from "../components/app-shell";
import { WalletConnectButton } from "../components/wallet-connect-button";
import {
  createSplitId,
  formatAmount,
  type Split,
} from "../utils/splits";
import { createSplitRecord } from "../utils/splits-api";
import { truncateAddress } from "../utils/wallet";

export default function CreateSplitPage() {
  const router = useRouter();
  const wallet = useWallet();
  const [title, setTitle] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [totalPeople, setTotalPeople] = useState("");
  const [error, setError] = useState("");
  const token = "USDC";

  const amountNumber = Number(totalAmount);
  const peopleNumber = Number(totalPeople);
  const perPersonAmount = useMemo(() => {
    if (!amountNumber || !peopleNumber) return 0;
    return amountNumber / peopleNumber;
  }, [amountNumber, peopleNumber]);

  const connectedAddress = wallet.publicKey?.toBase58() ?? "";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!connectedAddress) {
      setError("Connect your wallet before creating a split.");
      return;
    }

    if (!title.trim() || !amountNumber || !peopleNumber || peopleNumber < 1) {
      setError("Add a title, total amount, and at least one person.");
      return;
    }

    const split: Split = {
      id: createSplitId(),
      title: title.trim(),
      creatorWallet: connectedAddress,
      receiverWallet: connectedAddress,
      totalAmount: amountNumber,
      perPersonAmount,
      totalPeople: peopleNumber,
      paidWallets: [],
      token,
      status: "active",
      createdAt: new Date().toISOString(),
    };

    try {
      const created = await createSplitRecord(split);
      router.push(`/split/${created.id}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Failed to create split.");
    }
  };

  return (
    <AppShell
      eyebrow="Create split"
      title="Create a private bill split"
      subtitle="Split expenses without exposing everyone’s payments on-chain."
    >
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <form onSubmit={handleSubmit} className="app-card space-y-5 p-5 sm:p-6">
          <Field label="Split title">
            <input
              className="form-input"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Goa Trip, Dinner, Rent..."
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Total amount">
              <input
                className="form-input"
                inputMode="decimal"
                min="0"
                type="number"
                value={totalAmount}
                onChange={(event) => setTotalAmount(event.target.value)}
                placeholder="250"
              />
            </Field>
            <Field label="Number of people">
              <input
                className="form-input"
                inputMode="numeric"
                min="1"
                type="number"
                value={totalPeople}
                onChange={(event) => setTotalPeople(event.target.value)}
                placeholder="5"
              />
            </Field>
          </div>

          <Field label="Token">
            <input className="form-input" value={token} readOnly />
          </Field>

          <div className="rounded-[20px] border border-[var(--line)] bg-white/[0.04] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              Receiver wallet
            </p>
            <p className="mt-2 font-mono text-sm text-[var(--ink)]">
              {connectedAddress
                ? truncateAddress(connectedAddress)
                : "Connect wallet to set receiver"}
            </p>
          </div>

          {error ? <p className="text-sm text-red-200">{error}</p> : null}

          <button className="primary-action w-full" type="submit">
            Create Split
          </button>
        </form>

        <aside className="app-card p-5 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--lime)]">
            Preview
          </p>
          <h2 className="mt-4 text-3xl font-semibold">{title || "Untitled Split"}</h2>
          <div className="mt-6 grid gap-3">
            <PreviewRow label="Total" value={`${formatAmount(amountNumber || 0)} ${token}`} />
            <PreviewRow label="People" value={`${peopleNumber || 0}`} />
            <PreviewRow
              label="Per-person share"
              value={`${formatAmount(perPersonAmount)} ${token}`}
            />
          </div>
          <div className="mt-6 rounded-[22px] bg-[var(--lime)] p-4 text-[var(--lime-ink)]">
            <p className="text-sm font-semibold">
              Anyone with the link can pay, but each wallet can pay only once.
            </p>
            <p className="mt-2 text-sm opacity-80">
              The first {peopleNumber || 0} wallets complete the split. Each payment is fixed at{" "}
              {formatAmount(perPersonAmount)} {token}.
            </p>
          </div>
          {!connectedAddress ? (
            <div className="mt-5">
              <WalletConnectButton className="w-full" />
            </div>
          ) : null}
        </aside>
      </div>
    </AppShell>
  );
}

function Field({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-[var(--muted)]">{label}</span>
      {children}
    </label>
  );
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-[var(--line)] bg-white/[0.04] px-4 py-3">
      <span className="text-sm text-[var(--muted)]">{label}</span>
      <span className="font-mono text-sm font-semibold">{value}</span>
    </div>
  );
}
