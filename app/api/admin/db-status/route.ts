import { NextResponse } from "next/server";
import { hasDatabaseUrl, prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  if (!hasDatabaseUrl()) {
    return NextResponse.json({
      databaseMode: "mock",
      masterProducts: 0,
      activeOffers: 0
    });
  }

  try {
    const [masterProducts, approvedMasterProducts, activeOffers, shops] = await Promise.all([
      prisma.masterProduct.count(),
      prisma.masterProduct.count({ where: { status: "APPROVED" } }),
      prisma.shopOffer.count({ where: { status: "ACTIVE" } }),
      prisma.shop.count()
    ]);

    return NextResponse.json({
      databaseMode: "postgresql",
      masterProducts,
      approvedMasterProducts,
      activeOffers,
      shops
    });
  } catch (error) {
    return NextResponse.json({
      databaseMode: "postgresql",
      error: error instanceof Error ? error.message : "Database status check failed."
    }, { status: 500 });
  }
}
