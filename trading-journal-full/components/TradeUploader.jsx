import Papa from "papaparse";
import { useEffect, useState } from "react";

export default function TradeUploader() {
  const [accounts, setAccounts] = useState([]);
  const [accountId, setAccountId] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/accounts")
      .then(res => res.json())
      .then(data => {
        setAccounts(data);
        if (data?.[0]?.id) setAccountId(data[0].id);
      })
      .catch(() => {});
  }, []);

  async function handleFileUpload(event) {
    const file = event.target.files?.[0];
    if (!file || !accountId) return;

    setLoading(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async results => {
        const res = await fetch("/api/trades/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accountId, rows: results.data })
        });

        setLoading(false);

        if (res.ok) {
          const data = await res.json();
          alert(`Imported ${data.count} trades`);
          window.location.reload();
        } else {
          const data = await res.json().catch(() => ({}));
          alert(data.error || "Import failed");
        }
      },
      error: () => {
        setLoading(false);
        alert("Could not read CSV");
      }
    });
  }

  return (
    <section className="panel uploader-panel">
      <div className="panel-title">
        <div>
          <small>Import</small>
          <h2>Upload Webull CSV</h2>
        </div>
      </div>

      <div className="uploader-grid">
        <div>
          <label>Account</label>
          <select value={accountId} onChange={e => setAccountId(e.target.value)}>
            {accounts.map(account => (
              <option key={account.id} value={account.id}>{account.name}</option>
            ))}
          </select>
        </div>

        <div className="drop-zone">
          <h3>Choose your CSV file</h3>
          <p>Supports columns like Symbol, Ticker, Side, Status, PnL, Net Profit.</p>
          <input type="file" accept=".csv" onChange={handleFileUpload} disabled={loading} />
        </div>

        {loading && <p className="uploading">Importing trades...</p>}
      </div>
    </section>
  );
}
