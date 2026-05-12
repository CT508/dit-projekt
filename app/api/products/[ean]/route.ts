import { NextRequest, NextResponse } from "next/server";
import { findProductByEan, sortOffers } from "@/lib/data/products-db";

export async function GET(request: NextRequest, { params }: { params: { ean: string } }) {
  const product = await findProductByEan(params.ean);

  if (!product) {
    return NextResponse.json({ error: "PRODUCT_NOT_FOUND" }, { status: 404 });
  }

  return NextResponse.json({
    product: {
      ...product,
      offers: sortOffers(product.offers, request.nextUrl.searchParams.get("sort"))
    }
  });
}
