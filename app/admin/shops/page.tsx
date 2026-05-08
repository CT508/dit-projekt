import { AdminNav } from "../AdminNav";

export default function AdminShopsPage() {
  return (
    <main className="shell">
      <AdminNav />
      <section className="panel">
        <h1>Shop management</h1>
        <p className="muted">Approve shops, configure feed settings, commissions and click tracking.</p>
        <div className="admin-actions">
          <button className="button" type="button">Add shop</button>
          <button className="secondary-button" type="button">Export shop report</button>
        </div>
      </section>
      <section className="panel" style={{ marginTop: 16 }}>
        <table className="offer-table">
          <thead>
            <tr><th>Shop</th><th>Status</th><th>Rating</th><th>Offers</th><th>Feed</th><th>Commission</th><th>Actions</th></tr>
          </thead>
          <tbody>
            <tr><td>Grafisk Handel</td><td><span className="badge">ACTIVE</span></td><td>4.7</td><td>1</td><td>Google XML URL</td><td>CPA 3%</td><td>Edit · Imports · Suspend</td></tr>
            <tr><td>SoundStreet</td><td><span className="badge">ACTIVE</span></td><td>4.8</td><td>1240</td><td>Daily XML</td><td>CPC 1.80 DKK</td><td>Edit · Imports · Suspend</td></tr>
            <tr><td>NordicTech</td><td><span className="badge">ACTIVE</span></td><td>4.6</td><td>980</td><td>XML URL</td><td>CPC 2.00 DKK</td><td>Edit · Imports · Suspend</td></tr>
          </tbody>
        </table>
      </section>
      <section className="panel" style={{ marginTop: 16 }}>
        <h2>Shop profile editor</h2>
        <form className="admin-form">
          <div className="field-grid">
            <label><span>Shop name</span><input defaultValue="Grafisk Handel" /></label>
            <label><span>Status</span><select defaultValue="ACTIVE"><option>ACTIVE</option><option>PENDING</option><option>SUSPENDED</option></select></label>
            <label><span>Website URL</span><input defaultValue="https://www.grafisk-handel.dk" /></label>
            <label><span>Feed URL</span><input defaultValue="https://feed.bewise.dk/feed/generate?id=d4e695ee-4ccb-4f5a-9224-2a983ca7cc26&siteId=26&type=google" /></label>
            <label><span>Commission model</span><select defaultValue="CPA"><option>CPA</option><option>CPC</option><option>Hybrid</option></select></label>
            <label><span>Default shipping cost</span><input defaultValue="43.75" /></label>
          </div>
        </form>
      </section>
    </main>
  );
}
