"use client";

import Link from "next/link";
import Image from "next/image";
import { List, ShoppingBag, X } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { useCart } from "@/components/cart-provider";

const links = [["Bikes", "/bikes"], ["Compare", "/compare"], ["Dealer", "/dealer"], ["Support", "/support"]];

export function Header() {
  const [open, setOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const { count } = useCart();
  useEffect(() => { fetch("/api/auth/me", { cache: "no-store" }).then((response) => response.json()).then((result) => setAuthenticated(Boolean(result.authenticated))).catch(() => undefined); }, []);
  return <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[#080a09]/92 backdrop-blur-xl">
    <div className="shell flex h-[76px] items-center justify-between gap-6">
      <Link href="/" aria-label="TUKEN OX home" className="focus-ring relative h-11 w-[148px] shrink-0 overflow-hidden">
        <Image src="/api/brand-logo" alt="TUKEN OX" width={1540} height={1540} unoptimized priority className="absolute left-1/2 top-1/2 h-[148px] w-[148px] max-w-none -translate-x-1/2 -translate-y-1/2 invert" />
      </Link>
      <nav className="hidden items-center gap-9 text-[11px] font-black uppercase tracking-[.16em] md:flex" aria-label="Primary navigation">{links.map(([label, href], index) => <Link className="focus-ring group flex items-center gap-2 hover:text-[var(--accent)]" key={href} href={href}><span className="text-[9px] text-[var(--muted)]">0{index + 1}</span>{label}</Link>)}</nav>
      <div className="flex items-center gap-3">
        <span className="micro-label hidden sm:block">US / USD</span>
        <Link href={authenticated ? "/account" : "/login"} className="focus-ring hidden border-l border-[var(--line)] px-4 py-2 text-[11px] font-black uppercase tracking-[.12em] hover:text-[var(--accent)] sm:block">{authenticated ? "Account" : "Log in"}</Link>
        <Link href="/cart" className="focus-ring relative flex h-11 w-11 items-center justify-center border border-[var(--line)] bg-[var(--surface)]" aria-label={`Cart with ${count} items`}><ShoppingBag size={19} weight="bold" />{count > 0 && <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center bg-[var(--accent)] px-1 text-[10px] font-black text-[var(--accent-ink)]">{count}</span>}</Link>
        <button onClick={() => setOpen(!open)} className="focus-ring flex h-11 w-11 items-center justify-center border border-[var(--line)] md:hidden" aria-expanded={open} aria-label="Toggle menu">{open ? <X size={20} /> : <List size={20} />}</button>
      </div>
    </div>
    {open && <nav className="shell grid border-t border-[var(--line)] py-3 md:hidden">{links.map(([label, href], index) => <Link onClick={() => setOpen(false)} className="flex items-center gap-4 border-b border-[var(--line)] px-1 py-4 text-sm font-black uppercase tracking-[.12em] hover:text-[var(--accent)]" key={href} href={href}><span className="text-[10px] text-[var(--muted)]">0{index + 1}</span>{label}</Link>)}</nav>}
  </header>;
}
