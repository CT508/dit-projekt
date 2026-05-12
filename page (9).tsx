import { AdminNav } from "../../AdminNav";

const exampleCsv = `supplier_ean;supplier_name;maker;group;main_image;short_text;meta_title;meta_description;extra_images;specs
8715946668031;Epson Cyan T44J2 - 700 ml ink cartridge;Epson;Printer Ink;https://www.grafisk-handel.dk/images/a1234-hires-en-int-surecolor_sc-p7500-sc-p9500_c_700 kopier.jpg;Cyan 700 ml ink cartridge for Epson SureColor P7500 and P9500.;Epson Cyan T44J2 700 ml - prices and specifications;Compare prices for Epson Cyan T44J2 700 ml ink cartridge.;https://example.com/image-2.jpg|https://example.com/image-3.jpg;SKU=C13T44J240|Color=Cyan|Volume=700 ml`;

const csvColumns = [
  "Ignore column",
  "supplier_ean",
  "supplier_name",
  "maker",
  "group",
  "main_image",
  "short_text",
  "meta_title",
  "meta_description",
  "extra_images",
  "specs"
];

const targetFields = [
  { name: "ean", label: "EAN", required: true, defaultColumn: "supplier_ean" },
  { name: "productName", label: "Product name", required: true, defaultColumn: "supplier_name" },
  { name: "brand", label: "Brand", required: false, defaultColumn: "maker" },
  { name: "category", label: "Category", required: false, defaultColumn: "group" },
  { name: "imageUrl", label: "Main image URL", required: false, defaultColumn: "main_image" },
  { name: "description", label: "Description", required: false, defaultColumn: "short_text" },
  { name: "seoTitle", label: "SEO title", required: false, defaultColumn: "meta_title" },
  { name: "seoDescription", label: "SEO description", required: false, defaultColumn: "meta_description" },
  { name: "gallery", label: "Gallery URLs", required: false, defaultColumn: "extra_images" },
  { name: "specifications", label: "Specifications", required: false, defaultColumn: "specs" }
];

export default function AdminMasterProductImportPage() {
  return (
    <main className="shell">
      <AdminNav />
      <section className="panel">
        <h1>Import master products from CSV</h1>
        <p className="muted">
          Upload a supplier master product file, map their columns to our master product fields, and validate EANs before records are approved.
        </p>
        <form className="admin-form" action="/api/admin/master-products/import" method="post" encType="multipart/form-data">
          <div className="field-grid">
            <label>
              <span>CSV file</span>
              <input name="file" type="file" accept=".csv,text/csv" />
            </label>
            <label>
              <span>Delimiter</span>
              <select name="delimiter" defaultValue=";">
                <option value=";">Semicolon (;)</option>
                <option value=",">Comma (,)</option>
                <option value="tab">Tab</option>
              </select>
            </label>
          </div>
          <label>
            <span>Or paste CSV content for testing</span>
            <textarea name="csv" defaultValue={exampleCsv} />
          </label>

          <section className="mapping-grid" aria-label="CSV field mapping">
            <div className="mapping-heading">Master field</div>
            <div className="mapping-heading">Supplier CSV column</div>
            <div className="mapping-heading">Required</div>
            {targetFields.map((field) => (
              <div className="mapping-row" key={field.name}>
                <strong>{field.label}</strong>
                <select name={`map_${field.name}`} defaultValue={field.defaultColumn}>
                  {csvColumns.map((column) => (
                    <option key={column} value={column === "Ignore column" ? "" : column}>{column}</option>
                  ))}
                </select>
                <span>{field.required ? "Yes" : "No"}</span>
              </div>
            ))}
          </section>

          <div className="admin-actions">
            <button className="button" type="submit">Validate CSV mapping</button>
            <button className="secondary-button" type="button">Save mapping template</button>
          </div>
        </form>
      </section>

      <section className="panel" style={{ marginTop: 16 }}>
        <h2>Import rules</h2>
        <ul className="check-list">
          <li>EAN is required and must pass normalization and checksum validation.</li>
          <li>Product name is required for new master products.</li>
          <li>Existing EANs are updated with mapped SEO, text, category, brand and image data.</li>
          <li>Gallery URLs can be separated with a pipe character.</li>
          <li>Specifications can be imported as key=value pairs separated with a pipe character.</li>
        </ul>
      </section>
    </main>
  );
}
