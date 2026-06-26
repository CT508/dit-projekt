import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminNav } from "../../../AdminNav";
import { findProductByEan } from "@/lib/data/products-db";
import { EditMasterProductForm } from "./EditMasterProductForm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function EditMasterProductPage({ params }: { params: { ean: string } }) {
  const product = await findProductByEan(params.ean);
  if (!product) {
    notFound();
  }

  return (
    <main className="shell">
      <AdminNav />
      <section className="panel">
        <span className="badge">APPROVED MASTER EAN</span>
        <h1>Edit {product.productName}</h1>
        <p className="muted">Manage master SEO, content, specifications and uploaded WebP product images. Changes are saved directly to PostgreSQL.</p>
        <div className="admin-actions">
          <Link className="secondary-button" href={`/p/${product.ean}/${product.slug}`}>View public page</Link>
          <Link className="secondary-button" href="/admin/import-logs">View matching feed rows</Link>
        </div>
      </section>

      <EditMasterProductForm product={product} />
    </main>
  );
}
