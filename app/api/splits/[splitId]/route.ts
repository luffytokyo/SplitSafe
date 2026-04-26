import { NextResponse } from "next/server";

import { getSplitById } from "../../../lib/splits-db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ splitId: string }> },
) {
  const { splitId } = await params;
  const split = await getSplitById(splitId);

  if (!split) {
    return NextResponse.json({ error: "Split not found" }, { status: 404 });
  }

  return NextResponse.json({ split });
}
