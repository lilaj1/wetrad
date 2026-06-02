import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Dashboard from "../components/Dashboard";
import TradeUploader from "../components/TradeUploader";

export default function Home() {
  const { data: session, status } = useSession();
  const [activePage, setActivePage] = useState("dashboard");

  if (status === "loading") return <main className="landing">Loading...</main>;

  if (!session) {
    return (
      <main className="landing">
        <div className="hero-card">
          <div className="brand-badge">WETRAD</div>
          <h1>Trade Like a Pro. Journal Like a Pro.</h1>
          <p>Import trades, review PnL, track mistakes, and build discipline.</p>
          <div className="hero-actions">
            <Link className="btn btn-green" href="/login">Login</Link>
            <Link className="btn btn-dark" href="/signup">Sign up</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="app-layout">
      <aside className="sidebar">
        <div className="brand-row">
          <div className="brand-icon">W</div>
          <div><h2>WETRAD</h2><span>Trading Journal</span></div>
        </div>

        <nav className="side-nav">
          {["dashboard", "trades", "calendar", "journal", "analytics"].map(page => (
            <button key={page} className={activePage === page ? "active" : ""} onClick={() => setActivePage(page)}>
              {page[0].toUpperCase() + page.slice(1)}
            </button>
          ))}
        </nav>

        <div className="user-card">
          <small>Signed in</small>
          <strong>{session.user.email}</strong>
          <button onClick={() => signOut()}>Logout</button>
        </div>
      </aside>

      <section className="content">
        <header className="page-header">
          <div><small>{activePage}</small><h1>{pageTitle(activePage)}</h1></div>
          <div className="live-pill">Live</div>
        </header>

        {activePage === "dashboard" && <Dashboard />}
        {activePage === "trades" && <TradesPage />}
        {activePage === "calendar" && <CalendarPage />}
        {activePage === "journal" && <JournalPage />}
        {activePage === "analytics" && <AnalyticsPage />}
      </section>
    </main>
  );
}

function pageTitle(page) {
  return {
    dashboard: "Trading Dashboard",
    trades: "Trade History",
    calendar: "PnL Calendar",
    journal: "Trade Journal",
    analytics: "Performance Analytics"
  }[page];
}

function TradesPage() {
  return (
    <>
      <TradeUploader />
      <section className="panel">
        <div className="panel-title">
          <div><small>History</small><h2>Recent Trades</h2></div>
          <span className="coming-soon">Connects after import</span>
        </div>
        <table className="trade-table">
          <thead>
            <tr><th>Date</th><th>Ticker</th><th>Side</th><th>Status</th><th>PnL</th><th>Setup</th><th>Mistake</th></tr>
          </thead>
          <tbody>
            <tr><td>Upload CSV</td><td>ES / NQ / AAPL</td><td>Long</td><td>Closed</td><td className="green">$0.00</td><td>Breakout</td><td>None</td></tr>
            <tr><td>Example</td><td>WEBULL</td><td>Short</td><td>Closed</td><td className="red">-$0.00</td><td>Reversal</td><td>Entered early</td></tr>
          </tbody>
        </table>
      </section>
    </>
  );
}

function CalendarPage() {
  const days = Array.from({ length: 35 }, (_, i) => i + 1);
  return (
    <section className="panel">
      <div className="panel-title"><div><small>Calendar</small><h2>Monthly PnL Heatmap</h2></div></div>
      <div className="calendar-grid">
        {days.map(day => (
          <div key={day} className={day % 7 === 0 ? "day red-bg" : day % 3 === 0 ? "day green-bg" : "day"}>
            <span>{day}</span><strong>{day % 3 === 0 ? "+$0" : day % 7 === 0 ? "-$0" : "$0"}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

function JournalPage() {
  return (
    <section className="journal-grid">
      <div className="panel">
        <div className="panel-title"><div><small>Review</small><h2>Daily Journal</h2></div></div>
        <textarea className="journal-box" placeholder="Write what you did well, what you did wrong, and what you will improve tomorrow..." />
      </div>
      <div className="panel">
        <div className="panel-title"><div><small>Rules</small><h2>Trading Rules</h2></div></div>
        <div className="rule-list">
          <div><span></span>Only take A+ setups.</div>
          <div><span></span>Do not revenge trade.</div>
          <div><span></span>Respect max loss.</div>
          <div><span></span>Screenshot every trade.</div>
          <div><span></span>Review before scaling size.</div>
        </div>
      </div>
    </section>
  );
}

function AnalyticsPage() {
  return (
    <section className="analytics-grid">
      <div className="panel"><small>Strength</small><h2>Best Setup</h2><div className="big-number green">Breakout</div></div>
      <div className="panel"><small>Weakness</small><h2>Common Mistake</h2><div className="big-number red">Early Entry</div></div>
      <div className="panel wide"><small>Focus</small><h2>Performance Notes</h2><p className="muted">Once trade data is imported, this page can show analytics by setup, ticker, day, session, and mistake type.</p></div>
    </section>
  );
}
