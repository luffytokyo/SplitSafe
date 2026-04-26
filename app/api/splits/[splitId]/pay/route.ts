import { NextResponse } from "next/server";

import { markSplitWalletPaid } from "../../../../lib/splits-db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ splitId: string }> },
) {
  const { splitId } = await params;
  const { walletAddress } = (await request.json()) as { walletAddress?: string };

  if (!walletAddress) {
    return NextResponse.json({ error: "walletAddress is required" }, { status: 400 });
  }

  const result = await markSplitWalletPaid(splitId, walletAddress);

  if (!result.ok) {
    const status = result.reason === "not_found" ? 404 : 409;
    return NextResponse.json(result, { status });
  }

  return NextResponse.json(result);
}
