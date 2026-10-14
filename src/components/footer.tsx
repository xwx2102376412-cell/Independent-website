import Link from "next/link";

export function Footer() {
  return <footer className="border-t border-[var(--line)] py-14"><div className="shell grid gap-10 md:grid-cols-[1.6fr_1fr_1fr]">
    <div><div className="text-2xl font-black tracking-[-.06em]">RIVET<span className="text-[var(--accent)]">/</span></div><p className="mt-4 max-w-sm text-sm leading-6 text-[var(--muted)]">Demo storefront for local development. Products, specifications, policies, and availability are sample data.</p></div>
    <div><h2 className="font-bold">Shop</h2><div className="mt-4 grid gap-3 text-sm text-[var(--muted)]"><Link href="/bikes">Bikes</Link><Link href="/compare">Compare</Link><Link href="/cart">Cart</Link></div></div>
    <div><h2 className="font-bold">Company</h2><div className="mt-4 grid gap-3 text-sm text-[var(--muted)]"><Link href="/dealer">Dealer program</Link><Link href="/wholesale">Wholesale</Link><Link href="/contact">Contact</Link></div></div>
  </div><div className="shell mt-12 border-t border-[var(--line)] pt-5 text-xs text-[var(--muted)]">© 2026 RIVET E-BIKES. Local demonstration only.</div></footer>;
}
