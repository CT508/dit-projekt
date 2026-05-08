export default function ShopProfilePage() {
  return (
    <main className="shell">
      <section className="panel">
        <h1>Shop profile</h1>
        <p className="muted">
          This public shop profile is used for logos, offer pages, contact details, and trust information.
        </p>
        <form className="admin-form">
          <div className="field-grid">
            <label><span>Shop name</span><input name="shopName" defaultValue="Grafisk Handel" /></label>
            <label><span>Website URL</span><input name="websiteUrl" defaultValue="https://www.grafisk-handel.dk" /></label>
            <label>
              <span>Shop country for VAT</span>
              <select name="countryCode" defaultValue="DK">
                <option value="AT">Austria</option>
                <option value="BE">Belgium</option>
                <option value="BG">Bulgaria</option>
                <option value="HR">Croatia</option>
                <option value="CY">Cyprus</option>
                <option value="CZ">Czech Republic</option>
                <option value="DK">Denmark</option>
                <option value="EE">Estonia</option>
                <option value="FI">Finland</option>
                <option value="FR">France</option>
                <option value="DE">Germany</option>
                <option value="GR">Greece</option>
                <option value="HU">Hungary</option>
                <option value="IE">Ireland</option>
                <option value="IT">Italy</option>
                <option value="LV">Latvia</option>
                <option value="LT">Lithuania</option>
                <option value="LU">Luxembourg</option>
                <option value="MT">Malta</option>
                <option value="NL">Netherlands</option>
                <option value="PL">Poland</option>
                <option value="PT">Portugal</option>
                <option value="RO">Romania</option>
                <option value="SK">Slovakia</option>
                <option value="SI">Slovenia</option>
                <option value="ES">Spain</option>
                <option value="SE">Sweden</option>
              </select>
            </label>
            <label><span>Contact email</span><input name="contactEmail" defaultValue="info@grafisk-handel.dk" /></label>
            <label><span>Contact phone</span><input name="contactPhone" defaultValue="+45 00 00 00 00" /></label>
          </div>
          <label>
            <span>Shop logo</span>
            <input name="logo" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" />
          </label>
          <label>
            <span>Logo URL for preview</span>
            <input name="logoUrl" defaultValue="https://www.google.com/s2/favicons?domain=www.grafisk-handel.dk&sz=128" />
          </label>
          <label>
            <span>Short shop description</span>
            <textarea
              name="description"
              maxLength={7000}
              defaultValue="Grafisk Handel supplies professional print, ink, media, and production products to businesses across Denmark and selected EU markets."
            />
          </label>
          <p className="muted">Maximum 1000 words. Keep it factual, useful, and written for shoppers comparing offers.</p>
          <div className="admin-actions">
            <button className="button" type="button">Save profile</button>
            <button className="secondary-button" type="button">Preview public profile</button>
          </div>
        </form>
      </section>
    </main>
  );
}
