import { NextResponse } from "next/server";
import { products } from "@/lib/data/mock-data";

export function GET() {
  return NextResponse.json({
    products: products.map((product) => ({
      ean: product.ean,
      productName: product.productName,
      brand: product.brand,
      category: product.category,
      status: "APPROVED",
      offerCount: product.offers.length
    }))
  });
}

