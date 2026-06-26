import { NextRequest, NextResponse } from "next/server";
import { searchProducts } from "@/lib/data/products-db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") ?? "";
  const products = await searchProducts(query);
  return NextResponse.json({
    products: products.map(({ ean, slug, productName, imageUrl }) => ({
      ean,
      slug,
      productName,
      imageUrl
    }))
  });
}
