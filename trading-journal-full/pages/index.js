import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Dashboard from "../components/Dashboard";
import TradeUploader from "../components/TradeUploader";

export default function Home() {
  const { data: session, status } = useSession();

  if (status === "loading") return <main className="page">Loading...</main>;

  if (!session) {
    return (
      <main className="page center">
        <div className="card">
          <h1>Trading Journal</h1>
          <p>Track trades, import CSV files, and review your trading stats.</p>
          <div className="row">
            <Link className="button" href="/login">Login</Link>
            <Link className="button secondary" href="/signup">Sign up</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <header className="topbar">
        <div>
          <h1>Trading Journal</h1>
          <p>{session.user.email}</p>
        </div>
        <button className="button secondary" onClick={() => signOut()}>Logout</button>
      </header>

      <TradeUploader />
      <Dashboard />
    </main>
  );
}
