export default function AdminImportLogsPage() {
  return (
    <main className="shell">
      <section className="panel">
        <h1>Import logs</h1>
        <table className="offer-table">
          <thead>
            <tr><th>Import</th><th>Shop</th><th>Status</th><th>Total</th><th>Accepted</th><th>Rejected</th><th>Common error</th></tr>
          </thead>
          <tbody>
            <tr><td>imp_1024</td><td>SoundStreet</td><td>PARTIAL</td><td>45</td><td>42</td><td>3</td><td>EAN_NOT_APPROVED</td></tr>
            <tr><td>imp_1023</td><td>NordicTech</td><td>COMPLETED</td><td>88</td><td>88</td><td>0</td><td>-</td></tr>
            <tr><td>imp_1022</td><td>MobileHub</td><td>FAILED</td><td>12</td><td>0</td><td>12</td><td>INVALID_EAN_CHECKSUM</td></tr>
          </tbody>
        </table>
      </section>
    </main>
  );
}

