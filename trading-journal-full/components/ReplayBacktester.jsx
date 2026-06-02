import { useMemo, useState } from "react";
import Papa from "papaparse";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceDot } from "recharts";

function num(value) {
  const parsed = Number(String(value ?? "").replace(/[$,@,]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function getMultiplier(symbol) {
  const s = String(symbol || "").toUpperCase();
  if (s.startsWith("MES")) return 5;
  if (s.startsWith("MNQ")) return 2;
  if (s.startsWith("M2K")) return 5;
  if (s.startsWith("MYM")) return 0.5;
  if (s.startsWith("ES")) return 50;
  if (s.startsWith("NQ")) return 20;
  return 1;
}

export default function ReplayBacktester() {
  const [symbol, setSymbol] = useState("MES");
  const [candles, setCandles] = useState([]);
  const [index, setIndex] = useState(30);
  const [position, setPosition] = useState(null);
  const [trades, setTrades] = useState([]);
  const [qty, setQty] = useState(1);

  const visibleCandles = useMemo(() => candles.slice(0, Math.min(index, candles.length)), [candles, index]);
  const current = visibleCandles[visibleCandles.length - 1];
  const totalPnL = trades.reduce((sum, trade) => sum + trade.pnl, 0);
  const wins = trades.filter(trade => trade.pnl > 0).length;
  const losses = trades.filter(trade => trade.pnl < 0).length;
  const winRate = trades.length ? (wins / trades.length) * 100 : 0;

  function handleUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsed = results.data
          .map((row, i) => {
            const time = row.time || row.Time || row.Date || row.date || row.datetime || row.Datetime || `Candle ${i + 1}`;
            const close = num(row.close || row.Close || row.Price || row.price || row.Last || row.last);
            const open = num(row.open || row.Open || close);
            const high = num(row.high || row.High || close);
            const low = num(row.low || row.Low || close);
            return { id: i + 1, time, open, high, low, close };
          })
          .filter(candle => candle.close > 0);

        setCandles(parsed);
        setIndex(Math.min(30, parsed.length));
        setPosition(null);
        setTrades([]);
      }
    });
  }

  function stepForward() {
    setIndex(i => Math.min(i + 1, candles.length));
  }

  function stepBack() {
    setIndex(i => Math.max(i - 1, 1));
  }

  function enter(side) {
    if (!current || position) return;
    setPosition({
      side,
      entryPrice: current.close,
      entryTime: current.time,
      qty: Number(qty) || 1
    });
  }

  function closeTrade() {
    if (!current || !position) return;
    const multiplier = getMultiplier(symbol);
    const isLong = position.side === "LONG";
    const points = isLong ? current.close - position.entryPrice : position.entryPrice - current.close;
    const pnl = points * multiplier * position.qty;

    setTrades(prev => [...prev, { ...position, exitPrice: current.close, exitTime: current.time, pnl }]);
    setPosition(null);
  }

  function resetReplay() {
    setIndex(Math.min(30, candles.length));
    setPosition(null);
    setTrades([]);
  }

  return (
    <div className="replay-grid">
      <section className="panel replay-main">
        <div className="panel-title">
          <div>
            <small>Market Data</small>
            <h2>Replay Chart</h2>
          </div>
          <div className="replay-controls">
            <input value={symbol} onChange={e => setSymbol(e.target.value.toUpperCase())} placeholder="MES" />
            <input type="number" min="1" value={qty} onChange={e => setQty(e.target.value)} />
          </div>
        </div>

        <div className="upload-row">
          <input type="file" accept=".csv" onChange={handleUpload} />
          <p>Upload candle CSV with columns like Time, Open, High, Low, Close.</p>
        </div>

        <div className="chart-box replay-chart">
          {visibleCandles.length ? (
            <ResponsiveContainer width="100%" height={420}>
              <LineChart data={visibleCandles}>
                <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="id" stroke="#64748b" />
                <YAxis stroke="#64748b" domain={["auto", "auto"]} />
                <Tooltip contentStyle={{ background: "#0b1120", border: "1px solid #243044", borderRadius: 12, color: "#fff" }} />
                <Line type="monotone" dataKey="close" stroke="#22c55e" strokeWidth={2} dot={false} />
                {position && <ReferenceDot x={visibleCandles.length} y={position.entryPrice} r={7} fill={position.side === "LONG" ? "#22c55e" : "#ef4444"} stroke="white" />}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-chart">
              <h3>No candle data yet</h3>
              <p>Upload a CSV of historical candles to start replaying.</p>
            </div>
          )}
        </div>

        <div className="button-row">
          <button onClick={stepBack}>Step Back</button>
          <button onClick={stepForward}>Step Forward</button>
          <button className="buy" onClick={() => enter("LONG")}>Buy</button>
          <button className="sell" onClick={() => enter("SHORT")}>Sell</button>
          <button className="close-btn" onClick={closeTrade}>Close Trade</button>
          <button onClick={resetReplay}>Reset</button>
        </div>
      </section>

      <section className="panel">
        <div className="panel-title"><div><small>Position</small><h2>Current Trade</h2></div></div>
        {position ? (
          <div className="position-card">
            <p>Side: <strong className={position.side === "LONG" ? "green" : "red"}>{position.side}</strong></p>
            <p>Entry: <strong>{position.entryPrice}</strong></p>
            <p>Qty: <strong>{position.qty}</strong></p>
            <p>Time: <strong>{position.entryTime}</strong></p>
          </div>
        ) : <p className="muted">No open position.</p>}
      </section>

      <section className="panel">
        <div className="panel-title"><div><small>Results</small><h2>Backtest Stats</h2></div></div>
        <div className="metric-stack">
          <div><span>Total PnL</span><strong className={totalPnL >= 0 ? "green" : "red"}>${totalPnL.toFixed(2)}</strong></div>
          <div><span>Trades</span><strong>{trades.length}</strong></div>
          <div><span>Win Rate</span><strong>{winRate.toFixed(2)}%</strong></div>
          <div><span>Wins / Losses</span><strong>{wins} / {losses}</strong></div>
        </div>
      </section>

      <section className="panel trades-panel">
        <div className="panel-title"><div><small>Backtest Log</small><h2>Replay Trades</h2></div></div>
        <table className="trade-table">
          <thead><tr><th>Side</th><th>Entry</th><th>Exit</th><th>Qty</th><th>PnL</th></tr></thead>
          <tbody>
            {trades.length === 0 ? <tr><td colSpan="5">No replay trades yet.</td></tr> : trades.map((trade, i) => (
              <tr key={i}>
                <td>{trade.side}</td>
                <td>{trade.entryPrice}</td>
                <td>{trade.exitPrice}</td>
                <td>{trade.qty}</td>
                <td className={trade.pnl >= 0 ? "green" : "red"}>${trade.pnl.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

