import { NextRequest, NextResponse } from "next/server";
import { findProductByEan } from "@/lib/data/mock-data";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const ean = String(body.ean ?? "");
  const product = findProductByEan(ean);

  if (!product) {
    return NextResponse.json({ error: "UNKNOWN_EAN" }, { status: 400 });
  }

  return NextResponse.json({
    tracked: true,
    ean,
    note: "Persist click_tracking in production with shopId, shopOfferId, visitor/session data, and timestamp."
  });
}

