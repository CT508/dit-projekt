import type { FeedRow } from "./types";
import { parseGoogleMerchantItem } from "./parse-google-merchant-stream";

export function parseGoogleMerchantFeed(xml: string): FeedRow[] {
  const itemBlocks = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)];

  return itemBlocks.map((block) => {
    return parseGoogleMerchantItem(block[0]);
  });
}
