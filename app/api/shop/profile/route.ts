import { NextRequest, NextResponse } from "next/server";
import { hasDatabaseUrl, prisma } from "@/lib/db/prisma";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const shopName = String(formData.get("shopName") ?? "Grafisk Handel").trim();
  const websiteUrl = String(formData.get("websiteUrl") ?? "").trim();
  const countryCode = String(formData.get("countryCode") ?? "DK").toUpperCase();
  const logoUrl = String(formData.get("logoUrl") ?? "").trim();
  const contactEmail = String(formData.get("contactEmail") ?? "").trim();
  const contactPhone = String(formData.get("contactPhone") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const deliveryCountries = formData
    .getAll("deliveryCountries")
    .map((country) => String(country).toUpperCase())
    .filter(Boolean);

  if (!shopName || !websiteUrl) {
    return NextResponse.json({ error: "SHOP_NAME_AND_WEBSITE_REQUIRED" }, { status: 400 });
  }

  if (deliveryCountries.length === 0) {
    return NextResponse.json({ error: "DELIVERY_COUNTRY_REQUIRED" }, { status: 400 });
  }

  const slug = slugify(shopName);

  if (!hasDatabaseUrl()) {
    return NextResponse.json({
      databaseMode: "mock",
      slug,
      shopName,
      deliveryCountries
    });
  }

  const shop = await prisma.shop.upsert({
    where: { slug },
    update: {
      name: shopName,
      websiteUrl,
      countryCode,
      logoUrl: logoUrl || null,
      contactEmail: contactEmail || null,
      contactPhone: contactPhone || null,
      description: description || null,
      deliveryCountries,
      status: "ACTIVE"
    },
    create: {
      name: shopName,
      slug,
      websiteUrl,
      countryCode,
      logoUrl: logoUrl || null,
      contactEmail: contactEmail || null,
      contactPhone: contactPhone || null,
      description: description || null,
      deliveryCountries,
      status: "ACTIVE"
    }
  });

  return NextResponse.json({
    databaseMode: "postgresql",
    shopId: shop.id,
    slug: shop.slug,
    shopName: shop.name,
    deliveryCountries: shop.deliveryCountries
  });
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/\u00e6/g, "ae")
    .replace(/\u00f8/g, "oe")
    .replace(/\u00e5/g, "aa")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
