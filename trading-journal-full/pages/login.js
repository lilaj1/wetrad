import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function submit(e) {
    e.preventDefault();

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false
    });

    if (res?.ok) router.push("/");
    else alert("Login failed");
  }

  return (
    <main className="page center">
      <form className="card form" onSubmit={submit}>
        <h1>Login</h1>
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button className="button" type="submit">Login</button>
        <p>No account? <Link href="/signup">Sign up</Link></p>
      </form>
    </main>
  );
}
