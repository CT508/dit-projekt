import { notFound } from "next/navigation";
import { findProductByEan, sortOffers } from "@/lib/data/mock-data";

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
  const lowPrice = Math.min(...offers.map((offer) => offer.price + offer.shippingCost));

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
          <span className="badge">Approved master EAN</span>
          <h1>{product.productName}</h1>
          <p className="muted">{product.description}</p>
          <p><strong>EAN:</strong> {product.ean}</p>
          <p><strong>Brand:</strong> {product.brand} · <strong>Category:</strong> {product.category}</p>
          <p className="price">Lowest total price: {lowPrice} DKK</p>
        </div>
      </section>

      <section className="panel" style={{ marginTop: 16 }}>
        <h2>Price offers matched only by EAN {product.ean}</h2>
        <form className="form-grid" style={{ gridTemplateColumns: "1fr 220px", marginBottom: 12 }}>
          <span className="muted">No title, SKU, fuzzy, AI, or fallback matching is used.</span>
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
              <th>Total</th>
              <th>CTA</th>
            </tr>
          </thead>
          <tbody>
            {offers.map((offer) => (
              <tr key={offer.id}>
                <td><strong>{offer.shopName}</strong><br /><span className="muted">{offer.shopRating}/5</span></td>
                <td>{offer.productTitle}</td>
                <td>{offer.stockStatus}</td>
                <td>{offer.deliveryTime}</td>
                <td><strong>{offer.price + offer.shippingCost} {offer.currency}</strong><br /><span className="muted">shipping {offer.shippingCost}</span></td>
                <td><a className="button" href={offer.productUrl}>Go to shop</a></td>
              </tr>
            ))}
          </tbody>
        </table>
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

