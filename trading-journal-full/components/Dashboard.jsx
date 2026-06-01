import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

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

  return (
    <section className="card">
      <h2>Dashboard</h2>

      <label>Account</label>
      <select value={accountId} onChange={e => setAccountId(e.target.value)}>
        {accounts.map(account => (
          <option key={account.id} value={account.id}>
            {account.name}
          </option>
        ))}
      </select>

      {stats && (
        <div className="stats">
          <div><strong>${Number(stats.totalProfit).toFixed(2)}</strong><span>Total PnL</span></div>
          <div><strong>{Number(stats.winRate).toFixed(2)}%</strong><span>Win Rate</span></div>
          <div><strong>{Number(stats.profitFactor).toFixed(2)}</strong><span>Profit Factor</span></div>
          <div><strong>{stats.totalTrades}</strong><span>Total Trades</span></div>
        </div>
      )}

      <h3>Equity Curve</h3>
      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <LineChart data={equity}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="trade" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="equity" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
