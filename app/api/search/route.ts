import { NextRequest, NextResponse } from "next/server";
import { searchProducts } from "@/lib/data/products-db";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") ?? "";
  return NextResponse.json({ products: await searchProducts(query) });
}
