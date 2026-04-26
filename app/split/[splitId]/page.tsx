"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { AppShell } from "../../components/app-shell";
import { ShareSplitLink } from "../../components/share-split-link";
import { WalletConnectButton } from "../../components/wallet-connect-button";
import { usePrivateSplitPayment } from "../../hooks/use-private-split-payment";
import { formatAmount, type Split } from "../../utils/splits";
import { fetchSplitRecord, paySplitRecord } from "../../utils/splits-api";
import { truncateAddress } from "../../utils/wallet";

export default function SplitPaymentPage() {
  const params = useParams<{ splitId: string }>();
  const router = useRouter();
  const wallet = useWallet();
  const [split, setSplit] = useState<Split | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const privatePayment = usePrivateSplitPayment();

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

  const walletAddress = wallet.publicKey?.toBase58() ?? "";
  const hasPaid = Boolean(walletAddress && split?.paidWallets.includes(walletAddress));
  const isFull = Boolean(split && split.paidWallets.length >= split.totalPeople);

  const handlePay = () => {
    if (!split || !walletAddress) {
      setError("Connect your wallet before paying.");
      return;
    }

    if (hasPaid) {
      setError("This wallet has already paid this split.");
      return;
    }

    if (isFull) {
      setError("This split is already fully paid.");
      return;
    }

    setError("");
    void privatePayment.payPrivately(split, async (paidWalletAddress) => {
      const result = await paySplitRecord(split.id, paidWalletAddress);

      if (result.ok) {
        setSplit(result.split);
        router.push(`/success/${split.id}`);
        return;
      }

      if (result.reason === "already_paid") {
        throw new Error("This wallet has already paid this split.");
      }

      if (result.reason === "split_full") {
        throw new Error("This split is already fully paid.");
      }

      throw new Error("Split not found.");
    });
  };

  if (isLoading) {
    return (
      <AppShell eyebrow="Loading split" title="Loading private split">
        <section className="app-card p-6 text-sm text-[var(--muted)]">
          Fetching split details...
        </section>
      </AppShell>
    );
  }

  if (!split) {
    return (
      <AppShell
        eyebrow="Split not found"
        title="This split link is missing"
        subtitle="Create a new split and share that link with your group."
      >
        <Link className="primary-action inline-flex" href="/create">
          Create Split
        </Link>
      </AppShell>
    );
  }

  const isReceiver = walletAddress === split.receiverWallet;

  return (
    <AppShell
      eyebrow="Pay split"
      title={split.title}
      subtitle="Anyone with this link can connect a wallet and pay the fixed share once. Payments are sent privately using Loyal’s private tx SDK."
    >
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="app-card p-5 sm:p-6">
          <div className="grid gap-3">
            <InfoRow label="Total amount" value={`${formatAmount(split.totalAmount)} ${split.token}`} />
            <InfoRow
              label="Your share"
              value={`${formatAmount(split.perPersonAmount)} ${split.token}`}
            />
            <InfoRow
              label="Paid count"
              value={`${split.paidWallets.length} / ${split.totalPeople}`}
            />
            <InfoRow
              label="Rule"
              value="One fixed-share payment per wallet"
            />
            <InfoRow label="Receiver wallet" value={truncateAddress(split.receiverWallet)} />
          </div>

          <div className="mt-6">
            <ShareSplitLink splitId={split.id} title={split.title} />
          </div>

          {isReceiver ? (
            <div className="mt-6 rounded-[22px] border border-[var(--line)] bg-white/[0.04] p-4">
              <p className="text-sm font-semibold text-[var(--lime)]">
                Receiver setup
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Prepare your Loyal private deposit once before sharing this split link.
              </p>
              <button
                className="secondary-action mt-4 w-full disabled:cursor-not-allowed disabled:opacity-60"
                disabled={privatePayment.isWorking}
                onClick={() => void privatePayment.prepareReceiver(split)}
                type="button"
              >
                {privatePayment.isWorking
                  ? privatePayment.statusLabel
                  : "Prepare private receiving deposit"}
              </button>
            </div>
          ) : null}

          <div className="mt-6 rounded-[22px] border border-[var(--line)] bg-white/[0.04] p-4">
            <p className="text-sm font-semibold text-[var(--lime)]">Privacy note</p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Split expenses without exposing everyone’s payments on-chain. Loyal shields each payer’s share,
              delegates it to PER, and sends the private transfer before paid status updates.
            </p>
          </div>
        </section>

        <section className="app-card p-5 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--lime)]">
            Payment
          </p>
          <h2 className="mt-3 text-3xl font-semibold">
            {formatAmount(split.perPersonAmount)} {split.token}
          </h2>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            Connect your wallet and pay the fixed share once. First {split.totalPeople} wallets complete the split.
          </p>

          <div className="mt-6 flex flex-col gap-3">
            {!walletAddress ? <WalletConnectButton className="w-full" /> : null}
            <button
              className="primary-action w-full disabled:cursor-not-allowed disabled:opacity-60"
              disabled={privatePayment.isWorking || !walletAddress || hasPaid || isFull}
              onClick={handlePay}
              type="button"
            >
              {privatePayment.isWorking
                ? privatePayment.statusLabel
                : hasPaid
                  ? "Already paid"
                  : isFull
                    ? "Split full"
                    : "Pay Privately"}
            </button>
          </div>

          {error ? <p className="mt-3 text-sm text-red-200">{error}</p> : null}
          {privatePayment.error ? (
            <p className="mt-3 text-sm text-red-200">{privatePayment.error}</p>
          ) : null}
          {privatePayment.signature ? (
            <p className="mt-3 break-all font-mono text-xs text-[var(--muted)]">
              Loyal tx: {privatePayment.signature}
            </p>
          ) : null}
        </section>
      </div>
    </AppShell>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-white/[0.04] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-2 break-all font-mono text-sm font-semibold">{value}</p>
    </div>
  );
}
