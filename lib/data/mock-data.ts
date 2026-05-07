export type MasterProductView = {
  ean: string;
  slug: string;
  productName: string;
  brand: string;
  category: string;
  imageUrl: string;
  gallery: string[];
  description: string;
  seoTitle: string;
  seoDescription: string;
  canonicalUrl: string;
  specifications: Record<string, string>;
  offers: OfferView[];
};

export type OfferView = {
  id: string;
  shopName: string;
  shopRating: number;
  productTitle: string;
  price: number;
  currency: string;
  shippingCost: number;
  productUrl: string;
  stockStatus: "in_stock" | "limited_stock" | "out_of_stock";
  deliveryTime: string;
  deliveryDays: number;
  newestAt: string;
};

export const products: MasterProductView[] = [
  {
    ean: "5901234123457",
    slug: "aurapods-pro-2-wireless-earbuds",
    productName: "AuraPods Pro 2 Wireless Earbuds",
    brand: "Aura",
    category: "Headphones",
    imageUrl: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?auto=format&fit=crop&w=900&q=80"
    ],
    description:
      "Wireless in-ear headphones with active noise cancellation, transparency mode, USB-C charging case, and up to 30 hours of battery life.",
    seoTitle: "AuraPods Pro 2 - prices, offers and specifications",
    seoDescription: "Compare AuraPods Pro 2 prices by approved EAN. See offers, stock, delivery, specifications and price data.",
    canonicalUrl: "/p/5901234123457/aurapods-pro-2-wireless-earbuds",
    specifications: {
      EAN: "5901234123457",
      Type: "Wireless in-ear",
      "Noise cancellation": "Active ANC",
      Battery: "Up to 30 hours with case",
      Charging: "USB-C and wireless",
      Waterproofing: "IP54"
    },
    offers: [
      {
        id: "offer_soundstreet_5901234123457",
        shopName: "SoundStreet",
        shopRating: 4.8,
        productTitle: "AuraPods Pro 2 Wireless Earbuds, White, USB-C Case",
        price: 899,
        currency: "DKK",
        shippingCost: 0,
        productUrl: "https://shop.example.com/aurapods-pro-2",
        stockStatus: "in_stock",
        deliveryTime: "1-2 days",
        deliveryDays: 1,
        newestAt: "2026-05-06T09:20:00Z"
      },
      {
        id: "offer_nordictech_5901234123457",
        shopName: "NordicTech",
        shopRating: 4.6,
        productTitle: "AuraPods Pro 2 ANC Headphones",
        price: 929,
        currency: "DKK",
        shippingCost: 0,
        productUrl: "https://shop.example.com/aura-anc",
        stockStatus: "in_stock",
        deliveryTime: "2-3 days",
        deliveryDays: 2,
        newestAt: "2026-05-06T08:10:00Z"
      }
    ]
  },
  {
    ean: "4006381333931",
    slug: "nord-x12-smartphone-256gb",
    productName: "Nord X12 Smartphone 256GB",
    brand: "Nord",
    category: "Smartphones",
    imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80"
    ],
    description:
      "Flagship smartphone with OLED display, fast charging, dual SIM, and 256GB storage.",
    seoTitle: "Nord X12 256GB - compare prices and offers",
    seoDescription: "Compare Nord X12 Smartphone 256GB prices from approved EAN-matched shop offers.",
    canonicalUrl: "/p/4006381333931/nord-x12-smartphone-256gb",
    specifications: {
      EAN: "4006381333931",
      Display: "6.7 inch OLED",
      Storage: "256GB",
      Camera: "50MP main camera",
      Battery: "5000 mAh",
      Charging: "80W fast charging"
    },
    offers: [
      {
        id: "offer_mobilehub_4006381333931",
        shopName: "MobileHub",
        shopRating: 4.7,
        productTitle: "Nord X12 256GB Smartphone, Black",
        price: 4799,
        currency: "DKK",
        shippingCost: 29,
        productUrl: "https://shop.example.com/nord-x12",
        stockStatus: "limited_stock",
        deliveryTime: "2-4 days",
        deliveryDays: 2,
        newestAt: "2026-05-06T10:00:00Z"
      }
    ]
  },
  {
    ean: "8715946668031",
    slug: "epson-cyan-t44j2-700-ml-blaekpatron",
    productName: "Epson Cyan T44J2 - 700 ml blaekpatron",
    brand: "Epson",
    category: "Printer Ink",
    imageUrl: "https://www.grafisk-handel.dk/images/a1234-hires-en-int-surecolor_sc-p7500-sc-p9500_c_700 kopier.jpg",
    gallery: [
      "https://www.grafisk-handel.dk/images/a1234-hires-en-int-surecolor_sc-p7500-sc-p9500_c_700 kopier.jpg",
      "https://www.grafisk-handel.dk/images/Epson T44J2.webp",
      "https://www.grafisk-handel.dk/images/Epson T44J1.webp"
    ],
    description:
      "Cyan 700 ml ink cartridge for Epson SureColor P7500 and P9500. SKU C13T44J240. Approved master product matched only by EAN 8715946668031.",
    seoTitle: "Epson Cyan T44J2 700 ml - prices, EAN, offers and specs",
    seoDescription: "Compare prices for Epson Cyan T44J2 700 ml ink cartridge. Approved EAN 8715946668031, SKU C13T44J240, offers, delivery and stock.",
    canonicalUrl: "/p/8715946668031/epson-cyan-t44j2-700-ml-blaekpatron",
    specifications: {
      EAN: "8715946668031",
      SKU: "C13T44J240",
      Brand: "Epson",
      Color: "Cyan",
      Volume: "700 ml",
      Compatibility: "Epson SureColor P7500, Epson SureColor P9500"
    },
    offers: [
      {
        id: "offer_grafiskhandel_8715946668031",
        shopName: "Grafisk Handel",
        shopRating: 4.7,
        productTitle: "Epson Cyan T44J2 - 700 ml blaekpatron",
        price: 2039.68,
        currency: "DKK",
        shippingCost: 43.75,
        productUrl: "https://www.grafisk-handel.dk/shop/epson-cyan-t44j2-9732p.html",
        stockStatus: "in_stock",
        deliveryTime: "3 days",
        deliveryDays: 3,
        newestAt: "2026-05-06T10:30:00Z"
      }
    ]
  }
];

export function findProductByEan(ean: string) {
  return products.find((product) => product.ean === ean);
}

export function searchProducts(query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return products;
  }

  return products.filter((product) => {
    return [
      product.ean,
      product.productName,
      product.brand,
      product.category
    ].some((value) => value.toLowerCase().includes(normalized));
  });
}

export function sortOffers(offers: OfferView[], sort: string | null) {
  const copy = [...offers];

  if (sort === "fastest-delivery") {
    return copy.sort((a, b) => a.deliveryDays - b.deliveryDays);
  }

  if (sort === "shop-rating") {
    return copy.sort((a, b) => b.shopRating - a.shopRating);
  }

  if (sort === "newest") {
    return copy.sort((a, b) => Date.parse(b.newestAt) - Date.parse(a.newestAt));
  }

  return copy.sort((a, b) => (a.price + a.shippingCost) - (b.price + b.shippingCost));
}
