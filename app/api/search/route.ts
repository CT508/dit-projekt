import { NextRequest, NextResponse } from "next/server";
import { searchProducts } from "@/lib/data/mock-data";

export function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") ?? "";
  return NextResponse.json({ products: searchProducts(query) });
}

