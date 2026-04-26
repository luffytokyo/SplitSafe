import type { PaySplitResult, Split } from "./splits";

async function parseJson<T>(response: Response) {
  const data = (await response.json()) as T;

  if (!response.ok) {
    throw new Error("error" in (data as object) ? String((data as { error: string }).error) : "Request failed");
  }

  return data;
}

export async function createSplitRecord(split: Split) {
  const data = await parseJson<{ split: Split }>(
    await fetch("/api/splits", {
      body: JSON.stringify(split),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    }),
  );

  return data.split;
}

export async function fetchSplitRecord(splitId: string) {
  const response = await fetch(`/api/splits/${splitId}`, { cache: "no-store" });
  if (response.status === 404) return null;
  const data = await parseJson<{ split: Split }>(response);
  return data.split;
}

export async function fetchCreatorSplits(creatorWallet: string) {
  const data = await parseJson<{ splits: Split[] }>(
    await fetch(`/api/splits?creatorWallet=${encodeURIComponent(creatorWallet)}`, {
      cache: "no-store",
    }),
  );

  return data.splits;
}

export async function paySplitRecord(splitId: string, walletAddress: string) {
  const response = await fetch(`/api/splits/${splitId}/pay`, {
    body: JSON.stringify({ walletAddress }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
  const data = (await response.json()) as PaySplitResult;

  return data;
}
