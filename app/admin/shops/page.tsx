export default function AdminShopsPage() {
  return (
    <main className="shell">
      <section className="panel">
        <h1>Shop management</h1>
        <table className="offer-table">
          <thead>
            <tr><th>Shop</th><th>Status</th><th>Rating</th><th>Offers</th><th>Imports</th></tr>
          </thead>
          <tbody>
            <tr><td>SoundStreet</td><td><span className="badge">ACTIVE</span></td><td>4.8</td><td>1240</td><td>Daily CSV</td></tr>
            <tr><td>NordicTech</td><td><span className="badge">ACTIVE</span></td><td>4.6</td><td>980</td><td>XML URL</td></tr>
            <tr><td>MobileHub</td><td><span className="badge">ACTIVE</span></td><td>4.7</td><td>620</td><td>API push</td></tr>
          </tbody>
        </table>
      </section>
    </main>
  );
}

