export const BASE_RPC =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? "https://api.devnet.solana.com";

export const LOYAL_EPHEMERAL_RPC =
  process.env.NEXT_PUBLIC_LOYAL_EPHEMERAL_RPC ?? "https://tee.magicblock.app";

export const LOYAL_EPHEMERAL_WS =
  process.env.NEXT_PUBLIC_LOYAL_EPHEMERAL_WS ?? "wss://tee.magicblock.app";

export const LOYAL_TOKEN_MINT =
  process.env.NEXT_PUBLIC_LOYAL_TOKEN_MINT ??
  "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";

export const LOYAL_TOKEN_DECIMALS = Number(
  process.env.NEXT_PUBLIC_LOYAL_TOKEN_DECIMALS ?? "6",
);
