import Link from "next/link";
import { searchProducts } from "@/lib/data/mock-data";

export default function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const query = searchParams.q ?? "";
  const results = searchProducts(query);

  return (
    <main className="shell">
      <section className="panel">
        <h1>Search results</h1>
        <p className="muted">
          Discovery can search titles and categories, but offer-to-product matching still uses EAN only.
        </p>
        <div className="form-grid" style={{ gridTemplateColumns: "repeat(5, minmax(0, 1fr))" }}>
          <select><option>Category</option><option>Headphones</option><option>Smartphones</option></select>
          <select><option>Shop</option><option>SoundStreet</option><option>MobileHub</option></select>
          <select><option>Delivery</option><option>1-2 days</option><option>2-4 days</option></select>
          <select><option>Availability</option><option>In stock</option><option>Limited stock</option></select>
          <select><option>Sort: cheapest</option><option>Fastest delivery</option><option>Shop rating</option><option>Newest offer</option></select>
        </div>
      </section>

      <section className="product-grid" style={{ marginTop: 16 }}>
        {results.map((product) => (
          <Link className="product-card" key={product.ean} href={`/p/${product.ean}/${product.slug}`}>
            <img src={product.imageUrl} alt="" />
            <div>
              <strong>{product.productName}</strong>
              <p className="muted">{product.category} | EAN {product.ean}</p>
              <span className="price">{product.offers.length} offers</span>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
