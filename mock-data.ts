import Link from "next/link";
import { products } from "@/lib/data/mock-data";

export default function HomePage() {
  const activeOffers = products.reduce((total, product) => total + product.offers.length, 0);

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
          <form className="search-form" action="/search">
            <input name="q" placeholder="Try 5901234123457 or headphones" />
            <button type="submit">Find products</button>
          </form>
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
                <p className="muted">{product.brand} · {product.category} · EAN {product.ean}</p>
                <span className="price">from {Math.min(...product.offers.map((offer) => offer.price))} DKK</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
