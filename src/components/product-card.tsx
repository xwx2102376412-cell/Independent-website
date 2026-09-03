import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { money, type StoreProduct } from "@/lib/demo-products";

export function ProductCard({ product, priority = false }: { product: StoreProduct; priority?: boolean }) {
  const price = Math.min(...product.variants.map((variant) => variant.price));
  return <article className="group overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)]">
    <Link href={`/bikes/${product.slug}`} className="focus-ring block overflow-hidden"><Image src={product.imageUrl} alt={`${product.name} electric bike`} width={1536} height={1024} priority={priority} className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-[1.025]" /></Link>
    <div className="grid gap-5 p-6 sm:grid-cols-[1fr_auto] sm:items-end"><div><h3 className="text-2xl font-black tracking-tight">{product.name}</h3><p className="mt-2 text-sm text-[var(--muted)]">{product.tagline}</p><p className="mt-4 text-sm font-bold">From {money(price)}</p></div><Link href={`/bikes/${product.slug}`} className="focus-ring flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--accent)] text-[#171819]" aria-label={`View ${product.name}`}><ArrowUpRight size={20} weight="bold" /></Link></div>
  </article>;
}
