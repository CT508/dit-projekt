import Link from "next/link";
import { getProducts } from "@/lib/data/products-db";

export default async function ShopDashboardPage() {
  const products = await getProducts();
  const activeOffers = products.flatMap((product) => product.offers).length;

  return (
    <main className="shell">
      <section className="panel">
        <h1>Shop dashboard</h1>
        <p className="muted">Shop owners manage profile data, imports, accepted offers, and rejected rows.</p>
        <div className="admin-actions">
          <Link className="button" href="/shop/feed-upload">Upload XML feed</Link>
          <Link className="secondary-button" href="/shop/profile">Edit shop profile</Link>
        </div>
      </section>
      <section className="stat-grid" style={{ marginTop: 16 }}>
        <div className="stat"><strong>{activeOffers}</strong><span>accepted offers</span></div>
        <div className="stat"><strong>3</strong><span>rejected rows</span></div>
        <div className="stat"><strong>0</strong><span>manual product matches allowed</span></div>
      </section>
      <section className="panel" style={{ marginTop: 16 }}>
        <h2>Latest import</h2>
        <table className="offer-table">
          <thead>
            <tr><th>Import</th><th>Status</th><th>Accepted</th><th>Rejected</th><th>Main rejection reason</th></tr>
          </thead>
          <tbody>
            <tr><td>XML upload</td><td>PARTIAL</td><td>42</td><td>3</td><td>EAN_NOT_APPROVED</td></tr>
          </tbody>
        </table>
      </section>
    </main>
  );
}
