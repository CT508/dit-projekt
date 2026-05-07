import { AdminNav } from "../AdminNav";

export default function AdminCategoriesPage() {
  return (
    <main className="shell">
      <AdminNav />
      <section className="panel">
        <h1>Category management</h1>
        <p className="muted">Manage category hierarchy, SEO landing pages, filters and internal linking.</p>
        <div className="admin-actions">
          <button className="button" type="button">Add category</button>
          <button className="secondary-button" type="button">Rebuild category sitemap</button>
        </div>
      </section>

      <section className="panel" style={{ marginTop: 16 }}>
        <table className="offer-table">
          <thead>
            <tr><th>Category</th><th>Slug</th><th>SEO status</th><th>Products</th><th>Filters</th><th>Actions</th></tr>
          </thead>
          <tbody>
            <tr><td>Printer Ink</td><td>printer-ink</td><td><span className="badge">Ready</span></td><td>1</td><td>Brand, color, volume, compatibility</td><td>Edit SEO · Filters</td></tr>
            <tr><td>Headphones</td><td>headphones</td><td><span className="badge">Ready</span></td><td>1</td><td>Brand, ANC, battery</td><td>Edit SEO · Filters</td></tr>
            <tr><td>Smartphones</td><td>smartphones</td><td><span className="badge">Ready</span></td><td>1</td><td>Storage, display, camera</td><td>Edit SEO · Filters</td></tr>
          </tbody>
        </table>
      </section>

      <section className="panel" style={{ marginTop: 16 }}>
        <h2>Category SEO editor</h2>
        <form className="admin-form">
          <div className="field-grid">
            <label><span>Name</span><input defaultValue="Printer Ink" /></label>
            <label><span>Slug</span><input defaultValue="printer-ink" /></label>
          </div>
          <label><span>SEO title</span><input defaultValue="Printer ink prices - compare cartridges by EAN" /></label>
          <label><span>SEO description</span><textarea defaultValue="Compare printer ink prices from approved shop offers. Products are matched by EAN only, with filters for brand, color, volume, stock and delivery." /></label>
          <label><span>Landing page intro</span><textarea defaultValue="Find printer ink and cartridges from approved master EAN records. Compare price, delivery, stock and shop data before buying." /></label>
        </form>
      </section>
    </main>
  );
}
