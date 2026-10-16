"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart-provider";
import { money } from "@/lib/demo-products";

const fields = [
  ["firstName", "First name", "given-name"], ["lastName", "Last name", "family-name"], ["phone", "Phone (optional)", "tel"],
  ["address1", "Street address", "address-line1"], ["address2", "Apartment or suite (optional)", "address-line2"], ["city", "City", "address-level2"], ["state", "State code", "address-level1"], ["postalCode", "ZIP code", "postal-code"],
] as const;

export function CheckoutForm() {
  const { items, hydrated, clear } = useCart(); const router = useRouter(); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0); const estimatedShipping = subtotal >= 150000 ? 0 : 9900;
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError("");
    try { const response = await fetch("/api/checkout", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))) }); const result = await response.json(); if (!response.ok) throw new Error(result.error ?? "Checkout could not be created."); clear(); router.push(`/order/${result.orderNumber}`); } catch (err) { setError(err instanceof Error ? err.message : "Checkout could not be created."); } finally { setLoading(false); }
  }
  if (!hydrated) return <div className="mt-10 h-48 max-w-3xl animate-pulse bg-[var(--surface)]" aria-busy="true" />;
  if (!items.length) return <p className="mt-10 border border-[var(--line)] p-5">Your cart is empty.</p>;
  return <form onSubmit={submit} className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]"><div className="machine-panel grid gap-5 p-6 sm:grid-cols-2 sm:p-8">{fields.map(([name, label, autoComplete], i) => <label key={name} className={`grid gap-2 ${[2,3,4].includes(i) ? "sm:col-span-2" : ""}`}><span className="micro-label text-[var(--foreground)]">{label}</span><input required={!label.includes("optional")} name={name} type="text" autoComplete={autoComplete} maxLength={150} className="machine-input focus-ring placeholder:text-[var(--muted)]" /></label>)}<input type="hidden" name="country" value="US" />{error && <p role="alert" className="sm:col-span-2 border border-[var(--danger)] bg-red-950/20 p-4 text-sm text-red-300">{error}</p>}</div><aside className="machine-panel h-fit p-6"><p className="micro-label">Checkout protocol</p><h2 className="mt-3 text-xl font-black uppercase">Simulated purchase</h2><div className="mt-5 grid gap-3 border-y border-[var(--line)] py-5 text-sm"><div className="flex justify-between"><span>Cart subtotal</span><span>{money(subtotal)}</span></div><div className="flex justify-between"><span>Estimated shipping</span><span>{money(estimatedShipping)}</span></div><div className="flex justify-between"><span>Tax</span><span>$0</span></div></div><div className="mt-5 text-xs leading-5 text-[var(--muted)]">The server verifies the database cart, current prices, and inventory before completing this simulated purchase.</div><button disabled={loading} className="machine-button focus-ring mt-6 w-full disabled:opacity-60">{loading ? "Completing purchase..." : "Complete simulated purchase"}</button></aside></form>;
}
