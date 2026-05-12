import Link from "next/link";
import type { MasterProductView } from "@/lib/data/mock-data";
import { getProducts } from "@/lib/data/products-db";
import { calculateVatPrices } from "@/lib/vat/eu-vat";
import { LiveSearch } from "./components/LiveSearch";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const products = await getProducts();
  const searchProducts = products.map(({ ean, slug, productName, brand, category, imageUrl }) => ({
    ean,
    slug,
    productName,
    brand,
    category,
    imageUrl
  }));
  const activeOffers = products.reduce((total, product) => total + product.offers.length, 0);
  const lowestExVatPrice = (offers: MasterProductView["offers"]) => {
    if (offers.length === 0) {
      return null;
    }

    return Math.min(...offers.map((offer) => {
      return calculateVatPrices(offer.price, offer.shopCountryCode, offer.pricesIncludeVat).priceExVat;
    }));
  };

  return (
    <main className="shell">
      <section className="hero-grid">
        <div className="panel">
          <span className="badge">EAN-only product matching</span>
          <h1>Compare products by approved EAN, never by guesswork.</h1>
          <p className="muted">
            A SaaS price comparison platform for public shoppers, shop owners, and admins.
            Product identity is controlled by the master EAN database.
          </p>
          <LiveSearch products={searchProducts} />
        </div>
        <div className="panel">
          <h2>Platform snapshot</h2>
          <div className="stat-grid">
            <div className="stat"><strong>{products.length}</strong><span>approved EANs</span></div>
            <div className="stat"><strong>{activeOffers}</strong><span>active offers</span></div>
            <div className="stat"><strong>0</strong><span>fallback matches</span></div>
          </div>
        </div>
      </section>

      <section className="panel" style={{ marginTop: 16 }}>
        <h2>Approved master products</h2>
        <div className="product-grid">
          {products.map((product) => (
            <Link className="product-card" key={product.ean} href={`/p/${product.ean}/${product.slug}`}>
              <img src={product.imageUrl} alt="" />
              <div>
                <strong>{product.productName}</strong>
                <p className="muted">{product.brand} | {product.category} | EAN {product.ean}</p>
                <span className="price">
                  {lowestExVatPrice(product.offers) === null ? "No active offers" : `from ${lowestExVatPrice(product.offers)!.toFixed(2)} DKK excl. VAT`}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
