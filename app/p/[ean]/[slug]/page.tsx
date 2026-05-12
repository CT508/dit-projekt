import { notFound } from "next/navigation";
import { findProductByEan, sortOffers } from "@/lib/data/products-db";
import { calculateVatPrices, getCountryName } from "@/lib/vat/eu-vat";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const shoppingCountries = [
  { code: "AT", name: "Austria" },
  { code: "BE", name: "Belgium" },
  { code: "BG", name: "Bulgaria" },
  { code: "HR", name: "Croatia" },
  { code: "CY", name: "Cyprus" },
  { code: "CZ", name: "Czechia" },
  { code: "DK", name: "Denmark" },
  { code: "EE", name: "Estonia" },
  { code: "FI", name: "Finland" },
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
  { code: "GR", name: "Greece" },
  { code: "HU", name: "Hungary" },
  { code: "IE", name: "Ireland" },
  { code: "IT", name: "Italy" },
  { code: "LV", name: "Latvia" },
  { code: "LT", name: "Lithuania" },
  { code: "LU", name: "Luxembourg" },
  { code: "MT", name: "Malta" },
  { code: "NL", name: "Netherlands" },
  { code: "PL", name: "Poland" },
  { code: "PT", name: "Portugal" },
  { code: "RO", name: "Romania" },
  { code: "SK", name: "Slovakia" },
  { code: "SI", name: "Slovenia" },
  { code: "ES", name: "Spain" },
  { code: "SE", name: "Sweden" }
];

function floorToTwoDecimals(value: number) {
  return Math.floor(value * 100) / 100;
}

function formatPrice(value: number) {
  return floorToTwoDecimals(value).toFixed(2);
}

function stockLabel(stockStatus: string) {
  if (stockStatus === "in_stock") {
    return "In stock";
  }

  if (stockStatus === "limited_stock") {
    return "Limited stock";
  }

  return "Out of stock";
}

function stockTone(stockStatus: string) {
  if (stockStatus === "in_stock") {
    return "stock-ok";
  }

  if (stockStatus === "limited_stock") {
    return "stock-limited";
  }

  return "stock-out";
}

function trackedShopUrl(productUrl: string, shopName: string) {
  try {
    const url = new URL(productUrl);
    url.searchParams.set("utm_source", "prispuls.dk");
    url.searchParams.set("utm_medium", "price_comparison");
    url.searchParams.set("utm_campaign", "product_offer");
    url.searchParams.set("utm_content", shopName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
    return url.toString();
  } catch {
    return productUrl;
  }
}

export default async function ProductPage({
  params,
  searchParams
}: {
  params: { ean: string; slug: string };
  searchParams: { sort?: string; country?: string };
}) {
  const product = await findProductByEan(params.ean);
  if (!product) {
    notFound();
  }

  const selectedCountry = shoppingCountries.some((country) => country.code === searchParams.country) ? searchParams.country! : "DK";
  const selectedCountryName = shoppingCountries.find((country) => country.code === selectedCountry)?.name ?? "Denmark";
  const deliverableOffers = product.offers.filter((offer) => offer.shipsToCountries.includes(selectedCountry));
  const offers = searchParams.sort === "cheapest" || !searchParams.sort
    ? [...deliverableOffers].sort((a, b) => {
      const aVat = calculateVatPrices(a.price, a.shopCountryCode, a.pricesIncludeVat);
      const bVat = calculateVatPrices(b.price, b.shopCountryCode, b.pricesIncludeVat);
      return aVat.priceExVat - bVat.priceExVat;
    })
    : sortOffers(deliverableOffers, searchParams.sort ?? null);
  const lowPrice = offers.length > 0
    ? floorToTwoDecimals(Math.min(...offers.map((offer) => calculateVatPrices(offer.price, offer.shopCountryCode, offer.pricesIncludeVat).priceExVat)))
    : null;
  const galleryImages = product.gallery.slice(0, 3);
  const thumbnailImages = galleryImages.slice(1, 3);

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.productName,
    gtin13: product.ean,
    image: product.imageUrl,
    description: product.description,
    brand: { "@type": "Brand", name: product.brand },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "DKK",
      lowPrice: lowPrice ?? undefined,
      offerCount: offers.length,
      offers: offers.map((offer) => ({
        "@type": "Offer",
        price: calculateVatPrices(offer.price, offer.shopCountryCode, offer.pricesIncludeVat).priceExVat,
        priceCurrency: offer.currency,
        availability: offer.stockStatus === "in_stock" ? "https://schema.org/InStock" : "https://schema.org/LimitedAvailability",
        url: offer.productUrl,
        seller: { "@type": "Organization", name: offer.shopName }
      }))
    }
  };

  return (
    <main className="shell">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <section className="product-layout">
        <div className="panel">
          <img className="product-image" src={product.imageUrl} alt={product.productName} />
        </div>
        <div className="panel">
          <h1>{product.productName}</h1>
          <p className="muted">{product.description}</p>
          <p><strong>EAN:</strong> {product.ean}</p>
          <p><strong>Brand:</strong> {product.brand}</p>
          <form className="country-selector">
            <label htmlFor="country">Where are you shopping from?</label>
            <select id="country" name="country" defaultValue={selectedCountry}>
              {shoppingCountries.map((country) => (
                <option key={country.code} value={country.code}>{country.name}</option>
              ))}
            </select>
            <input type="hidden" name="sort" value={searchParams.sort ?? "cheapest"} />
            <button className="secondary-button" type="submit">Update prices</button>
          </form>
          <p className="price">
            {lowPrice === null ? `No shops deliver to ${selectedCountryName}` : `Lowest price to ${selectedCountryName}: ${formatPrice(lowPrice)} DKK excl. VAT`}
          </p>
          <p className="muted">Only shops that deliver to {selectedCountryName} are shown.</p>
        </div>
      </section>

      <section className="panel" style={{ marginTop: 16 }}>
        <form className="form-grid" style={{ gridTemplateColumns: "1fr 220px", marginBottom: 12 }}>
          <h2>Best price for {product.productName}</h2>
          <input type="hidden" name="country" value={selectedCountry} />
          <select name="sort" defaultValue={searchParams.sort ?? "cheapest"} aria-label="Sort offers">
            <option value="cheapest">Cheapest price excl. VAT</option>
            <option value="fastest-delivery">Fastest delivery</option>
            <option value="shop-rating">Shop name</option>
            <option value="newest">Newest offer</option>
          </select>
        </form>
        <table className="offer-table">
          <thead>
            <tr>
              <th>Shop</th>
              <th>Feed title</th>
              <th>Stock</th>
              <th>Delivery</th>
              <th>VAT basis</th>
              <th>Price excl. VAT</th>
              <th>Price incl. VAT</th>
              <th aria-label="Shop link"></th>
            </tr>
          </thead>
          <tbody>
            {offers.length === 0 ? (
              <tr>
                <td colSpan={8}>No shops in this comparison currently deliver to {selectedCountryName}.</td>
              </tr>
            ) : null}
            {offers.map((offer) => (
              <tr key={offer.id}>
                <td>
                  <div className="shop-identity">
                    {offer.shopLogoUrl ? (
                      <img className="shop-logo" src={offer.shopLogoUrl} alt={offer.shopName} />
                    ) : (
                      <strong>{offer.shopName}</strong>
                    )}
                  </div>
                </td>
                <td>{offer.productTitle}</td>
                <td><span className={`stock-pill ${stockTone(offer.stockStatus)}`}>{stockLabel(offer.stockStatus)}</span></td>
                <td>{offer.deliveryTime}</td>
                <td>
                  {getCountryName(offer.shopCountryCode)} VAT {(calculateVatPrices(offer.price, offer.shopCountryCode, offer.pricesIncludeVat).vatRate * 100).toLocaleString("en", { maximumFractionDigits: 1 })}%
                </td>
                <td><strong>{formatPrice(calculateVatPrices(offer.price, offer.shopCountryCode, offer.pricesIncludeVat).priceExVat)} {offer.currency}</strong></td>
                <td>{formatPrice(calculateVatPrices(offer.price, offer.shopCountryCode, offer.pricesIncludeVat).priceIncVat)} {offer.currency}</td>
                <td><a className="button" href={trackedShopUrl(offer.productUrl, offer.shopName)}>Go to shop</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="panel seo-panel" style={{ marginTop: 16 }}>
        <div>
          <h2>{product.seoTitle}</h2>
          <p>{product.seoDescription}</p>
        </div>
        <div className="seo-gallery" aria-label={`${product.productName} image gallery`}>
          <img className="seo-gallery-main" src={galleryImages[0] ?? product.imageUrl} alt={product.productName} />
          {thumbnailImages.length > 0 ? (
            <div className="seo-gallery-thumbs">
              {thumbnailImages.map((image, index) => (
                <img key={image} src={image} alt={`${product.productName} image ${index + 2}`} />
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="panel" style={{ marginTop: 16 }}>
        <h2>Specifications</h2>
        <div className="product-grid">
          {Object.entries(product.specifications).map(([key, value]) => (
            <div className="stat" key={key}><strong>{key}</strong><span>{value}</span></div>
          ))}
        </div>
      </section>
    </main>
  );
}
