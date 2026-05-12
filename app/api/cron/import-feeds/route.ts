import { NextRequest, NextResponse } from "next/server";
import { hasDatabaseUrl, prisma } from "@/lib/db/prisma";
import { parseXmlFeed } from "@/lib/imports/parse-xml";
import { parseGoogleMerchantFeed } from "@/lib/imports/parse-google-merchant";
import { validateImportRows } from "@/lib/imports/import-feed";

export async function GET(request: NextRequest) {
  const secret = request.headers.get("authorization")?.replace("Bearer ", "");

  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasDatabaseUrl()) {
    return NextResponse.json({ error: "DATABASE_URL is not configured." }, { status: 500 });
  }

  const shops = await prisma.shop.findMany({
    where: {
      feedEnabled: true,
      feedUrl: { not: null },
      status: "ACTIVE"
    }
  });

  const results = [];

  for (const shop of shops) {
    try {
      const response = await fetch(shop.feedUrl!);
      if (!response.ok) {
        throw new Error(`Feed request failed with status ${response.status}.`);
      }

      const xml = await response.text();
      const rows = xml.includes("<item") ? parseGoogleMerchantFeed(xml) : parseXmlFeed(xml);
      const report = await validateImportRows(rows, async (ean) => {
        const product = await prisma.masterProduct.findUnique({
          where: { ean },
          select: { id: true, ean: true, status: true }
        });

        return product ? { id: product.id, ean: product.ean, status: product.status as "APPROVED" | "PENDING" | "DISABLED" | "DELETED" } : null;
      });

      const productImport = await prisma.productImport.create({
        data: {
          shopId: shop.id,
          feedType: "XML",
          feedUrl: shop.feedUrl,
          status: report.rejectedRows.length > 0 ? "PARTIAL" : "COMPLETED",
          totalRows: report.totalRows,
          acceptedRows: report.acceptedRows.length,
          rejectedRows: report.rejectedRows.length,
          startedAt: new Date(),
          finishedAt: new Date()
        }
      });

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

      results.push({
        shop: shop.name,
        status: "COMPLETED",
        totalRows: report.totalRows,
        acceptedRows: report.acceptedRows.length,
        rejectedRows: report.rejectedRows.length
      });
    } catch (error) {
      results.push({
        shop: shop.name,
        status: "FAILED",
        error: error instanceof Error ? error.message : "Feed import failed."
      });
    }
  }

  return NextResponse.json({
    importedAt: new Date().toISOString(),
    shopCount: shops.length,
    results
  });
}

function parseDeliveryDays(value: string) {
  const match = value.match(/\d+/);
  return match ? Number(match[0]) : null;
}
