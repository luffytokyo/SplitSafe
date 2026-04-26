import postgres from "postgres";

import type { PaySplitResult, Split } from "../utils/splits";

const dbUrl = process.env.DB_URL;

if (!dbUrl) {
  throw new Error("DB_URL is required for SplitSafe database storage.");
}

const sql = postgres(dbUrl, { prepare: false });
let initialized: Promise<void> | null = null;

type SplitRow = {
  id: string;
  title: string;
  creator_wallet: string;
  receiver_wallet: string;
  total_amount: string;
  per_person_amount: string;
  total_people: number;
  paid_wallets: string[];
  token: string;
  status: Split["status"];
  created_at: string;
};

function toSplit(row: SplitRow): Split {
  return {
    id: row.id,
    title: row.title,
    creatorWallet: row.creator_wallet,
    receiverWallet: row.receiver_wallet,
    totalAmount: Number(row.total_amount),
    perPersonAmount: Number(row.per_person_amount),
    totalPeople: row.total_people,
    paidWallets: row.paid_wallets ?? [],
    token: row.token,
    status: row.status,
    createdAt: row.created_at,
  };
}

async function ensureSchema() {
  initialized ??= sql`
    create table if not exists splits (
      id text primary key,
      title text not null,
      creator_wallet text not null,
      receiver_wallet text not null,
      total_amount numeric not null,
      per_person_amount numeric not null,
      total_people integer not null,
      paid_wallets jsonb not null default '[]'::jsonb,
      token text not null default 'USDC',
      status text not null default 'active',
      created_at timestamptz not null default now()
    )
  `.then(() => undefined);

  return initialized;
}

export async function createSplit(split: Split) {
  await ensureSchema();

  const rows = await sql<SplitRow[]>`
    insert into splits (
      id,
      title,
      creator_wallet,
      receiver_wallet,
      total_amount,
      per_person_amount,
      total_people,
      paid_wallets,
      token,
      status,
      created_at
    )
    values (
      ${split.id},
      ${split.title},
      ${split.creatorWallet},
      ${split.receiverWallet},
      ${split.totalAmount},
      ${split.perPersonAmount},
      ${split.totalPeople},
      ${sql.json(split.paidWallets)},
      ${split.token},
      ${split.status},
      ${split.createdAt}
    )
    returning *
  `;

  return toSplit(rows[0]);
}

export async function getSplitById(splitId: string) {
  await ensureSchema();

  const rows = await sql<SplitRow[]>`
    select *
    from splits
    where id = ${splitId}
    limit 1
  `;

  return rows[0] ? toSplit(rows[0]) : null;
}

export async function getSplitsByCreator(creatorWallet: string) {
  await ensureSchema();

  const rows = await sql<SplitRow[]>`
    select *
    from splits
    where creator_wallet = ${creatorWallet}
    order by created_at desc
  `;

  return rows.map(toSplit);
}

export async function markSplitWalletPaid(
  splitId: string,
  walletAddress: string,
): Promise<PaySplitResult> {
  await ensureSchema();

  const split = await getSplitById(splitId);
  if (!split) return { ok: false, reason: "not_found" };

  if (split.paidWallets.includes(walletAddress)) {
    return { ok: false, reason: "already_paid" };
  }

  if (split.paidWallets.length >= split.totalPeople) {
    return { ok: false, reason: "split_full" };
  }

  const paidWallets = [...split.paidWallets, walletAddress];
  const status = paidWallets.length >= split.totalPeople ? "completed" : "active";

  const rows = await sql<SplitRow[]>`
    update splits
    set paid_wallets = ${sql.json(paidWallets)},
        status = ${status}
    where id = ${splitId}
    returning *
  `;

  return { ok: true, split: toSplit(rows[0]) };
}
