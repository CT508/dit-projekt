import { NextRequest, NextResponse } from "next/server";
import { products } from "@/lib/data/mock-data";
import { validateImportStream } from "@/lib/imports/import-feed";
import { formatBytes, maxFeedBytes, parseContentLength } from "@/lib/imports/feed-limits";
import { parseGoogleMerchantFeedStream } from "@/lib/imports/parse-google-merchant-stream";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";
  const requestContentLength = parseContentLength(request.headers.get("content-length"));
  if (requestContentLength !== null && requestContentLength > maxFeedBytes) {
    return NextResponse.json({
      error: "FEED_TOO_LARGE",
      maxBytes: maxFeedBytes,
      maxSize: formatBytes(maxFeedBytes)
    }, { status: 413 });
  }

  let feedStream: ReadableStream<Uint8Array> | null = request.body;

  if (contentType.includes("application/json")) {
    const body = await request.json();
    const feedUrl = String(body.feedUrl ?? "");
    if (!feedUrl.startsWith("https://")) {
      return NextResponse.json({ error: "HTTPS_FEED_URL_REQUIRED" }, { status: 400 });
    }

    const response = await fetch(feedUrl);
    if (!response.ok || !response.body) {
      return NextResponse.json({ error: "FEED_FETCH_FAILED" }, { status: 502 });
    }

    const feedContentLength = parseContentLength(response.headers.get("content-length"));
    if (feedContentLength !== null && feedContentLength > maxFeedBytes) {
      return NextResponse.json({
        error: "FEED_TOO_LARGE",
        maxBytes: maxFeedBytes,
        maxSize: formatBytes(maxFeedBytes)
      }, { status: 413 });
    }

    feedStream = response.body;
  }

  if (!feedStream) {
    return NextResponse.json({ error: "EMPTY_FEED_STREAM" }, { status: 400 });
  }

  const rows = parseGoogleMerchantFeedStream(feedStream);
  const report = await validateImportStream(rows, async (ean) => {
    const product = products.find((item) => item.ean === ean);
    return product ? { id: product.ean, ean: product.ean, status: "APPROVED" } : null;
  }, { maxRows: 250000 });

  return NextResponse.json({
    status: report.rejectedRows.length > 0 ? "PARTIAL" : "COMPLETED",
    totalRows: report.totalRows,
    acceptedRows: report.acceptedRows.length,
    rejectedRows: report.rejectedRows.length,
    errors: report.rejectedRows
  });
}
