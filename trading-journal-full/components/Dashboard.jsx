import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function Dashboard() {
  const [accounts, setAccounts] = useState([]);
  const [accountId, setAccountId] = useState("");
  const [stats, setStats] = useState(null);
  const [equity, setEquity] = useState([]);

  useEffect(() => {
    fetch("/api/accounts")
      .then(res => res.json())
      .then(data => {
        setAccounts(data);
        if (data?.[0]?.id) setAccountId(data[0].id);
      });
  }, []);

  useEffect(() => {
    if (!accountId) return;

    fetch(`/api/analytics?accountId=${accountId}`)
      .then(res => res.json())
      .then(setStats);

    fetch(`/api/equity?accountId=${accountId}`)
      .then(res => res.json())
      .then(setEquity);
  }, [accountId]);

  const totalProfit = Number(stats?.totalProfit || 0);
  const winRate = Number(stats?.winRate || 0);
  const profitFactor = Number(stats?.profitFactor || 0);
  const totalTrades = Number(stats?.totalTrades || 0);

  return (
    <section className="dashboard-grid">
      <div className="panel full">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Account</p>
            <h2>Performance Overview</h2>
          </div>

          <select value={accountId} onChange={e => setAccountId(e.target.value)}>
            {accounts.map(account => (
              <option key={account.id} value={account.id}>{account.name}</option>
            ))}
          </select>
        </div>

        <div className="stat-grid">
          <StatCard label="Total PnL" value={`$${totalProfit.toFixed(2)}`} positive={totalProfit >= 0} />
          <StatCard label="Win Rate" value={`${winRate.toFixed(2)}%`} />
          <StatCard label="Profit Factor" value={profitFactor.toFixed(2)} />
          <StatCard label="Total Trades" value={totalTrades} />
        </div>
      </div>

      <div className="panel chart-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Equity</p>
            <h2>Equity Curve</h2>
          </div>
        </div>

        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={equity}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="trade" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip
                contentStyle={{
                  background: "#0b1120",
                  border: "1px solid #25324a",
                  borderRadius: "12px",
                  color: "#fff"
                }}
              />
              <Line type="monotone" dataKey="equity" stroke="#22c55e" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="panel watch-panel">
        <p className="eyebrow">Journal Focus</p>
        <h2>Trader Notes</h2>
        <div className="note-list">
          <div><span></span>Follow your setup before entering.</div>
          <div><span></span>Track mistakes after every trade.</div>
          <div><span></span>Review red days before scaling size.</div>
        </div>
      </div>
    </section>
  );
}

function StatCard({ label, value, positive = true }) {
  return (
    <div className="stat-card">
      <p>{label}</p>
      <strong className={positive ? "green" : "red"}>{value}</strong>
    </div>
  );
}
