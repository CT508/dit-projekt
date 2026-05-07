import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminNav } from "../../../AdminNav";
import { findProductByEan } from "@/lib/data/mock-data";

export default function EditMasterProductPage({ params }: { params: { ean: string } }) {
  const product = findProductByEan(params.ean);
  if (!product) {
    notFound();
  }

  return (
    <main className="shell">
      <AdminNav />
      <section className="panel">
        <span className="badge">APPROVED MASTER EAN</span>
        <h1>Edit {product.productName}</h1>
        <p className="muted">Manage the master SEO, canonical content, gallery and specifications for this product page.</p>
        <div className="admin-actions">
          <Link className="secondary-button" href={`/p/${product.ean}/${product.slug}`}>View public page</Link>
          <Link className="secondary-button" href="/admin/import-logs">View matching feed rows</Link>
        </div>
      </section>

      <section className="admin-layout" style={{ marginTop: 16 }}>
        <form className="panel admin-form">
          <h2>Product identity</h2>
          <div className="field-grid">
            <label><span>EAN</span><input defaultValue={product.ean} readOnly /></label>
            <label><span>Status</span><select defaultValue="APPROVED"><option>APPROVED</option><option>PENDING</option><option>DISABLED</option></select></label>
            <label><span>Product name</span><input defaultValue={product.productName} /></label>
            <label><span>Slug</span><input defaultValue={product.slug} /></label>
            <label><span>Brand</span><input defaultValue={product.brand} /></label>
            <label><span>Category</span><input defaultValue={product.category} /></label>
          </div>

          <h2>Master SEO data</h2>
          <label><span>SEO title</span><input defaultValue={product.seoTitle} /></label>
          <label><span>Meta description</span><textarea defaultValue={product.seoDescription} /></label>
          <label><span>Canonical URL</span><input defaultValue={product.canonicalUrl} /></label>

          <h2>Admin product content</h2>
          <label><span>Product description</span><textarea defaultValue={product.description} /></label>
          <label><span>Specifications JSON</span><textarea defaultValue={JSON.stringify(product.specifications, null, 2)} /></label>

          <h2>Image gallery</h2>
          <label><span>Main image URL</span><input defaultValue={product.imageUrl} /></label>
          <label><span>Gallery image URLs</span><textarea defaultValue={product.gallery.join("\n")} /></label>

          <div className="admin-actions">
            <button className="button" type="button">Save changes</button>
            <button className="secondary-button" type="button">Disable product</button>
            <button className="secondary-button" type="button">Regenerate SEO preview</button>
          </div>
        </form>

        <aside className="panel">
          <h2>Gallery preview</h2>
          <div className="gallery-grid">
            {product.gallery.map((image, index) => (
              <div className="gallery-item" key={image}>
                <img src={image} alt="" />
                <div><strong>Image {index + 1}</strong><p className="muted">Drag ordering in production UI</p></div>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
}

