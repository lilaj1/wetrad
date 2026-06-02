import { useState } from "react";
import Papa from "papaparse";

export default function ReplayBacktester() {
  const [candles, setCandles] = useState([]);
  const [index, setIndex] = useState(20);
  const [trades, setTrades] = useState([]);
  const [position, setPosition] = useState(null);

  const visible = candles.slice(0, index);
  const current = visible[visible.length - 1];

  function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsed = results.data
          .map((row, i) => ({
            id: i + 1,
            time: row.time || row.Time || row.Date || `Candle ${i + 1}`,
            close: Number(row.close || row.Close || row.price || row.Price || 0),
          }))
          .filter((c) => c.close > 0);

        setCandles(parsed);
        setIndex(Math.min(20, parsed.length));
        setTrades([]);
        setPosition(null);
      },
    });
  }

  function buy() {
    if (!current || position) return;
    setPosition({ side: "LONG", entry: current.close });
  }

  function sell() {
    if (!current || position) return;
    setPosition({ side: "SHORT", entry: current.close });
  }

  function closeTrade() {
    if (!current || !position) return;

    const pnl =
      position.side === "LONG"
        ? current.close - position.entry
        : position.entry - current.close;

    setTrades([...trades, { ...position, exit: current.close, pnl }]);
    setPosition(null);
  }

  const totalPnl = trades.reduce((sum, t) => sum + t.pnl, 0);

  return (
    <div className="replay-grid">
      <section className="panel replay-main">
        <div className="panel-title">
          <div>
            <small>Market Replay</small>
            <h2>Replay Chart</h2>
          </div>
        </div>

        <div className="upload-row">
          <input type="file" accept=".csv" onChange={handleUpload} />
          <p>Upload CSV with close or Close column.</p>
        </div>

        <div className="empty-chart">
          {visible.length ? (
            <div>
              <h3>Current Price: {current.close}</h3>
              <p>Candle {index} of {candles.length}</p>
            </div>
          ) : (
            <div>
              <h3>No candle data yet</h3>
              <p>Upload sample-candles.csv to test.</p>
            </div>
          )}
        </div>

        <div className="button-row">
          <button onClick={() => setIndex(Math.max(1, index - 1))}>Step Back</button>
          <button onClick={() => setIndex(Math.min(candles.length, index + 1))}>Step Forward</button>
          <button className="buy" onClick={buy}>Buy</button>
          <button className="sell" onClick={sell}>Sell</button>
          <button className="close-btn" onClick={closeTrade}>Close Trade</button>
        </div>
      </section>

      <section className="panel">
        <h2>Current Trade</h2>
        {position ? (
          <p>{position.side} @ {position.entry}</p>
        ) : (
          <p className="muted">No open trade.</p>
        )}
      </section>

      <section className="panel">
        <h2>Backtest Stats</h2>
        <p>Total PnL: ${totalPnl.toFixed(2)}</p>
        <p>Trades: {trades.length}</p>
      </section>
    </div>
  );
}
