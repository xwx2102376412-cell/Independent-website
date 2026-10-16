import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { money, type StoreProduct } from "@/lib/demo-products";

export function ProductCard({ product, priority = false }: { product: StoreProduct; priority?: boolean }) {
  const price = Math.min(...product.variants.map((variant) => variant.price));
  return <article className="machine-panel group overflow-hidden">
    <Link href={`/bikes/${product.slug}`} className="focus-ring relative block overflow-hidden"><span className="micro-label absolute left-4 top-4 z-10 bg-[#080a09]/85 px-3 py-2 text-[var(--foreground)]">Electric / {product.motorWatts}W</span><Image src={product.imageUrl} alt={`${product.name} electric bike`} width={1536} height={1024} priority={priority} className="aspect-[4/3] w-full object-cover saturate-[.72] contrast-[1.08] transition duration-500 group-hover:scale-[1.025] group-hover:saturate-100" /></Link>
    <div className="grid gap-5 border-t border-[var(--line)] p-6 sm:grid-cols-[1fr_auto] sm:items-end"><div><p className="micro-label">Urban machine</p><h3 className="mt-2 text-2xl font-black uppercase tracking-[-.045em]">{product.name}</h3><p className="mt-2 text-sm text-[var(--muted)]">{product.tagline}</p><p className="mt-5 text-sm font-black uppercase tracking-[.08em] text-[var(--accent)]">From {money(price)}</p></div><Link href={`/bikes/${product.slug}`} className="focus-ring flex h-12 w-12 items-center justify-center border border-[var(--accent)] text-[var(--accent)] transition hover:bg-[var(--accent)] hover:text-[var(--accent-ink)]" aria-label={`View ${product.name}`}><ArrowUpRight size={20} weight="bold" /></Link></div>
  </article>;
}
