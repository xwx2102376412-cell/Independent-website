import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return <footer className="border-t border-[var(--line)] bg-[#060706] py-14"><div className="shell grid gap-12 md:grid-cols-[1.7fr_1fr_1fr]">
    <div><div className="relative h-14 w-48 overflow-hidden"><Image src="/api/brand-logo" alt="TUKEN OX" width={1540} height={1540} unoptimized className="absolute left-1/2 top-1/2 h-48 w-48 max-w-none -translate-x-1/2 -translate-y-1/2 invert" /></div><p className="mt-5 max-w-sm text-sm leading-6 text-[var(--muted)]">Electric machines for the city. This local demonstration uses sample products, specifications, policies, and availability.</p></div>
    <div><h2 className="micro-label text-[var(--foreground)]">01 / Shop</h2><div className="mt-5 grid gap-3 text-sm text-[var(--muted)]"><Link className="hover:text-[var(--accent)]" href="/bikes">Machines</Link><Link className="hover:text-[var(--accent)]" href="/compare">Compare</Link><Link className="hover:text-[var(--accent)]" href="/cart">Cart</Link></div></div>
    <div><h2 className="micro-label text-[var(--foreground)]">02 / Company</h2><div className="mt-5 grid gap-3 text-sm text-[var(--muted)]"><Link className="hover:text-[var(--accent)]" href="/dealer">Dealer program</Link><Link className="hover:text-[var(--accent)]" href="/wholesale">Wholesale</Link><Link className="hover:text-[var(--accent)]" href="/contact">Contact</Link></div></div>
  </div><div className="shell mt-12 flex flex-wrap justify-between gap-3 border-t border-[var(--line)] pt-5 text-[10px] font-bold uppercase tracking-[.16em] text-[var(--muted)]"><span>© 2026 TUKEN OX</span><span>Local demonstration only / System 01</span></div></footer>;
}
