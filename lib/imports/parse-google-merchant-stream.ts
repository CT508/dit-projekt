import type { FeedRow } from "./types";
import { maxGoogleMerchantItemBytes } from "./feed-limits";

export type GoogleMerchantStreamOptions = {
  maxItemBytes?: number;
};

const defaultMaxItemBytes = maxGoogleMerchantItemBytes;

export async function* parseGoogleMerchantFeedStream(
  stream: ReadableStream<Uint8Array>,
  options: GoogleMerchantStreamOptions = {}
): AsyncGenerator<FeedRow> {
  const maxItemBytes = options.maxItemBytes ?? defaultMaxItemBytes;
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    buffer += decoder.decode(value, { stream: !done });

    let itemEnd = buffer.indexOf("</item>");
    while (itemEnd !== -1) {
      const itemStart = buffer.lastIndexOf("<item>", itemEnd);

      if (itemStart === -1) {
        buffer = buffer.slice(itemEnd + "</item>".length);
        itemEnd = buffer.indexOf("</item>");
        continue;
      }

      const itemXml = buffer.slice(itemStart, itemEnd + "</item>".length);
      if (new Blob([itemXml]).size > maxItemBytes) {
        throw new Error(`Google Merchant item exceeded ${maxItemBytes} bytes.`);
      }

      yield parseGoogleMerchantItem(itemXml);
      buffer = buffer.slice(itemEnd + "</item>".length);
      itemEnd = buffer.indexOf("</item>");
    }

    if (new Blob([buffer]).size > maxItemBytes) {
      const earliestItemStart = buffer.indexOf("<item>");
      buffer = earliestItemStart === -1 ? "" : buffer.slice(earliestItemStart);

      if (new Blob([buffer]).size > maxItemBytes) {
        throw new Error(`Google Merchant parser buffer exceeded ${maxItemBytes} bytes.`);
      }
    }

    if (done) {
      break;
    }
  }
}

export function parseGoogleMerchantItem(itemXml: string): FeedRow {
  const price = parseGoogleMoney(readTag(itemXml, "g:price"));
  const shippingCost = parseGoogleMoney(readNestedTag(itemXml, "g:shipping", "g:price"));

  return {
    ean: readTag(itemXml, "g:gtin"),
    product_title: readTag(itemXml, "title"),
    price,
    currency: readCurrency(readTag(itemXml, "g:price")) || "DKK",
    product_url: readTag(itemXml, "link"),
    image_url: readTag(itemXml, "g:image_link"),
    stock_status: normalizeAvailability(readTag(itemXml, "g:availability")),
    delivery_time: readDeliveryTime(itemXml),
    shipping_cost: shippingCost,
    brand: readTag(itemXml, "g:brand"),
    category: readTag(itemXml, "g:product_type") || readTag(itemXml, "g:google_product_category"),
    shop_sku: readTag(itemXml, "g:id"),
    manufacturer_part_number: readTag(itemXml, "g:mpn")
  };
}

function readTag(content: string, tagName: string): string {
  const escapedTag = tagName.replace(":", "\\:");
  const cdataPattern = new RegExp(`<${escapedTag}>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*<\\/${escapedTag}>`, "i");
  const plainPattern = new RegExp(`<${escapedTag}>\\s*([\\s\\S]*?)\\s*<\\/${escapedTag}>`, "i");
  const match = content.match(cdataPattern) ?? content.match(plainPattern);

  return decodeXml(match?.[1]?.trim() ?? "");
}

function readNestedTag(content: string, parentTag: string, childTag: string): string {
  const escapedParent = parentTag.replace(":", "\\:");
  const parentMatch = content.match(new RegExp(`<${escapedParent}>\\s*([\\s\\S]*?)\\s*<\\/${escapedParent}>`, "i"));
  return parentMatch ? readTag(parentMatch[1], childTag) : "";
}

function parseGoogleMoney(value: string): string {
  return value.replace(/[A-Z]{3}/gi, "").trim().replace(",", ".");
}

function readCurrency(value: string): string {
  const match = value.match(/\b[A-Z]{3}\b/i);
  return match ? match[0].toUpperCase() : "";
}

function normalizeAvailability(value: string): string {
  const normalized = value.toLowerCase().replace(/\s+/g, "_");
  if (normalized === "in_stock") {
    return "in_stock";
  }
  if (normalized === "out_of_stock") {
    return "out_of_stock";
  }
  if (normalized === "preorder" || normalized === "pre_order") {
    return "preorder";
  }
  if (normalized === "limited_stock") {
    return "limited_stock";
  }
  return normalized;
}

function readDeliveryTime(content: string): string {
  const customLabel = readTag(content, "g:custom_label_2");
  return customLabel ? `${customLabel} days` : "Standard";
}

function decodeXml(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}
