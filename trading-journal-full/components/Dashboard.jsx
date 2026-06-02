import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar
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

  const totalProfit = Number(stats?.totalProfit || 0);
  const winRate = Number(stats?.winRate || 0);
  const profitFactor = Number(stats?.profitFactor || 0);
  const totalTrades = Number(stats?.totalTrades || 0);
  const wins = Number(stats?.winningTrades || 0);
  const losses = Number(stats?.losingTrades || 0);

  const winLossData = [
    { name: "Wins", value: wins },
    { name: "Losses", value: losses }
  ];

  return (
    <div className="dashboard">
      <section className="panel top-panel">
        <div className="panel-title">
          <div>
            <small>Account</small>
            <h2>Performance Summary</h2>
          </div>

          <select value={accountId} onChange={e => setAccountId(e.target.value)}>
            {accounts.map(account => (
              <option key={account.id} value={account.id}>{account.name}</option>
            ))}
          </select>
        </div>

        <div className="metric-grid">
          <Metric title="Net PnL" value={`$${totalProfit.toFixed(2)}`} tone={totalProfit >= 0 ? "green" : "red"} />
          <Metric title="Win Rate" value={`${winRate.toFixed(2)}%`} />
          <Metric title="Profit Factor" value={profitFactor.toFixed(2)} />
          <Metric title="Total Trades" value={totalTrades} />
        </div>
      </section>

      <section className="panel equity-panel">
        <div className="panel-title">
          <div>
            <small>Growth</small>
            <h2>Equity Curve</h2>
          </div>
        </div>

        <div className="chart-box">
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={equity}>
              <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="trade" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip
                contentStyle={{
                  background: "#0b1120",
                  border: "1px solid #243044",
                  borderRadius: 12,
                  color: "#fff"
                }}
              />
              <Line type="monotone" dataKey="equity" stroke="#22c55e" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="panel small-panel">
        <div className="panel-title">
          <div>
            <small>Wins vs Losses</small>
            <h2>Trade Split</h2>
          </div>
        </div>

        <div className="chart-box small">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={winLossData}>
              <XAxis dataKey="name" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip
                contentStyle={{
                  background: "#0b1120",
                  border: "1px solid #243044",
                  borderRadius: 12,
                  color: "#fff"
                }}
              />
              <Bar dataKey="value" fill="#22c55e" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="panel small-panel">
        <div className="panel-title">
          <div>
            <small>Discipline</small>
            <h2>Journal Rules</h2>
          </div>
        </div>

        <div className="rule-list">
          <div><span></span> Only take A+ setups.</div>
          <div><span></span> Screenshot every trade.</div>
          <div><span></span> Write the mistake after every loss.</div>
          <div><span></span> Stop trading after max daily loss.</div>
        </div>
      </section>

      <section className="panel trades-panel">
        <div className="panel-title">
          <div>
            <small>History</small>
            <h2>Recent Trades</h2>
          </div>
          <span className="coming-soon">Table upgrade next</span>
        </div>

        <table className="trade-table">
          <thead>
            <tr>
              <th>Ticker</th>
              <th>Side</th>
              <th>Status</th>
              <th>PnL</th>
              <th>Setup</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Upload CSV</td>
              <td>LONG/SHORT</td>
              <td>CLOSED</td>
              <td className="green">$0.00</td>
              <td>Breakout</td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  );
}

function Metric({ title, value, tone = "" }) {
  return (
    <div className="metric-card">
      <span>{title}</span>
      <strong className={tone}>{value}</strong>
    </div>
  );
}
