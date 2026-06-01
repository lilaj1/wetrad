import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

export default function Signup() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function submit(e) {
    e.preventDefault();

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    if (res.ok) router.push("/login");
    else {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "Signup failed");
    }
  }

  return (
    <main className="page center">
      <form className="card form" onSubmit={submit}>
        <h1>Sign up</h1>
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button className="button" type="submit">Create account</button>
        <p>Already have one? <Link href="/login">Login</Link></p>
      </form>
    </main>
  );
}
