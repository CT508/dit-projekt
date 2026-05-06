import type { FeedRow } from "./types";

export function parseXmlFeed(xml: string): FeedRow[] {
  const productBlocks = [...xml.matchAll(/<product>([\s\S]*?)<\/product>/gi)];

  return productBlocks.map((block) => {
    const content = block[1];
    return {
      ean: readTag(content, "ean"),
      product_title: readTag(content, "product_title"),
      price: readTag(content, "price"),
      currency: readTag(content, "currency"),
      product_url: readTag(content, "product_url"),
      image_url: readTag(content, "image_url"),
      stock_status: readTag(content, "stock_status"),
      delivery_time: readTag(content, "delivery_time"),
      shipping_cost: readTag(content, "shipping_cost")
    };
  });
}

function readTag(content: string, tagName: string): string {
  const match = content.match(new RegExp(`<${tagName}>([\\s\\S]*?)<\\/${tagName}>`, "i"));
  return decodeXml(match?.[1]?.trim() ?? "");
}

function decodeXml(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

