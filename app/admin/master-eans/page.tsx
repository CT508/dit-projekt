import { products } from "@/lib/data/mock-data";

export default function AdminMasterEansPage() {
  return (
    <main className="shell">
      <section className="panel">
        <h1>Master EAN management</h1>
        <p className="muted">This table is the single source of truth for product matching.</p>
        <table className="offer-table">
          <thead>
            <tr>
              <th>EAN</th>
              <th>Product</th>
              <th>Brand</th>
              <th>Category</th>
              <th>Status</th>
              <th>Offers</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.ean}>
                <td><strong>{product.ean}</strong></td>
                <td>{product.productName}</td>
                <td>{product.brand}</td>
                <td>{product.category}</td>
                <td><span className="badge">APPROVED</span></td>
                <td>{product.offers.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section className="panel" style={{ marginTop: 16 }}>
        <h2>Rejected row review queue</h2>
        <div className="error-list">
          <div className="error-item">
            <strong>EAN_NOT_APPROVED</strong>
            <p className="muted">Row can only be reprocessed after an admin approves the EAN as a master product.</p>
          </div>
          <div className="error-item">
            <strong>INVALID_EAN_CHECKSUM</strong>
            <p className="muted">Row cannot be approved without a valid EAN checksum.</p>
          </div>
        </div>
      </section>
    </main>
  );
}

