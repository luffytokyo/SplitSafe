import { NextResponse } from "next/server";

import { createSplit, getSplitsByCreator } from "../../lib/splits-db";
import type { Split } from "../../utils/splits";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const creatorWallet = searchParams.get("creatorWallet");

  if (!creatorWallet) {
    return NextResponse.json({ error: "creatorWallet is required" }, { status: 400 });
  }

  const splits = await getSplitsByCreator(creatorWallet);
  return NextResponse.json({ splits });
}

export async function POST(request: Request) {
  const split = (await request.json()) as Split;

  if (
    !split.id ||
    !split.title ||
    !split.creatorWallet ||
    !split.receiverWallet ||
    !split.totalAmount ||
    !split.perPersonAmount ||
    !split.totalPeople
  ) {
    return NextResponse.json({ error: "Invalid split payload" }, { status: 400 });
  }

  const created = await createSplit(split);
  return NextResponse.json({ split: created }, { status: 201 });
}
