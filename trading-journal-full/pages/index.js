import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Dashboard from "../components/Dashboard";
import TradeUploader from "../components/TradeUploader";

export default function Home() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <main className="landing">Loading...</main>;
  }

  if (!session) {
    return (
      <main className="landing">
        <div className="hero-card">
          <div className="brand-badge">WETRAD</div>
          <h1>Trade Like a Pro. Journal Like a Pro.</h1>
          <p>
            Import trades, review your PnL, track mistakes, and build discipline.
          </p>
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
          <div>
            <h2>WETRAD</h2>
            <span>Trading Journal</span>
          </div>
        </div>

        <nav className="side-nav">
          <a className="active">Dashboard</a>
          <a>Trades</a>
          <a>Calendar</a>
          <a>Journal</a>
          <a>Analytics</a>
          <a>Settings</a>
        </nav>

        <div className="user-card">
          <small>Signed in</small>
          <strong>{session.user.email}</strong>
          <button onClick={() => signOut()}>Logout</button>
        </div>
      </aside>

      <section className="content">
        <header className="page-header">
          <div>
            <small>Overview</small>
            <h1>Trading Dashboard</h1>
          </div>
          <div className="live-pill">Live</div>
        </header>

        <Dashboard />
        <TradeUploader />
      </section>
    </main>
  );
}
