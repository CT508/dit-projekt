import { AdminNav } from "../../AdminNav";

export default function NewMasterProductPage() {
  return (
    <main className="shell">
      <AdminNav />
      <section className="panel">
        <h1>Add master product</h1>
        <p className="muted">Create a new approved EAN record. Shop offers can only attach after this EAN is approved.</p>
      </section>

      <section className="admin-layout" style={{ marginTop: 16 }}>
        <form className="panel admin-form">
          <h2>Product identity</h2>
          <div className="field-grid">
            <label><span>EAN</span><input defaultValue="8715946668031" /></label>
            <label><span>Status</span><select defaultValue="APPROVED"><option>APPROVED</option><option>PENDING</option><option>DISABLED</option></select></label>
            <label><span>Product name</span><input defaultValue="Epson Cyan T44J2 - 700 ml blækpatron" /></label>
            <label><span>Slug</span><input defaultValue="epson-cyan-t44j2-700-ml-blaekpatron" /></label>
            <label><span>Brand</span><input defaultValue="Epson" /></label>
            <label><span>Category</span><select defaultValue="Printer Ink"><option>Printer Ink</option><option>Headphones</option><option>Smartphones</option></select></label>
          </div>

          <h2>SEO data</h2>
          <label><span>SEO title</span><input defaultValue="Epson Cyan T44J2 700 ml - prices, offers and specifications" /></label>
          <label><span>Meta description</span><textarea defaultValue="Compare prices for Epson Cyan T44J2 700 ml ink cartridge. Approved EAN 8715946668031, SKU C13T44J240, stock, delivery and shop offers." /></label>
          <label><span>Canonical URL</span><input defaultValue="/p/8715946668031/epson-cyan-t44j2-700-ml-blaekpatron" /></label>

          <h2>Product content</h2>
          <label><span>Description</span><textarea defaultValue="Cyan 700 ml ink cartridge for Epson SureColor P7500 and P9500. This master text is controlled by admin and used on the public product comparison page." /></label>
          <label><span>Specifications JSON</span><textarea defaultValue={'{"SKU":"C13T44J240","Color":"Cyan","Volume":"700 ml","Compatibility":"Epson SureColor P7500, Epson SureColor P9500"}'} /></label>

          <h2>Images</h2>
          <label><span>Main image URL</span><input defaultValue="https://www.grafisk-handel.dk/images/a1234-hires-en-int-surecolor_sc-p7500-sc-p9500_c_700 kopier.jpg" /></label>
          <label><span>Gallery image URLs, one per line</span><textarea defaultValue={"https://www.grafisk-handel.dk/images/a1234-hires-en-int-surecolor_sc-p7500-sc-p9500_c_700 kopier.jpg\nhttps://www.grafisk-handel.dk/images/Epson T44J2.webp"} /></label>

          <div className="admin-actions">
            <button className="button" type="button">Save draft</button>
            <button className="button" type="button">Approve master EAN</button>
          </div>
        </form>

        <aside className="panel">
          <h2>Approval rules</h2>
          <ul className="check-list">
            <li>EAN must normalize and pass checksum.</li>
            <li>EAN becomes the only matching key for shop offers.</li>
            <li>SKU/MPN is saved only as metadata.</li>
            <li>Admin SEO copy becomes the source for public pages.</li>
          </ul>
        </aside>
      </section>
    </main>
  );
}

