import { AdminNav } from "../AdminNav";

export default function AdminSettingsPage() {
  return (
    <main className="shell">
      <AdminNav />
      <section className="panel">
        <h1>Site settings</h1>
        <p className="muted">Global controls for SEO, imports, feed limits, tracking, commissions and publishing rules.</p>
      </section>

      <section className="admin-layout" style={{ marginTop: 16 }}>
        <form className="panel admin-form">
          <h2>Global SEO</h2>
          <label><span>Site name</span><input defaultValue="PrisPuls" /></label>
          <label><span>Default SEO title suffix</span><input defaultValue="| PrisPuls" /></label>
          <label><span>Robots policy</span><select defaultValue="index-approved"><option value="index-approved">Index approved products only</option><option>Noindex all test pages</option></select></label>

          <h2>Import rules</h2>
          <div className="field-grid">
            <label><span>Max feed size</span><input defaultValue="100 MB" /></label>
            <label><span>Batch write size</span><input defaultValue="500" /></label>
            <label><span>Checkpoint rows</span><input defaultValue="1000" /></label>
            <label><span>EAN policy</span><select defaultValue="strict"><option value="strict">Strict approved EAN only</option></select></label>
          </div>

          <h2>Tracking and monetization</h2>
          <div className="field-grid">
            <label><span>Click tracking</span><select defaultValue="enabled"><option>enabled</option><option>disabled</option></select></label>
            <label><span>Default commission model</span><select defaultValue="CPC"><option>CPC</option><option>CPA</option><option>Hybrid</option></select></label>
          </div>

          <button className="button" type="button">Save settings</button>
        </form>

        <aside className="panel">
          <h2>Publishing guardrails</h2>
          <ul className="check-list">
            <li>No approved EAN means no public offer.</li>
            <li>Disabled master products are removed from public pages.</li>
            <li>SEO pages use admin master content, not shop feed text.</li>
            <li>Large feeds run as stream/background imports.</li>
          </ul>
        </aside>
      </section>
    </main>
  );
}
