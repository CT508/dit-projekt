import Link from "next/link";
import { products } from "@/lib/data/mock-data";

export default function AdminDashboardPage() {
  const activeOffers = products.flatMap((product) => product.offers).length;

  return (
    <main className="shell">
      <section className="panel">
        <h1>Admin dashboard</h1>
        <p className="muted">Admin controls the master EAN database, shops, imports, commissions, and settings.</p>
        <Link className="button" href="/admin/master-eans">Manage master EANs</Link>
      </section>
      <section className="stat-grid" style={{ marginTop: 16 }}>
        <div className="stat"><strong>{products.length}</strong><span>total approved EANs</span></div>
        <div className="stat"><strong>3</strong><span>active shops</span></div>
        <div className="stat"><strong>{activeOffers}</strong><span>active offers</span></div>
        <div className="stat"><strong>3</strong><span>rejected offers</span></div>
        <div className="stat"><strong>0</strong><span>products without offers</span></div>
        <div className="stat"><strong>3</strong><span>import errors</span></div>
      </section>
    </main>
  );
}

