"use client";

import { useState } from "react";

export function CustomerAuthForm({ mode, nextPath = "/account" }: { mode: "login" | "register"; nextPath?: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setLoading(true);
    const response = await fetch(`/api/auth/${mode === "login" ? "login" : "register"}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, password }) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) { setError(result.error ?? "Authentication failed."); setLoading(false); return; }
    window.location.assign(nextPath);
  }
  return <form onSubmit={submit} className="grid gap-5">
    <label className="grid gap-2"><span className="micro-label text-[var(--foreground)]">Email</span><input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" className="machine-input focus-ring" /></label>
    <label className="grid gap-2"><span className="micro-label text-[var(--foreground)]">Password</span><input required minLength={8} type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === "login" ? "current-password" : "new-password"} className="machine-input focus-ring" /></label>
    {error && <p role="alert" className="border border-[var(--danger)] p-4 text-sm text-red-300">{error}</p>}
    <button disabled={loading} className="machine-button focus-ring w-full disabled:opacity-60">{loading ? "Please wait..." : mode === "login" ? "Log in" : "Create account"}</button>
  </form>;
}
