import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Dashboard from "../components/Dashboard";
import TradeUploader from "../components/TradeUploader";

export default function Home() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    return (
      <main className="landing">
        <div className="hero-card">
          <div className="logo-pill">WETRAD</div>

          <h1>Trade Like a Pro</h1>

          <p>
            Import trades, track performance, review mistakes,
            and grow your trading edge.
          </p>

          <div className="hero-actions">
            <Link href="/login" className="button primary">
              Login
            </Link>

            <Link href="/signup" className="button ghost">
              Sign Up
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="app-layout">
      <aside className="side-nav">
        <div className="brand-row">
          <div className="brand-mark">W</div>

          <div>
            <h2>WETRAD</h2>
            <small>Trading Journal</small>
          </div>
        </div>

        <nav>
          <a>Dashboard</a>
          <a>Trades</a>
          <a>Journal</a>
          <a>Analytics</a>
          <a>Settings</a>
        </nav>

        <div className="user-card">
          <small>Logged in as</small>
          <strong>{session.user.email}</strong>

          <button onClick={() => signOut()}>
            Logout
          </button>
        </div>
      </aside>

      <section className="content">
        <header className="page-header">
          <div>
            <small>Overview</small>
            <h1>Trading Dashboard</h1>
          </div>

          <div className="live-pill">
            Live
          </div>
        </header>

        <Dashboard />
        <TradeUploader />
      </section>
    </main>
  );
}
