const exampleCsv = `ean,product_title,price,currency,product_url,image_url,stock_status,delivery_time,shipping_cost
8715946668031,Epson Cyan T44J2 - 700 ml blaekpatron,2039.68,DKK,https://www.grafisk-handel.dk/shop/epson-cyan-t44j2-9732p.html,https://www.grafisk-handel.dk/images/a1234-hires-en-int-surecolor_sc-p7500-sc-p9500_c_700 kopier.jpg,in_stock,3 days,43.75
8715946668032,Epson Cyan T44J2 wrong checksum test row,2039.68,DKK,https://www.grafisk-handel.dk/shop/epson-cyan-t44j2-9732p.html,https://www.grafisk-handel.dk/images/a1234-hires-en-int-surecolor_sc-p7500-sc-p9500_c_700 kopier.jpg,in_stock,3 days,43.75`;

export default function FeedUploadPage() {
  return (
    <main className="shell">
      <section className="panel">
        <h1>Feed upload</h1>
        <p className="muted">
          Every row is normalized and validated against the approved master EAN database before it can be published.
        </p>
        <form className="form-grid" action="/api/shop/imports/csv" method="post">
          <label>
            Feed type
            <select name="feedType" defaultValue="CSV">
              <option>CSV</option>
              <option>XML</option>
              <option>Google Merchant XML</option>
              <option>API</option>
            </select>
          </label>
          <label>
            CSV content
            <textarea name="csv" defaultValue={exampleCsv} />
          </label>
          <button className="button" type="submit">Validate feed</button>
        </form>
      </section>
      <section className="panel" style={{ marginTop: 16 }}>
        <h2>Required columns</h2>
        <p>ean, product_title, price, currency, product_url, image_url, stock_status, delivery_time, shipping_cost</p>
      </section>
    </main>
  );
}
