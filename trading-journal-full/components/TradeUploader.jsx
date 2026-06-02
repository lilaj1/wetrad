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
    <section className="panel upload-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Import</p>
          <h2>Upload Webull / CSV Trades</h2>
        </div>
      </div>

      <div className="upload-box">
        <div>
          <label>Trading Account</label>
          <select value={accountId} onChange={e => setAccountId(e.target.value)}>
            {accounts.map(account => (
              <option key={account.id} value={account.id}>{account.name}</option>
            ))}
          </select>
        </div>

        <div className="file-drop">
          <p>Drop your CSV here or choose file</p>
          <span>Columns supported: ticker, symbol, side, status, PnL, netProfit</span>
          <input type="file" accept=".csv" onChange={handleFileUpload} disabled={loading} />
        </div>

        {loading && <p className="loading">Importing trades...</p>}
      </div>
    </section>
  );
}
