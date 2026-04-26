"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useCallback, useMemo, useState } from "react";

import type { Split } from "../utils/splits";
import {
  createWalletSigner,
  getLoyalClient,
  payWithPrivateTransaction,
  preparePrivateDeposit,
  type PrivateTransactionStep,
} from "../utils/private-transactions";

type PrivatePaymentState = {
  error: string;
  isWorking: boolean;
  signature: string;
  step: PrivateTransactionStep;
};

const STEP_LABELS: Record<PrivateTransactionStep, string> = {
  idle: "Ready",
  "creating-client": "Connecting to Loyal PER",
  "checking-deposit": "Checking private deposit",
  "initializing-deposit": "Creating private deposit",
  "shielding-balance": "Shielding your share",
  "creating-permission": "Creating PER permission",
  "delegating-deposit": "Delegating deposit to PER",
  transferring: "Sending private transfer",
  confirmed: "Private transfer confirmed",
};

export function usePrivateSplitPayment() {
  const wallet = useWallet();
  const [state, setState] = useState<PrivatePaymentState>({
    error: "",
    isWorking: false,
    signature: "",
    step: "idle",
  });

  const statusLabel = useMemo(() => STEP_LABELS[state.step], [state.step]);

  const setStep = useCallback((step: PrivateTransactionStep) => {
    setState((current) => ({ ...current, step }));
  }, []);

  const getClient = useCallback(async () => {
    setStep("creating-client");
    const signer = createWalletSigner(wallet);
    return getLoyalClient(signer);
  }, [setStep, wallet]);

  const prepareReceiver = useCallback(
    async (split: Split) => {
      setState({ error: "", isWorking: true, signature: "", step: "creating-client" });

      try {
        if (!wallet.publicKey || wallet.publicKey.toBase58() !== split.receiverWallet) {
          throw new Error("Connect the receiver wallet to prepare this split for private payments.");
        }

        const client = await getClient();
        await preparePrivateDeposit({
          client,
          onStep: setStep,
          user: wallet.publicKey,
        });

        setState({ error: "", isWorking: false, signature: "", step: "confirmed" });
      } catch (caught) {
        setState({
          error: caught instanceof Error ? caught.message : "Failed to prepare private deposit.",
          isWorking: false,
          signature: "",
          step: "idle",
        });
      }
    },
    [getClient, setStep, wallet.publicKey],
  );

  const payPrivately = useCallback(
    async (split: Split, onPaid: (walletAddress: string) => Promise<void>) => {
      setState({ error: "", isWorking: true, signature: "", step: "creating-client" });

      try {
        if (!wallet.publicKey) {
          throw new Error("Connect your wallet before paying.");
        }

        const client = await getClient();
        const result = await payWithPrivateTransaction({
          amount: split.perPersonAmount,
          client,
          destinationUser: new PublicKey(split.receiverWallet),
          onStep: setStep,
          user: wallet.publicKey,
        });

        await onPaid(wallet.publicKey.toBase58());

        setState({
          error: "",
          isWorking: false,
          signature: result.signature,
          step: "confirmed",
        });
      } catch (caught) {
        setState({
          error: caught instanceof Error ? caught.message : "Private payment failed.",
          isWorking: false,
          signature: "",
          step: "idle",
        });
      }
    },
    [getClient, setStep, wallet.publicKey],
  );

  return {
    ...state,
    payPrivately,
    prepareReceiver,
    statusLabel,
  };
}
