import { validateEan } from "@/lib/ean/validate-ean";
import type { FeedRow, FeedValidationResult } from "./types";

const allowedStockStatuses = new Set([
  "in_stock",
  "out_of_stock",
  "preorder",
  "limited_stock"
]);

function requiredText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function parseMoney(value: unknown): number | null {
  const normalized = typeof value === "number" ? String(value) : requiredText(value);
  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized.replace(",", "."));
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function validateFeedRow(
  row: FeedRow,
  seenEansInImport: Set<string>
): FeedValidationResult {
  const eanResult = validateEan(row.ean);

  if (!eanResult.valid) {
    return {
      accepted: false,
      normalizedEan: eanResult.normalizedEan,
      error: { code: eanResult.code, message: eanResult.message }
    };
  }

  if (seenEansInImport.has(eanResult.normalizedEan)) {
    return {
      accepted: false,
      normalizedEan: eanResult.normalizedEan,
      error: {
        code: "DUPLICATE_EAN_IN_IMPORT",
        message: "This EAN appears more than once in the same feed."
      }
    };
  }

  const title = requiredText(row.product_title);
  if (!title) {
    return reject(eanResult.normalizedEan, "MISSING_PRODUCT_TITLE", "Product title is required.");
  }

  const price = parseMoney(row.price);
  if (price === null) {
    return reject(eanResult.normalizedEan, "INVALID_PRICE", "Price must be a positive number.");
  }

  const currency = requiredText(row.currency).toUpperCase();
  if (!/^[A-Z]{3}$/.test(currency)) {
    return reject(eanResult.normalizedEan, "INVALID_CURRENCY", "Currency must be an ISO 4217 code.");
  }

  const productUrl = requiredText(row.product_url);
  if (!isHttpUrl(productUrl)) {
    return reject(eanResult.normalizedEan, "INVALID_PRODUCT_URL", "Product URL must be a valid http or https URL.");
  }

  const imageUrl = requiredText(row.image_url);
  if (!isHttpUrl(imageUrl)) {
    return reject(eanResult.normalizedEan, "INVALID_IMAGE_URL", "Image URL must be a valid http or https URL.");
  }

  const stockStatus = requiredText(row.stock_status);
  if (!allowedStockStatuses.has(stockStatus)) {
    return reject(eanResult.normalizedEan, "INVALID_STOCK_STATUS", "Stock status is not supported.");
  }

  const deliveryTime = requiredText(row.delivery_time);
  if (!deliveryTime) {
    return reject(eanResult.normalizedEan, "MISSING_DELIVERY_TIME", "Delivery time is required.");
  }

  seenEansInImport.add(eanResult.normalizedEan);

  return {
    accepted: true,
    normalizedEan: eanResult.normalizedEan,
    normalizedRow: {
      ean: eanResult.normalizedEan,
      product_title: title,
      price,
      currency,
      product_url: productUrl,
      image_url: imageUrl,
      stock_status: stockStatus,
      delivery_time: deliveryTime,
      shipping_cost: 0
    }
  };
}

function reject(normalizedEan: string, code: string, message: string): FeedValidationResult {
  return {
    accepted: false,
    normalizedEan,
    error: { code, message }
  };
}
