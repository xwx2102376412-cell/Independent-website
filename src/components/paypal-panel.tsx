"use client";

import { useState } from "react";
import { money } from "@/lib/demo-products";

export function PayPalPanel({ orderNumber, status, total }: { orderNumber: string; status: string; total: number }) {
  const [message, setMessage] = useState(""); const configured = Boolean(process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID);
  async function begin() { const response = await fetch("/api/paypal/create-order", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ orderNumber }) }); const data = await response.json(); if (!response.ok) setMessage(data.error); else if (data.approveUrl) window.location.assign(data.approveUrl); }
  return <aside className="h-fit rounded-xl border border-[var(--line)] bg-[var(--surface)] p-6"><h2 className="text-xl font-black">Payment</h2><p className="mt-3 text-sm text-[var(--muted)]">Status: {status}</p><p className="mt-6 text-3xl font-black">{money(total)}</p>{configured ? <button onClick={begin} className="focus-ring mt-6 w-full rounded-lg bg-[#ffc439] px-5 py-4 font-black text-[#171819]">Continue with PayPal</button> : <div className="mt-6 rounded-lg border border-[var(--line)] p-4 text-sm leading-6"><strong>PayPal Sandbox is not configured.</strong><p className="mt-2 text-[var(--muted)]">Add the public Client ID and server secret to `.env`. This order remains pending.</p></div>}{message && <p role="alert" className="mt-4 text-sm text-red-700 dark:text-red-300">{message}</p>}<p className="mt-5 text-xs leading-5 text-[var(--muted)]">A browser return never marks an order paid. Only a verified PayPal webhook can do that.</p></aside>;
}
