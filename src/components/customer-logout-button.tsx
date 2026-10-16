"use client";

import { useState } from "react";

export function CustomerLogoutButton() {
  const [loading, setLoading] = useState(false);
  async function logout() {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    localStorage.removeItem("rivet-cart");
    window.location.assign(new URL("/", window.location.origin).toString());
  }
  return <button type="button" onClick={logout} disabled={loading} className="machine-button secondary focus-ring disabled:opacity-60">{loading ? "Logging out..." : "Log out"}</button>;
}
