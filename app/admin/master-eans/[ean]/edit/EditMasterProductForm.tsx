"use client";

import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import type { MasterProductView } from "@/lib/data/mock-data";

type EditMasterProductFormProps = {
  product: MasterProductView;
};

export function EditMasterProductForm({ product }: EditMasterProductFormProps) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [mainImagePreview, setMainImagePreview] = useState(product.imageUrl);
  const [galleryPreviews, setGalleryPreviews] = useState(product.gallery);

  const specificationsText = useMemo(() => JSON.stringify(product.specifications, null, 2), [product.specifications]);

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");
    setError("");

    try {
      const formData = new FormData(event.currentTarget);
      const response = await fetch(`/api/admin/master-products/${product.ean}`, {
        method: "PUT",
        body: formData
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.errorMessage ?? result.error ?? "Product update failed.");
      }

      setMessage("Saved. Product data, SEO and gallery were updated.");
      if (result.product?.imageUrl) {
        setMainImagePreview(result.product.imageUrl);
      }
      if (Array.isArray(result.product?.gallery)) {
        setGalleryPreviews(result.product.gallery);
      }
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Product update failed.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="admin-layout" style={{ marginTop: 16 }}>
      <form className="panel admin-form" onSubmit={saveProduct}>
        <h2>Product identity</h2>
        <div className="field-grid">
          <label><span>EAN</span><input name="ean" defaultValue={product.ean} readOnly /></label>
          <label>
            <span>Status</span>
            <select name="status" defaultValue="APPROVED">
              <option>APPROVED</option>
              <option>PENDING</option>
              <option>DISABLED</option>
            </select>
          </label>
          <label><span>Product name</span><input name="productName" defaultValue={product.productName} required /></label>
          <label><span>Manufacturer SKU / part number</span><input name="manufacturerSku" defaultValue={product.manufacturerSku ?? ""} /></label>
          <label><span>Slug</span><input name="slug" defaultValue={product.slug} required /></label>
          <label><span>Brand</span><input name="brand" defaultValue={product.brand} /></label>
          <label><span>Category</span><input name="category" defaultValue={product.category} /></label>
        </div>

        <h2>Master SEO data</h2>
        <label><span>SEO title</span><input name="seoTitle" defaultValue={product.seoTitle} /></label>
        <label><span>Meta description</span><textarea name="seoDescription" defaultValue={product.seoDescription} /></label>
        <label><span>Canonical URL</span><input name="canonicalUrl" defaultValue={product.canonicalUrl} /></label>

        <h2>Admin product content</h2>
        <label><span>Product description</span><textarea name="description" defaultValue={product.description} /></label>
        <label><span>Specifications JSON</span><textarea name="specifications" defaultValue={specificationsText} /></label>

        <h2>Image gallery</h2>
        <label><span>Main image URL</span><input name="imageUrl" defaultValue={product.imageUrl} /></label>
        <label>
          <span>Upload main image</span>
          <input
            name="mainImageFile"
            type="file"
            accept="image/webp,image/png,image/jpeg"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                setMainImagePreview(URL.createObjectURL(file));
              }
            }}
          />
        </label>
        <label><span>Gallery image URLs, one per line</span><textarea name="galleryUrls" defaultValue={product.gallery.join("\n")} /></label>
        <label>
          <span>Upload gallery images</span>
          <input
            name="galleryImageFiles"
            type="file"
            accept="image/webp,image/png,image/jpeg"
            multiple
            onChange={(event) => {
              const files = Array.from(event.target.files ?? []);
              if (files.length > 0) {
                setGalleryPreviews((current) => [...current, ...files.map((file) => URL.createObjectURL(file))]);
              }
            }}
          />
        </label>

        {message ? <div className="success-box">{message}</div> : null}
        {error ? <div className="error-item"><strong>Save failed</strong><span>{error}</span></div> : null}

        <div className="admin-actions">
          <button className="button" type="submit" disabled={isSaving}>{isSaving ? "Saving..." : "Save changes"}</button>
          <button className="secondary-button" type="button">Disable product</button>
          <button className="secondary-button" type="button">Regenerate SEO preview</button>
        </div>
      </form>

      <aside className="panel">
        <h2>Gallery preview</h2>
        <div className="gallery-grid">
          {mainImagePreview ? (
            <div className="gallery-item">
              <img src={mainImagePreview} alt="" />
              <div><strong>Main image</strong><p className="muted">Used first on the product page</p></div>
            </div>
          ) : null}
          {galleryPreviews.map((image, index) => (
            <div className="gallery-item" key={`${image}-${index}`}>
              <img src={image} alt="" />
              <div><strong>Image {index + 1}</strong><p className="muted">Gallery image</p></div>
            </div>
          ))}
        </div>
      </aside>
    </section>
  );
}
