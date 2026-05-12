import { prisma, hasDatabaseUrl } from "@/lib/db/prisma";
import { products as mockProducts, type MasterProductView, type OfferView } from "./mock-data";

type DbMasterProduct = {
  id: string;
  ean: string;
  slug: string;
  productName: string;
  brand: string | null;
  imageUrl: string | null;
  gallery: unknown;
  description: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  canonicalUrl: string | null;
  specifications: unknown;
  category: { name: string } | null;
  offers: Array<{
    id: string;
    productTitle: string;
    price: unknown;
    currency: string;
    productUrl: string;
    imageUrl: string;
    stockStatus: string;
    deliveryTime: string;
    deliveryDays: number | null;
    lastSeenAt: Date;
    shop: {
      name: string;
      logoUrl: string | null;
      rating: unknown;
      countryCode: string;
      pricesIncludeVat: boolean;
      deliveryCountries: string[];
    };
  }>;
};

export async function getProducts(): Promise<MasterProductView[]> {
  if (!hasDatabaseUrl()) {
    return mockProducts;
  }

  try {
    const dbProducts = await prisma.masterProduct.findMany({
      where: { status: "APPROVED" },
      include: {
        category: { select: { name: true } },
        offers: {
          where: { status: "ACTIVE" },
          include: {
            shop: {
              select: {
                name: true,
                logoUrl: true,
                rating: true,
                countryCode: true,
                pricesIncludeVat: true,
                deliveryCountries: true
              }
            }
          },
          orderBy: { lastSeenAt: "desc" }
        }
      },
      orderBy: { updatedAt: "desc" }
    });

    if (dbProducts.length === 0) {
      return mockProducts;
    }

    return dbProducts.map(mapDbProduct);
  } catch {
    return mockProducts;
  }
}

export async function findProductByEan(ean: string) {
  const products = await getProducts();
  return products.find((product) => product.ean === ean);
}

export async function searchProducts(query: string) {
  const products = await getProducts();
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return products;
  }

  const queryTokens = normalized.split(/\s+/).filter(Boolean);
  return products.filter((product) => {
    const searchable = [
      product.ean,
      product.productName,
      product.brand,
      product.category
    ].join(" ").toLowerCase();

    return queryTokens.every((token) => searchable.includes(token));
  });
}

export function sortOffers(offers: OfferView[], sort: string | null) {
  const copy = [...offers];

  if (sort === "fastest-delivery") {
    return copy.sort((a, b) => a.deliveryDays - b.deliveryDays);
  }

  if (sort === "shop-rating") {
    return copy.sort((a, b) => a.shopName.localeCompare(b.shopName));
  }

  if (sort === "newest") {
    return copy.sort((a, b) => Date.parse(b.newestAt) - Date.parse(a.newestAt));
  }

  return copy.sort((a, b) => a.price - b.price);
}

function mapDbProduct(product: DbMasterProduct): MasterProductView {
  const gallery = parseStringArray(product.gallery);
  const imageUrl = product.imageUrl ?? gallery[0] ?? "";

  return {
    ean: product.ean,
    slug: product.slug,
    productName: product.productName,
    brand: product.brand ?? "",
    category: product.category?.name ?? "Uncategorized",
    imageUrl,
    gallery: gallery.length > 0 ? gallery : imageUrl ? [imageUrl] : [],
    description: product.description ?? "",
    seoTitle: product.seoTitle ?? product.productName,
    seoDescription: product.seoDescription ?? product.description ?? "",
    canonicalUrl: product.canonicalUrl ?? `/p/${product.ean}/${product.slug}`,
    specifications: parseSpecifications(product.specifications),
    offers: product.offers.map(mapDbOffer)
  };
}

function mapDbOffer(offer: DbMasterProduct["offers"][number]): OfferView {
  return {
    id: offer.id,
    shopName: offer.shop.name,
    shopLogoUrl: offer.shop.logoUrl,
    shopRating: Number(offer.shop.rating ?? 0),
    productTitle: offer.productTitle,
    price: Number(offer.price),
    pricesIncludeVat: offer.shop.pricesIncludeVat,
    shopCountryCode: offer.shop.countryCode,
    currency: offer.currency,
    productUrl: offer.productUrl,
    stockStatus: normalizeStockStatus(offer.stockStatus),
    deliveryTime: offer.deliveryTime,
    deliveryDays: offer.deliveryDays ?? 99,
    shipsToCountries: offer.shop.deliveryCountries.length > 0 ? offer.shop.deliveryCountries : [offer.shop.countryCode],
    newestAt: offer.lastSeenAt.toISOString()
  };
}

function parseStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && item.length > 0) : [];
}

function parseSpecifications(value: unknown) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return Object.entries(value).reduce<Record<string, string>>((result, [key, item]) => {
      result[key] = String(item);
      return result;
    }, {});
  }

  return {};
}

function normalizeStockStatus(value: string): OfferView["stockStatus"] {
  if (value === "in_stock" || value === "limited_stock" || value === "out_of_stock") {
    return value;
  }

  return value.toLowerCase().includes("out") ? "out_of_stock" : "in_stock";
}
