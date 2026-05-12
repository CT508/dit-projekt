const exampleXml = `<products>
  <product>
    <ean>8715946668031</ean>
    <product_title>Epson Cyan T44J2 - 700 ml ink cartridge</product_title>
    <price>2039.68</price>
    <currency>DKK</currency>
    <product_url>https://www.grafisk-handel.dk/shop/epson-cyan-t44j2-9732p.html</product_url>
    <image_url>https://www.grafisk-handel.dk/images/a1234-hires-en-int-surecolor_sc-p7500-sc-p9500_c_700 kopier.jpg</image_url>
    <stock_status>in_stock</stock_status>
    <delivery_time>3 days</delivery_time>
  </product>
  <product>
    <ean>8715946668032</ean>
    <product_title>Epson Cyan T44J2 wrong checksum test row</product_title>
    <price>2039.68</price>
    <currency>DKK</currency>
    <product_url>https://www.grafisk-handel.dk/shop/epson-cyan-t44j2-9732p.html</product_url>
    <image_url>https://www.grafisk-handel.dk/images/a1234-hires-en-int-surecolor_sc-p7500-sc-p9500_c_700 kopier.jpg</image_url>
    <stock_status>in_stock</stock_status>
    <delivery_time>3 days</delivery_time>
  </product>
</products>`;

export default function FeedUploadPage() {
  return (
    <main className="shell">
      <section className="panel">
        <h1>XML feed upload</h1>
        <p className="muted">
          Every product is normalized and validated against the approved master EAN database before it can be published.
        </p>
        <form className="form-grid" action="/api/shop/imports/xml" method="post">
          <div className="field-grid">
            <label>
              Shop name
              <input name="shopName" defaultValue="Grafisk Handel" />
            </label>
            <label>
              Shop country
              <select name="shopCountryCode" defaultValue="DK">
                <option value="DK">Denmark</option>
                <option value="DE">Germany</option>
                <option value="NL">Netherlands</option>
                <option value="PL">Poland</option>
                <option value="SE">Sweden</option>
              </select>
            </label>
          </div>
          <label>
            Delivers to countries
            <input name="deliveryCountries" defaultValue="DK,SE" />
          </label>
          <label>
            Scheduled feed URL
            <input name="feedUrl" placeholder="https://shop.example.com/feed.xml" />
          </label>
          <label>
            Feed format
            <input name="feedType" value="XML" readOnly />
          </label>
          <label className="checkbox-row">
            <input name="pricesIncludeVat" type="checkbox" defaultChecked />
            <span>Prices in this feed include VAT</span>
          </label>
          <label>
            XML content
            <textarea name="xml" defaultValue={exampleXml} />
          </label>
          <button className="button" type="submit">Import XML feed</button>
        </form>
      </section>
      <section className="panel" style={{ marginTop: 16 }}>
        <h2>Required XML fields</h2>
        <p>ean, product_title, price, currency, product_url, image_url, stock_status, delivery_time</p>
        <p className="muted">Shipping cost is not imported or shown. Price comparison is based on product price only.</p>
      </section>
    </main>
  );
}
