export const NAV_ITEMS = ["Create", "Share", "Pay", "Status"] as const;

export const HERO_TRUST_POINTS = [
  { label: "Fixed share", value: "No awkward math" },
  { label: "One wallet, one pay", value: "No duplicate settles" },
  { label: "Private status", value: "Amounts stay hidden" },
] as const;

export const SPLIT_MEMBERS = [
  { name: "Priyansh", state: "Paid" },
  { name: "Rahul", state: "Paid" },
  { name: "Anika", state: "Pending" },
  { name: "Mira", state: "Pending" },
] as const;

export const SPLIT_FIELDS = [
  { label: "Split link", value: "/split/abc123" },
  { label: "Your share", value: "62.50 USDC" },
] as const;

export const SPLIT_STATS = [
  { label: "Total", value: "250 USDC" },
  { label: "Remaining", value: "2 friends" },
] as const;
