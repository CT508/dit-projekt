import { notFound } from "next/navigation";
import { findProductByEan, sortOffers } from "@/lib/data/mock-data";

function floorToTwoDecimals(value: number) {
  return Math.floor(value * 100) / 100;
}

function formatPrice(value: number) {
  return floorToTwoDecimals(value).toFixed(2);
}

function stockLabel(stockStatus: string) {
  if (stockStatus === "in_stock") {
    return "På lager";
  }

  if (stockStatus === "limited_stock") {
    return "Få på lager";
  }

  return "Ikke på lager";
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

export default function ProductPage({
  params,
  searchParams
}: {
  params: { ean: string; slug: string };
  searchParams: { sort?: string };
}) {
  const product = findProductByEan(params.ean);
  if (!product) {
    notFound();
  }

  const offers = sortOffers(product.offers, searchParams.sort ?? null);
  const lowPrice = floorToTwoDecimals(Math.min(...offers.map((offer) => offer.price + offer.shippingCost)));

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
      lowPrice,
      offerCount: offers.length,
      offers: offers.map((offer) => ({
        "@type": "Offer",
        price: offer.price,
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
          <p className="price">Lowest price: {formatPrice(lowPrice)} DKK</p>
        </div>
      </section>

      <section className="panel" style={{ marginTop: 16 }}>
        <form className="form-grid" style={{ gridTemplateColumns: "1fr 220px", marginBottom: 12 }}>
          <h2>Price offers</h2>
          <select name="sort" defaultValue={searchParams.sort ?? "cheapest"} aria-label="Sort offers">
            <option value="cheapest">Cheapest total price</option>
            <option value="fastest-delivery">Fastest delivery</option>
            <option value="shop-rating">Shop rating</option>
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
              <th>Price</th>
              <th aria-label="Shop link"></th>
            </tr>
          </thead>
          <tbody>
            {offers.map((offer) => (
              <tr key={offer.id}>
                <td>
                  <div className="shop-identity">
                    {offer.shopLogoUrl ? (
                      <img className="shop-logo" src={offer.shopLogoUrl} alt={offer.shopName} />
                    ) : (
                      <strong>{offer.shopName}</strong>
                    )}
                    <span className="muted">{offer.shopRating}/5</span>
                  </div>
                </td>
                <td>{offer.productTitle}</td>
                <td><span className={`stock-pill ${stockTone(offer.stockStatus)}`}>{stockLabel(offer.stockStatus)}</span></td>
                <td>{offer.deliveryTime}</td>
                <td><strong>{formatPrice(offer.price + offer.shippingCost)} {offer.currency}</strong><br /><span className="muted">shipping {formatPrice(offer.shippingCost)}</span></td>
                <td><a className="button" href={trackedShopUrl(offer.productUrl, offer.shopName)}>{offer.shopName}</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="panel seo-panel" style={{ marginTop: 16 }}>
        <h2>{product.seoTitle}</h2>
        <p>{product.seoDescription}</p>
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
