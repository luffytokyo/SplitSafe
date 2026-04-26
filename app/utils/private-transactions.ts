import {
  ER_VALIDATOR_DEVNET,
  LoyalPrivateTransactionsClient,
  findDepositPda,
  type WalletLike,
} from "@loyal-labs/private-transactions";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { PublicKey, type Transaction, type VersionedTransaction } from "@solana/web3.js";

import {
  BASE_RPC,
  LOYAL_EPHEMERAL_RPC,
  LOYAL_EPHEMERAL_WS,
  LOYAL_TOKEN_DECIMALS,
  LOYAL_TOKEN_MINT,
} from "../constants";

type SignableTransaction = Transaction | VersionedTransaction;

export type BrowserWalletSigner = WalletLike & {
  signMessage?: (message: Uint8Array) => Promise<Uint8Array>;
};

export type PrivateTransactionStep =
  | "idle"
  | "creating-client"
  | "checking-deposit"
  | "initializing-deposit"
  | "shielding-balance"
  | "creating-permission"
  | "delegating-deposit"
  | "transferring"
  | "confirmed";

export type PrivateTransferResult = {
  signature: string;
  amountBaseUnits: bigint;
};

export function getLoyalTokenMint() {
  return new PublicKey(LOYAL_TOKEN_MINT);
}

export function toTokenBaseUnits(amount: number, decimals = LOYAL_TOKEN_DECIMALS) {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Payment amount must be greater than zero.");
  }

  const [whole, fraction = ""] = amount.toFixed(decimals).split(".");
  return BigInt(`${whole}${fraction.padEnd(decimals, "0")}`);
}

export async function getLoyalClient(signer: BrowserWalletSigner) {
  return LoyalPrivateTransactionsClient.fromConfig({
    signer,
    baseRpcEndpoint: BASE_RPC,
    ephemeralRpcEndpoint: LOYAL_EPHEMERAL_RPC,
    ephemeralWsEndpoint: LOYAL_EPHEMERAL_WS,
    commitment: "confirmed",
  });
}

export async function isPrivateDepositDelegated(
  client: LoyalPrivateTransactionsClient,
  user: PublicKey,
  tokenMint = getLoyalTokenMint(),
) {
  const [depositPda] = findDepositPda(user, tokenMint);
  const status = await client.getAccountDelegationStatus(depositPda);
  return Boolean(status.result?.isDelegated);
}

export async function preparePrivateDeposit({
  client,
  onStep,
  tokenMint = getLoyalTokenMint(),
  user,
}: {
  client: LoyalPrivateTransactionsClient;
  onStep?: (step: PrivateTransactionStep) => void;
  tokenMint?: PublicKey;
  user: PublicKey;
}) {
  onStep?.("checking-deposit");
  if (await isPrivateDepositDelegated(client, user, tokenMint)) return;

  onStep?.("initializing-deposit");
  await client.initializeDeposit({ payer: user, tokenMint, user });

  onStep?.("creating-permission");
  await client.createPermission({ payer: user, tokenMint, user });

  onStep?.("delegating-deposit");
  await client.delegateDeposit({
    payer: user,
    tokenMint,
    user,
    validator: ER_VALIDATOR_DEVNET,
  });
}

export async function payWithPrivateTransaction({
  amount,
  client,
  destinationUser,
  onStep,
  tokenMint = getLoyalTokenMint(),
  user,
}: {
  amount: number;
  client: LoyalPrivateTransactionsClient;
  destinationUser: PublicKey;
  onStep?: (step: PrivateTransactionStep) => void;
  tokenMint?: PublicKey;
  user: PublicKey;
}): Promise<PrivateTransferResult> {
  const amountBaseUnits = toTokenBaseUnits(amount);
  const userTokenAccount = await getAssociatedTokenAddress(tokenMint, user);

  onStep?.("checking-deposit");
  const payerIsDelegated = await isPrivateDepositDelegated(client, user, tokenMint);

  if (payerIsDelegated) {
    const deposit = await client.getEphemeralDeposit(user, tokenMint);
    if (!deposit || deposit.amount < amountBaseUnits) {
      throw new Error(
        "Your private deposit is already delegated, but it does not have enough shielded balance for this split.",
      );
    }
  } else {
    onStep?.("initializing-deposit");
    await client.initializeDeposit({ payer: user, tokenMint, user });

    onStep?.("shielding-balance");
    await client.modifyBalance({
      amount: amountBaseUnits,
      increase: true,
      payer: user,
      tokenMint,
      user,
      userTokenAccount,
    });

    onStep?.("creating-permission");
    await client.createPermission({ payer: user, tokenMint, user });

    onStep?.("delegating-deposit");
    await client.delegateDeposit({
      payer: user,
      tokenMint,
      user,
      validator: ER_VALIDATOR_DEVNET,
    });
  }

  if (!(await isPrivateDepositDelegated(client, destinationUser, tokenMint))) {
    throw new Error("The receiver needs to prepare their private deposit before this split can accept payments.");
  }

  onStep?.("transferring");
  const signature = await client.transferDeposit({
    amount: amountBaseUnits,
    destinationUser,
    payer: user,
    sessionToken: null,
    tokenMint,
    user,
  });

  return { amountBaseUnits, signature };
}

export function createWalletSigner({
  publicKey,
  signAllTransactions,
  signMessage,
  signTransaction,
}: {
  publicKey: PublicKey | null;
  signAllTransactions?: <T extends SignableTransaction>(transactions: T[]) => Promise<T[]>;
  signMessage?: (message: Uint8Array) => Promise<Uint8Array>;
  signTransaction?: <T extends SignableTransaction>(transaction: T) => Promise<T>;
}): BrowserWalletSigner {
  if (!publicKey || !signTransaction) {
    throw new Error("Connect a wallet that can sign transactions.");
  }

  if (!signMessage) {
    throw new Error("This wallet cannot sign messages, which Loyal PER auth requires.");
  }

  return {
    publicKey,
    signAllTransactions:
      signAllTransactions ??
      ((transactions) => Promise.all(transactions.map((transaction) => signTransaction(transaction)))),
    signMessage,
    signTransaction,
  };
}
