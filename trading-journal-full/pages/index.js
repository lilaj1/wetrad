import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import ReplayBacktester from "../components/ReplayBacktester";

export default function Home() {
  const { data: session, status } = useSession();

  if (status === "loading") return <main className="landing">Loading...</main>;

  if (!session) {
    return (
      <main className="landing">
        <div className="hero-card">
          <div className="brand-badge">WETRAD REPLAY</div>
          <h1>Backtest Like Replay</h1>
          <p>Upload candle data, replay the market, place practice trades, and review your results.</p>
          <div className="hero-actions">
            <Link className="btn btn-green" href="/login">Login</Link>
            <Link className="btn btn-dark" href="/signup">Sign up</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="replay-layout">
      <aside className="sidebar">
        <div className="brand-row">
          <div className="brand-icon">R</div>
          <div>
            <h2>WETRAD</h2>
            <span>Replay Backtester</span>
          </div>
        </div>

        <nav className="side-nav">
          <button className="active">Replay</button>
          <button>Backtests</button>
          <button>Stats</button>
          <button>Settings</button>
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
            <small>Replay Mode</small>
            <h1>Market Replay Backtester</h1>
          </div>
          <div className="live-pill">Practice</div>
        </header>

        <ReplayBacktester />
      </section>
    </main>
  );
}
