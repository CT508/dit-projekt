import { NextRequest, NextResponse } from "next/server";
import { products } from "@/lib/data/mock-data";
import { parseXmlFeed } from "@/lib/imports/parse-xml";
import { validateImportRows } from "@/lib/imports/import-feed";

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";
  let pricesIncludeVat = true;
  let xml = "";

  if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    pricesIncludeVat = formData.get("pricesIncludeVat") === "on";
    xml = String(formData.get("xml") ?? "");
  } else {
    xml = await request.text();
  }

  const rows = parseXmlFeed(xml);

  const report = await validateImportRows(rows, async (ean) => {
    const product = products.find((item) => item.ean === ean);
    return product ? { id: product.ean, ean: product.ean, status: "APPROVED" } : null;
  });

  return NextResponse.json({
    status: report.rejectedRows.length > 0 ? "PARTIAL" : "COMPLETED",
    totalRows: report.totalRows,
    acceptedRows: report.acceptedRows.length,
    rejectedRows: report.rejectedRows.length,
    pricesIncludeVat,
    errors: report.rejectedRows
  });
}
