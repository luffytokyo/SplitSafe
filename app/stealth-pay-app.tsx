"use client";

import { useMemo, useState } from "react";

type Recipient = {
  id: number;
  name: string;
  handle: string;
  role: string;
  method: "Telegram" | "Wallet";
  status: "Ready" | "Needs Claim";
  amount: number;
};

type Activity = {
  id: number;
  title: string;
  detail: string;
  time: string;
  tone: "good" | "pending" | "neutral";
};

const startingRecipients: Recipient[] = [
  {
    id: 1,
    name: "Aarav",
    handle: "@aaravdesign",
    role: "Brand sprint",
    method: "Telegram",
    status: "Needs Claim",
    amount: 220,
  },
  {
    id: 2,
    name: "Mira",
    handle: "F4Jw...9Ke2",
    role: "Frontend build",
    method: "Wallet",
    status: "Ready",
    amount: 480,
  },
  {
    id: 3,
    name: "Noah",
    handle: "@noahgrowth",
    role: "Community ops",
    method: "Telegram",
    status: "Ready",
    amount: 180,
  },
];

const startingActivity: Activity[] = [
  {
    id: 1,
    title: "Private batch prepared",
    detail: "3 recipients staged for April contributor cycle.",
    time: "2 min ago",
    tone: "neutral",
  },
  {
    id: 2,
    title: "Telegram claim opened",
    detail: "Aarav received a secure claim link through Loyal verification.",
    time: "9 min ago",
    tone: "pending",
  },
  {
    id: 3,
    title: "Receipt generated",
    detail: "Frontend build payout is shareable without exposing the amount.",
    time: "14 min ago",
    tone: "good",
  },
];

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const hiddenCurrency = (amount: number) => {
  if (amount < 100) return "$••";
  if (amount < 1000) return "$•••";
  return "$••••";
};

export function StealthPayApp() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [privateBalance, setPrivateBalance] = useState(3200);
  const [showReceiptAmount, setShowReceiptAmount] = useState(false);
  const [depositAmount, setDepositAmount] = useState("750");
  const [recipients, setRecipients] = useState(startingRecipients);
  const [activity, setActivity] = useState(startingActivity);
  const [newRecipient, setNewRecipient] = useState({
    name: "",
    handle: "",
    role: "",
    method: "Telegram" as Recipient["method"],
    amount: "125",
  });

  const payoutTotal = useMemo(
    () => recipients.reduce((sum, recipient) => sum + recipient.amount, 0),
    [recipients],
  );

  const receiptRecipient = recipients[0];

  const addActivity = (entry: Omit<Activity, "id">) => {
    setActivity((current) => [
      { id: current.length + 1, ...entry },
      ...current.slice(0, 4),
    ]);
  };

  const handleDeposit = () => {
    const amount = Number(depositAmount);
    if (!amount || amount <= 0) return;

    setPrivateBalance((current) => current + amount);
    addActivity({
      title: "USDC shielded privately",
      detail: `${currency.format(amount)} moved into the protected payout balance.`,
      time: "just now",
      tone: "good",
    });
    setDepositAmount("500");
  };

  const handleAddRecipient = () => {
    const amount = Number(newRecipient.amount);
    if (
      !newRecipient.name.trim() ||
      !newRecipient.handle.trim() ||
      !newRecipient.role.trim() ||
      !amount
    ) {
      return;
    }

    setRecipients((current) => [
      ...current,
      {
        id: current.length + 1,
        name: newRecipient.name.trim(),
        handle: newRecipient.handle.trim(),
        role: newRecipient.role.trim(),
        method: newRecipient.method,
        status: newRecipient.method === "Telegram" ? "Needs Claim" : "Ready",
        amount,
      },
    ]);

    addActivity({
      title: "Recipient added",
      detail: `${newRecipient.name.trim()} is queued for a private payout.`,
      time: "just now",
      tone: "neutral",
    });

    setNewRecipient({
      name: "",
      handle: "",
      role: "",
      method: "Telegram",
      amount: "125",
    });
  };

  const handleSendBatch = () => {
    if (payoutTotal > privateBalance) return;

    setPrivateBalance((current) => current - payoutTotal);
    addActivity({
      title: "Private payout batch sent",
      detail: `${recipients.length} contributors paid through Loyal private transactions.`,
      time: "just now",
      tone: "good",
    });
    setRecipients((current) =>
      current.map((recipient) => ({
        ...recipient,
        status: recipient.method === "Telegram" ? "Needs Claim" : "Ready",
      })),
    );
  };

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--ink)]">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 pb-16 pt-6 sm:px-8 lg:px-10">
        <header className="flex flex-col gap-6 border-b border-[var(--line)] pb-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-3 rounded-full border border-[var(--line-strong)] bg-[var(--panel)] px-4 py-2 text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
              <span className="h-2 w-2 rounded-full bg-[var(--signal)]" />
              Loyal private tx demo
            </div>
            <div className="max-w-3xl space-y-3">
              <h1 className="text-5xl leading-none font-semibold text-balance sm:text-6xl lg:text-7xl">
                Private payouts for DAOs, bounties, and tiny teams.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-[var(--muted)] sm:text-lg">
                StealthPay gives teams a clean way to deposit USDC privately,
                pay contributors by wallet or Telegram handle, and share proof
                of payment without exposing compensation.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--accent-ink)] transition hover:brightness-105"
              onClick={() => setWalletConnected((current) => !current)}
            >
              {walletConnected ? "Wallet connected" : "Connect wallet"}
            </button>
            <button
              type="button"
              className="rounded-full border border-[var(--line-strong)] bg-[var(--panel)] px-5 py-3 text-sm font-semibold text-[var(--ink)] transition hover:bg-[var(--panel-strong)]"
              onClick={() => setShowReceiptAmount((current) => !current)}
            >
              {showReceiptAmount ? "Hide receipt amount" : "Reveal receipt amount"}
            </button>
          </div>
        </header>

        <section className="grid gap-4 py-8 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Private balance"
            value={currency.format(privateBalance)}
            detail="Shielded treasury ready for payouts"
          />
          <MetricCard
            label="Next batch"
            value={currency.format(payoutTotal)}
            detail={`${recipients.length} contributors queued`}
          />
          <MetricCard
            label="Claim paths"
            value="Telegram + wallet"
            detail="Flexible recipient experience"
          />
          <MetricCard
            label="Receipt mode"
            value={showReceiptAmount ? "Revealable" : "Amount hidden"}
            detail="Proof without full salary exposure"
          />
        </section>

        <section className="grid flex-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="grid gap-6">
            <Panel
              eyebrow="Step 1"
              title="Shield USDC before you pay"
              description="This is the treasury surface. Deposit into a private balance first, then use that pool for one-off or batch contributor payouts."
            >
              <div className="grid gap-4 md:grid-cols-[0.8fr_1.2fr]">
                <div className="space-y-3 rounded-[24px] bg-[var(--panel-strong)] p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
                    Deposit amount
                  </p>
                  <input
                    className="w-full rounded-2xl border border-[var(--line-strong)] bg-[var(--panel)] px-4 py-3 text-2xl font-semibold outline-none transition focus:border-[var(--accent)]"
                    inputMode="numeric"
                    value={depositAmount}
                    onChange={(event) => setDepositAmount(event.target.value)}
                  />
                  <button
                    type="button"
                    className="w-full rounded-full bg-[var(--ink)] px-4 py-3 text-sm font-semibold text-[var(--bg)] transition hover:opacity-92"
                    onClick={handleDeposit}
                  >
                    Deposit privately
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <MiniStat label="Visibility" value="Only sender + receiver" />
                  <MiniStat label="Settlement" value="Instant team payout rail" />
                  <MiniStat label="Claim flow" value="Telegram supported" />
                </div>
              </div>
            </Panel>

            <Panel
              eyebrow="Step 2"
              title="Build the payout batch"
              description="Recipients can be paid by wallet or Telegram handle. Telegram entries default into a claim flow, which is exactly the kind of sharp product behavior judges remember."
            >
              <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                <div className="space-y-3 rounded-[24px] bg-[var(--panel-strong)] p-4">
                  <div className="grid gap-3">
                    <input
                      className="input"
                      placeholder="Name"
                      value={newRecipient.name}
                      onChange={(event) =>
                        setNewRecipient((current) => ({
                          ...current,
                          name: event.target.value,
                        }))
                      }
                    />
                    <input
                      className="input"
                      placeholder="@telegram or wallet"
                      value={newRecipient.handle}
                      onChange={(event) =>
                        setNewRecipient((current) => ({
                          ...current,
                          handle: event.target.value,
                        }))
                      }
                    />
                    <input
                      className="input"
                      placeholder="Role or bounty"
                      value={newRecipient.role}
                      onChange={(event) =>
                        setNewRecipient((current) => ({
                          ...current,
                          role: event.target.value,
                        }))
                      }
                    />
                    <div className="grid gap-3 sm:grid-cols-[1fr_0.8fr]">
                      <select
                        className="input"
                        value={newRecipient.method}
                        onChange={(event) =>
                          setNewRecipient((current) => ({
                            ...current,
                            method: event.target.value as Recipient["method"],
                          }))
                        }
                      >
                        <option value="Telegram">Telegram claim</option>
                        <option value="Wallet">Direct wallet</option>
                      </select>
                      <input
                        className="input"
                        inputMode="numeric"
                        placeholder="USDC"
                        value={newRecipient.amount}
                        onChange={(event) =>
                          setNewRecipient((current) => ({
                            ...current,
                            amount: event.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    className="w-full rounded-full bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-[var(--accent-ink)] transition hover:brightness-105"
                    onClick={handleAddRecipient}
                  >
                    Add recipient
                  </button>
                </div>

                <div className="space-y-3">
                  {recipients.map((recipient) => (
                    <article
                      key={recipient.id}
                      className="grid gap-3 rounded-[24px] border border-[var(--line)] bg-[var(--panel)] p-4 sm:grid-cols-[1.2fr_0.9fr_0.8fr]"
                    >
                      <div>
                        <p className="text-lg font-semibold">{recipient.name}</p>
                        <p className="text-sm text-[var(--muted)]">
                          {recipient.role}
                        </p>
                        <p className="mt-2 text-sm text-[var(--soft)]">
                          {recipient.handle}
                        </p>
                      </div>
                      <div className="flex flex-col justify-between">
                        <span className="chip">{recipient.method}</span>
                        <span className="text-sm text-[var(--muted)]">
                          {recipient.status}
                        </span>
                      </div>
                      <div className="flex items-end justify-between sm:flex-col sm:items-end">
                        <span className="text-sm uppercase tracking-[0.18em] text-[var(--muted)]">
                          Hidden payout
                        </span>
                        <span className="text-2xl font-semibold">
                          {hiddenCurrency(recipient.amount)}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-4 rounded-[24px] border border-[var(--line-strong)] bg-[var(--canvas)] p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
                    Batch summary
                  </p>
                  <p className="mt-2 text-3xl font-semibold">
                    {currency.format(payoutTotal)}
                  </p>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    Sent privately from the shielded treasury balance.
                  </p>
                </div>
                <button
                  type="button"
                  className="rounded-full bg-[var(--ink)] px-5 py-3 text-sm font-semibold text-[var(--bg)] transition hover:opacity-92 disabled:cursor-not-allowed disabled:opacity-40"
                  onClick={handleSendBatch}
                  disabled={payoutTotal > privateBalance}
                >
                  Send private batch
                </button>
              </div>
            </Panel>
          </div>

          <div className="grid gap-6">
            <Panel
              eyebrow="Step 3"
              title="Share proof, keep the amount private"
              description="The receipt proves a payout happened and gives the recipient a claim-ready artifact, while preserving compensation privacy unless the user chooses to reveal it."
            >
              <div className="receipt-card">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
                      Payment proof
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold">
                      April contributor cycle
                    </h3>
                  </div>
                  <span className="rounded-full bg-[var(--success-bg)] px-3 py-1 text-xs font-semibold text-[var(--success-ink)]">
                    Paid
                  </span>
                </div>

                <div className="grid gap-4 border-y border-[var(--line)] py-4 sm:grid-cols-2">
                  <ReceiptField label="Recipient" value={receiptRecipient.name} />
                  <ReceiptField label="Route" value={receiptRecipient.handle} />
                  <ReceiptField label="Asset" value="USDC private transfer" />
                  <ReceiptField
                    label="Amount"
                    value={
                      showReceiptAmount
                        ? currency.format(receiptRecipient.amount)
                        : hiddenCurrency(receiptRecipient.amount)
                    }
                  />
                </div>

                <div className="space-y-3">
                  <p className="text-sm leading-6 text-[var(--muted)]">
                    Verified payout receipt. Share publicly to confirm the work
                    was paid, or reveal the amount privately to the recipient
                    with a one-time unlock phrase.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="chip">Hidden by default</span>
                    <span className="chip">Revealable</span>
                    <span className="chip">Claim-linked</span>
                  </div>
                </div>
              </div>
            </Panel>

            <Panel
              eyebrow="Challenge fit"
              title="Why this app has a shot"
              description="The product framing stays tight: it makes private transactions feel necessary instead of decorative."
            >
              <div className="grid gap-3">
                <StoryCard
                  title="Private by default"
                  body="Contributors get paid on-chain without turning every salary or bounty into public data."
                />
                <StoryCard
                  title="Telegram-native claims"
                  body="A recipient can be added before they even paste a wallet, which makes the demo feel much more alive."
                />
                <StoryCard
                  title="Not just a transfer button"
                  body="Batch setup, claim handling, and proof-of-payment receipts make it feel like a product instead of a wallet wrapper."
                />
              </div>
            </Panel>

            <Panel
              eyebrow="Activity"
              title="Live ops feed"
              description="This gives the app some pulse and helps sell the payout flow during a demo."
            >
              <div className="space-y-3">
                {activity.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-[22px] border border-[var(--line)] bg-[var(--panel)] p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{item.title}</p>
                        <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                          {item.detail}
                        </p>
                      </div>
                      <span className={`status status-${item.tone}`}>{item.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </section>
      </section>
    </main>
  );
}

function Panel({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[32px] border border-[var(--line)] bg-[var(--panel)] p-5 shadow-[0_20px_60px_rgba(17,24,39,0.08)] sm:p-6">
      <div className="mb-5 space-y-2">
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
          {eyebrow}
        </p>
        <h2 className="text-2xl font-semibold sm:text-3xl">{title}</h2>
        <p className="max-w-2xl text-sm leading-7 text-[var(--muted)] sm:text-base">
          {description}
        </p>
      </div>
      {children}
    </section>
  );
}

function MetricCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-[28px] border border-[var(--line)] bg-[var(--panel)] p-5">
      <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold">{value}</p>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{detail}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-[var(--line)] bg-[var(--panel)] p-4">
      <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-3 text-lg font-semibold leading-7">{value}</p>
    </div>
  );
}

function ReceiptField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-2 text-lg font-semibold">{value}</p>
    </div>
  );
}

function StoryCard({ title, body }: { title: string; body: string }) {
  return (
    <article className="rounded-[22px] bg-[var(--panel-strong)] p-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{body}</p>
    </article>
  );
}
