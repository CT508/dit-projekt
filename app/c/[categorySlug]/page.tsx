import Link from "next/link";
import { getProducts } from "@/lib/data/products-db";

export default async function CategoryPage({ params }: { params: { categorySlug: string } }) {
  const products = await getProducts();
  const categoryName = params.categorySlug.replace(/-/g, " ");
  const results = products.filter((product) => {
    return product.category.toLowerCase().replace(/\s+/g, "-") === params.categorySlug;
  });

  return (
    <main className="shell">
      <section className="panel">
        <h1>{categoryName}</h1>
        <p className="muted">
          SEO category page with filters. Products shown here are approved master products; offers are still attached only by EAN.
        </p>
        <div className="form-grid" style={{ gridTemplateColumns: "repeat(5, minmax(0, 1fr))" }}>
          <select><option>Price</option></select>
          <select><option>Shop</option></select>
          <select><option>Delivery time</option></select>
          <select><option>Availability</option></select>
          <select><option>Sort by cheapest</option></select>
        </div>
      </section>
      <section className="product-grid" style={{ marginTop: 16 }}>
        {results.map((product) => (
          <Link className="product-card" key={product.ean} href={`/p/${product.ean}/${product.slug}`}>
            <img src={product.imageUrl} alt="" />
            <div>
              <strong>{product.productName}</strong>
              <p className="muted">EAN {product.ean}</p>
              <span className="price">{product.offers.length} offers</span>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
