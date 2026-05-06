export type FeedRow = {
  ean?: string;
  product_title?: string;
  price?: string | number;
  currency?: string;
  product_url?: string;
  image_url?: string;
  stock_status?: string;
  delivery_time?: string;
  shipping_cost?: string | number;
  [key: string]: unknown;
};

export type FeedValidationError = {
  code: string;
  message: string;
};

export type FeedValidationResult =
  | {
      accepted: true;
      normalizedEan: string;
      normalizedRow: Required<Pick<
        FeedRow,
        | "product_title"
        | "currency"
        | "product_url"
        | "image_url"
        | "stock_status"
        | "delivery_time"
      >> & {
        ean: string;
        price: number;
        shipping_cost: number;
      };
    }
  | {
      accepted: false;
      normalizedEan: string;
      error: FeedValidationError;
    };

