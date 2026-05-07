import { AdminNav } from "../AdminNav";

export default function AdminImportLogsPage() {
  return (
    <main className="shell">
      <AdminNav />
      <section className="panel">
        <h1>Import logs</h1>
        <p className="muted">Review feed imports, rejected rows and EAN approval opportunities.</p>
        <table className="offer-table">
          <thead>
            <tr><th>Import</th><th>Shop</th><th>Status</th><th>Total</th><th>Accepted</th><th>Rejected</th><th>Common error</th></tr>
          </thead>
          <tbody>
            <tr><td>imp_1024</td><td>SoundStreet</td><td>PARTIAL</td><td>45</td><td>42</td><td>3</td><td>EAN_NOT_APPROVED</td></tr>
            <tr><td>imp_live_gh</td><td>Grafisk Handel</td><td>PARTIAL</td><td>14,460</td><td>1</td><td>14,459</td><td>EAN_NOT_APPROVED</td></tr>
            <tr><td>imp_1023</td><td>NordicTech</td><td>COMPLETED</td><td>88</td><td>88</td><td>0</td><td>-</td></tr>
            <tr><td>imp_1022</td><td>MobileHub</td><td>FAILED</td><td>12</td><td>0</td><td>12</td><td>INVALID_EAN_CHECKSUM</td></tr>
          </tbody>
        </table>
      </section>
      <section className="panel" style={{ marginTop: 16 }}>
        <h2>Rejected row review</h2>
        <table className="offer-table">
          <thead>
            <tr><th>EAN</th><th>Feed title</th><th>Shop</th><th>Reason</th><th>Admin action</th></tr>
          </thead>
          <tbody>
            <tr><td>8715946668031</td><td>Epson Cyan T44J2 - 700 ml blækpatron</td><td>Grafisk Handel</td><td>Accepted: approved master EAN</td><td>Open product</td></tr>
            <tr><td>8715946668032</td><td>Epson Cyan T44J2 wrong checksum test row</td><td>Grafisk Handel</td><td>INVALID_EAN_CHECKSUM</td><td>Reject permanently</td></tr>
            <tr><td>8809355878065</td><td>Unapproved feed product</td><td>Grafisk Handel</td><td>EAN_NOT_APPROVED</td><td>Create pending master EAN</td></tr>
          </tbody>
        </table>
      </section>
    </main>
  );
}
