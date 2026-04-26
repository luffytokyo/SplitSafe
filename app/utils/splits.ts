export type SplitStatus = "active" | "completed";

export type Split = {
  id: string;
  title: string;
  creatorWallet: string;
  receiverWallet: string;
  totalAmount: number;
  perPersonAmount: number;
  totalPeople: number;
  paidWallets: string[];
  token: string;
  status: SplitStatus;
  createdAt: string;
};

export type PaySplitResult =
  | { ok: true; split: Split }
  | { ok: false; reason: "not_found" | "already_paid" | "split_full" };

const STORAGE_KEY = "splitsafe:splits";
export const SPLITS_CHANGED_EVENT = "splitsafe:splits-changed";

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

export function createSplitId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID().slice(0, 8);
  }

  return Math.random().toString(36).slice(2, 10);
}

export function getSplits(): Split[] {
  if (!canUseStorage()) return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Split[]) : [];
  } catch {
    return [];
  }
}

export function saveSplits(splits: Split[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(splits));
  window.dispatchEvent(new Event(SPLITS_CHANGED_EVENT));
}

export function getSplit(id: string) {
  return getSplits().find((split) => split.id === id) ?? null;
}

export function saveSplit(split: Split) {
  const splits = getSplits();
  const index = splits.findIndex((item) => item.id === split.id);

  if (index >= 0) {
    splits[index] = split;
  } else {
    splits.unshift(split);
  }

  saveSplits(splits);
}

export function markWalletPaid(splitId: string, walletAddress: string): PaySplitResult {
  const split = getSplit(splitId);
  if (!split) return { ok: false, reason: "not_found" };

  if (split.paidWallets.includes(walletAddress)) {
    return { ok: false, reason: "already_paid" };
  }

  if (split.paidWallets.length >= split.totalPeople) {
    return { ok: false, reason: "split_full" };
  }

  const paidWallets = [...split.paidWallets, walletAddress];

  const updated: Split = {
    ...split,
    paidWallets,
    status: paidWallets.length >= split.totalPeople ? "completed" : "active",
  };

  saveSplit(updated);
  return { ok: true, split: updated };
}

export function formatAmount(amount: number) {
  return amount.toLocaleString("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
  });
}
