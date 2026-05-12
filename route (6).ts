import Link from "next/link";
import { AdminNav } from "../AdminNav";
import { products } from "@/lib/data/mock-data";

export default function AdminDashboardPage() {
  const activeOffers = products.flatMap((product) => product.offers).length;

  return (
    <main className="shell">
      <AdminNav />
      <section className="panel">
        <h1>Admin dashboard</h1>
        <p className="muted">Control master products, SEO, media, shop feeds, import errors, categories, commissions and site settings.</p>
        <div className="admin-actions">
          <Link className="button" href="/admin/master-eans/new">Add master product</Link>
          <Link className="secondary-button" href="/admin/master-eans/import">Import master CSV</Link>
          <Link className="secondary-button" href="/admin/master-eans">Manage products</Link>
          <Link className="secondary-button" href="/admin/import-logs">Review imports</Link>
        </div>
      </section>
      <section className="stat-grid" style={{ marginTop: 16 }}>
        <div className="stat"><strong>{products.length}</strong><span>total approved EANs</span></div>
        <div className="stat"><strong>3</strong><span>active shops</span></div>
        <div className="stat"><strong>{activeOffers}</strong><span>active offers</span></div>
        <div className="stat"><strong>3</strong><span>rejected offers</span></div>
        <div className="stat"><strong>0</strong><span>products without offers</span></div>
        <div className="stat"><strong>3</strong><span>import errors</span></div>
      </section>
      <section className="admin-layout" style={{ marginTop: 16 }}>
        <div className="panel">
          <h2>Admin work queue</h2>
          <table className="offer-table">
            <thead>
              <tr><th>Task</th><th>Area</th><th>Action</th></tr>
            </thead>
            <tbody>
              <tr><td>Approve rejected EANs from shop feeds</td><td>Imports</td><td><Link href="/admin/import-logs">Review</Link></td></tr>
              <tr><td>Improve Epson product SEO copy and gallery</td><td>Master products</td><td><Link href="/admin/master-eans/8715946668031/edit">Edit</Link></td></tr>
              <tr><td>Create printer ink category landing copy</td><td>Categories</td><td><Link href="/admin/categories">Open</Link></td></tr>
            </tbody>
          </table>
        </div>
        <aside className="panel">
          <h2>Admin controls</h2>
          <ul className="check-list">
            <li>Create and approve master EAN records</li>
            <li>Edit SEO title, meta description, canonical URL and page text</li>
            <li>Manage product images and gallery ordering</li>
            <li>Review rejected shop feed rows</li>
            <li>Manage shops, commissions, categories and settings</li>
          </ul>
        </aside>
      </section>
    </main>
  );
}
