mport { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Dashboard from "../components/Dashboard";
import TradeUploader from "../components/TradeUploader";

export default function Home() {
  const { data: session, status } = useSession();

  if (status === "loading") return <main className="landing">Loading...</main>;

  if (!session) {
    return (
      <main className="landing">
        <div className="hero-card">
          <div className="logo-pill">WETRAD</div>
          <h1>Trade Journal Built for Serious Traders</h1>
          <p>Track setups, imports, PnL, win rate, and equity curve in one clean dashboard.</p>
          <div className="hero-actions">
            <Link className="button primary" href="/login">Login</Link>
            <Link className="button ghost" href="/signup">Sign up</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">W</div>
          <div>
            <h2>WETRAD</h2>
            <p>Trading Journal</p>
          </div>
        </div>

        <nav className="nav">
          <a className="active">Dashboard</a>
          <a>Trades</a>
          <a>Journal</a>
          <a>Analytics</a>
          <a>Settings</a>
        </nav>

        <div className="sidebar-footer">
          <p>Logged in as</p>
          <strong>{session.user.email}</strong>
          <button className="logout" onClick={() => signOut()}>Logout</button>
        </div>
      </aside>

      <section className="main-content">
        <header className="top-header">
          <div>
            <p className="eyebrow">Dashboard</p>
            <h1>Trading Performance</h1>
          </div>
          <div className="status-pill">Live Journal</div>
        </header>

        <Dashboard />
        <TradeUploader />
      </section>
    </main>
  );
}
