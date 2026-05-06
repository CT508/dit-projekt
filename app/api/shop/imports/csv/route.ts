import { NextRequest, NextResponse } from "next/server";
import { products } from "@/lib/data/mock-data";
import { parseCsvFeed } from "@/lib/imports/parse-csv";
import { validateImportRows } from "@/lib/imports/import-feed";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const csv = String(formData.get("csv") ?? "");
  const rows = parseCsvFeed(csv);

  const report = await validateImportRows(rows, async (ean) => {
    const product = products.find((item) => item.ean === ean);
    return product ? { id: product.ean, ean: product.ean, status: "APPROVED" } : null;
  });

  return NextResponse.json({
    status: report.rejectedRows.length > 0 ? "PARTIAL" : "COMPLETED",
    totalRows: report.totalRows,
    acceptedRows: report.acceptedRows.length,
    rejectedRows: report.rejectedRows.length,
    errors: report.rejectedRows
  });
}

