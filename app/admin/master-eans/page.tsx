import Link from "next/link";
import { AdminNav } from "../AdminNav";
import { getProducts } from "@/lib/data/products-db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminMasterEansPage() {
  const products = await getProducts();

  return (
    <main className="shell">
      <AdminNav />
      <section className="panel">
        <h1>Master product management</h1>
        <p className="muted">Create, approve and enrich master EAN records. EAN is the identity; SEO, text and media are admin-managed metadata.</p>
        <div className="admin-actions">
          <Link className="button" href="/admin/master-eans/new">Add master product</Link>
          <Link className="secondary-button" href="/admin/master-eans/import">Import CSV</Link>
          <Link className="secondary-button" href="/admin/import-logs">Review rejected feed rows</Link>
        </div>
      </section>
      <section className="panel" style={{ marginTop: 16 }}>
        <table className="offer-table">
          <thead>
            <tr>
              <th>EAN</th>
              <th>Product</th>
              <th>SEO</th>
              <th>Images</th>
              <th>Brand</th>
              <th>Category</th>
              <th>Status</th>
              <th>Offers</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.ean}>
                <td><strong>{product.ean}</strong></td>
                <td>{product.productName}</td>
                <td>{product.seoTitle ? <span className="badge">SEO ready</span> : <span>Missing</span>}</td>
                <td>{product.gallery.length}</td>
                <td>{product.brand}</td>
                <td>{product.category}</td>
                <td><span className="badge">APPROVED</span></td>
                <td>{product.offers.length}</td>
                <td><Link href={`/admin/master-eans/${product.ean}/edit`}>Edit</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section className="panel" style={{ marginTop: 16 }}>
        <h2>Rejected row review queue</h2>
        <div className="error-list">
          <div className="error-item">
            <strong>EAN_NOT_APPROVED</strong>
            <p className="muted">Row can only be reprocessed after an admin approves the EAN as a master product.</p>
          </div>
          <div className="error-item">
            <strong>INVALID_EAN_CHECKSUM</strong>
            <p className="muted">Row cannot be approved without a valid EAN checksum.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
