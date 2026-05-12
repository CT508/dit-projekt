import { NextRequest, NextResponse } from "next/server";
import { hasDatabaseUrl, prisma } from "@/lib/db/prisma";
import { parseXmlFeed } from "@/lib/imports/parse-xml";
import { parseGoogleMerchantFeed } from "@/lib/imports/parse-google-merchant";
import { validateImportRows } from "@/lib/imports/import-feed";

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";
  let pricesIncludeVat = true;
  let shopName = "Grafisk Handel";
  let shopSlug = "grafisk-handel";
  let shopCountryCode = "DK";
  let deliveryCountries = ["DK"];
  let feedUrl = "";
  let xml = "";

  if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    pricesIncludeVat = formData.get("pricesIncludeVat") === "on";
    shopName = String(formData.get("shopName") ?? shopName);
    shopSlug = slugify(shopName);
    shopCountryCode = String(formData.get("shopCountryCode") ?? shopCountryCode).toUpperCase();
    deliveryCountries = String(formData.get("deliveryCountries") ?? "DK")
      .split(",")
      .map((country) => country.trim().toUpperCase())
      .filter(Boolean);
    feedUrl = String(formData.get("feedUrl") ?? "");
    xml = String(formData.get("xml") ?? "");
  } else {
    xml = await request.text();
  }

  const rows = xml.includes("<item") ? parseGoogleMerchantFeed(xml) : parseXmlFeed(xml);

  const report = await validateImportRows(rows, async (ean) => {
    if (!hasDatabaseUrl()) {
      return null;
    }

    const product = await prisma.masterProduct.findUnique({
      where: { ean },
      select: { id: true, ean: true, status: true }
    });

    return product ? { id: product.id, ean: product.ean, status: product.status as "APPROVED" | "PENDING" | "DISABLED" | "DELETED" } : null;
  });

  let importId: string | null = null;
  let savedOffers = 0;

  if (hasDatabaseUrl()) {
    const shop = await prisma.shop.upsert({
      where: { slug: shopSlug },
      update: {
        name: shopName,
        countryCode: shopCountryCode,
        pricesIncludeVat,
        deliveryCountries,
        feedUrl: feedUrl || null,
        feedEnabled: Boolean(feedUrl),
        status: "ACTIVE"
      },
      create: {
        name: shopName,
        slug: shopSlug,
        websiteUrl: "https://www.grafisk-handel.dk",
        countryCode: shopCountryCode,
        pricesIncludeVat,
        deliveryCountries,
        feedUrl: feedUrl || null,
        feedEnabled: Boolean(feedUrl),
        status: "ACTIVE"
      }
    });

    const productImport = await prisma.productImport.create({
      data: {
        shopId: shop.id,
        feedType: "XML",
        feedUrl: feedUrl || null,
        status: report.rejectedRows.length > 0 ? "PARTIAL" : "COMPLETED",
        totalRows: report.totalRows,
        acceptedRows: report.acceptedRows.length,
        rejectedRows: report.rejectedRows.length,
        startedAt: new Date(),
        finishedAt: new Date()
      }
    });
    importId = productImport.id;

    for (const accepted of report.acceptedRows) {
      await prisma.shopOffer.upsert({
        where: {
          shopId_ean: {
            shopId: shop.id,
            ean: accepted.normalizedEan
          }
        },
        update: {
          masterProductId: accepted.masterProductId,
          productTitle: String(accepted.row.product_title),
          price: Number(accepted.row.price),
          currency: String(accepted.row.currency),
          productUrl: String(accepted.row.product_url),
          imageUrl: String(accepted.row.image_url),
          stockStatus: String(accepted.row.stock_status),
          deliveryTime: String(accepted.row.delivery_time),
          deliveryDays: parseDeliveryDays(String(accepted.row.delivery_time)),
          sourceImportId: productImport.id,
          status: "ACTIVE",
          lastSeenAt: new Date()
        },
        create: {
          shopId: shop.id,
          masterProductId: accepted.masterProductId,
          ean: accepted.normalizedEan,
          productTitle: String(accepted.row.product_title),
          price: Number(accepted.row.price),
          currency: String(accepted.row.currency),
          productUrl: String(accepted.row.product_url),
          imageUrl: String(accepted.row.image_url),
          stockStatus: String(accepted.row.stock_status),
          deliveryTime: String(accepted.row.delivery_time),
          deliveryDays: parseDeliveryDays(String(accepted.row.delivery_time)),
          sourceImportId: productImport.id,
          status: "ACTIVE"
        }
      });

      await prisma.priceHistory.create({
        data: {
          masterProductId: accepted.masterProductId,
          ean: accepted.normalizedEan,
          price: Number(accepted.row.price),
          currency: String(accepted.row.currency)
        }
      });

      savedOffers += 1;
    }

    if (report.rejectedRows.length > 0) {
      await prisma.importError.createMany({
        data: report.rejectedRows.map((error) => ({
          importId: productImport.id,
          rowNumber: error.rowNumber,
          rawEan: error.rawEan === undefined ? null : String(error.rawEan),
          normalizedEan: error.normalizedEan,
          productTitle: error.productTitle === undefined ? null : String(error.productTitle),
          errorCode: error.errorCode,
          errorMessage: error.errorMessage,
          rawPayload: JSON.parse(JSON.stringify(error.rawPayload))
        }))
      });
    }

    await prisma.shop.update({
      where: { id: shop.id },
      data: { lastImportedAt: new Date() }
    });
  }

  return NextResponse.json({
    status: report.rejectedRows.length > 0 ? "PARTIAL" : "COMPLETED",
    importId,
    totalRows: report.totalRows,
    acceptedRows: report.acceptedRows.length,
    rejectedRows: report.rejectedRows.length,
    savedOffers,
    pricesIncludeVat,
    databaseMode: hasDatabaseUrl() ? "postgresql" : "mock",
    errors: report.rejectedRows
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

function parseDeliveryDays(value: string) {
  const match = value.match(/\d+/);
  return match ? Number(match[0]) : null;
}
