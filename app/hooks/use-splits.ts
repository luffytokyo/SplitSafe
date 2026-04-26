"use client";

import { useMemo, useSyncExternalStore } from "react";

import { getSplits, SPLITS_CHANGED_EVENT, type Split } from "../utils/splits";

function subscribe(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(SPLITS_CHANGED_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(SPLITS_CHANGED_EVENT, onStoreChange);
  };
}

function getSnapshot() {
  return JSON.stringify(getSplits());
}

function getServerSnapshot() {
  return "[]";
}

export function useSplits() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return useMemo(() => {
    try {
      return JSON.parse(snapshot) as Split[];
    } catch {
      return [];
    }
  }, [snapshot]);
}

export function useSplit(splitId: string) {
  const splits = useSplits();
  return splits.find((split) => split.id === splitId) ?? null;
}

export function useCreatorSplits(walletAddress: string) {
  const splits = useSplits();
  return useMemo(
    () =>
      walletAddress
        ? splits.filter((split) => split.creatorWallet === walletAddress)
        : [],
    [splits, walletAddress],
  );
}
