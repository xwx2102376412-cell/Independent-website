"use client";

import Link from "next/link";
import { List, ShoppingBag, X } from "@phosphor-icons/react";
import { useState } from "react";
import { useCart } from "@/components/cart-provider";

const links = [["Bikes", "/bikes"], ["Compare", "/compare"], ["Dealer", "/dealer"], ["Support", "/support"]];

export function Header() {
  const [open, setOpen] = useState(false);
  const { count } = useCart();
  return <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[color:var(--background)]/95 backdrop-blur-md">
    <div className="shell flex h-[72px] items-center justify-between gap-6">
      <Link href="/" className="focus-ring text-xl font-black tracking-[-.06em]">RIVET<span className="text-[var(--accent)]">/</span></Link>
      <nav className="hidden items-center gap-8 text-sm font-semibold md:flex" aria-label="Primary navigation">{links.map(([label, href]) => <Link className="focus-ring hover:text-[var(--accent)]" key={href} href={href}>{label}</Link>)}</nav>
      <div className="flex items-center gap-3">
        <span className="hidden text-xs font-bold text-[var(--muted)] sm:block">US / USD</span>
        <Link href="/cart" className="focus-ring relative flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--line)]" aria-label={`Cart with ${count} items`}><ShoppingBag size={20} weight="bold" />{count > 0 && <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[10px] font-black text-[#171819]">{count}</span>}</Link>
        <button onClick={() => setOpen(!open)} className="focus-ring flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--line)] md:hidden" aria-expanded={open} aria-label="Toggle menu">{open ? <X size={20} /> : <List size={20} />}</button>
      </div>
    </div>
    {open && <nav className="shell grid gap-1 border-t border-[var(--line)] py-4 md:hidden">{links.map(([label, href]) => <Link onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 font-semibold hover:bg-[var(--surface)]" key={href} href={href}>{label}</Link>)}</nav>}
  </header>;
}
