"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

import { truncateAddress } from "../utils/wallet";

export function WalletConnectButton({ className = "" }: { className?: string }) {
  const { connected, connecting, disconnect, publicKey } = useWallet();
  const { setVisible } = useWalletModal();

  const handleClick = () => {
    if (connected) {
      void disconnect();
      return;
    }

    setVisible(true);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-busy={connecting}
      disabled={connecting}
      className={`interactive-lift min-h-11 rounded-full bg-[var(--lime)] px-5 py-3 text-sm font-semibold text-[var(--lime-ink)] transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] disabled:cursor-wait disabled:opacity-80 ${className}`}
    >
      {connecting
        ? "Connecting..."
        : connected && publicKey
          ? truncateAddress(publicKey.toBase58())
          : "Connect wallet"}
    </button>
  );
}
