import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BatteryCharging, ShieldCheck, Wrench } from "@phosphor-icons/react/dist/ssr";
import { ProductCard } from "@/components/product-card";
import { getProducts } from "@/lib/products";

export default async function Home() {
  const products = await getProducts();
  return <main>
    <section className="grid-noise min-h-[calc(100dvh-72px)] border-b border-[var(--line)]">
      <div className="shell grid min-h-[calc(100dvh-72px)] items-center gap-10 py-12 lg:grid-cols-[.8fr_1.2fr] lg:py-16">
        <div className="hero-copy relative z-10 max-w-xl"><p className="eyebrow text-[var(--accent)]">American city commuter</p><h1 className="display mt-5 text-5xl sm:text-6xl lg:text-7xl">BUILT FOR ROUGH COMMUTES.</h1><p className="mt-6 max-w-md text-lg leading-7 text-[var(--muted)]">Rugged electric bikes engineered for daily streets, hard weather, and real cargo.</p><div className="mt-8 flex flex-wrap gap-3"><Link className="button focus-ring inline-flex items-center gap-3 rounded-lg bg-[var(--accent)] px-6 py-4 font-black text-[#171819]" href="/bikes">Shop bikes <ArrowRight size={19} weight="bold" /></Link><Link className="button focus-ring rounded-lg border border-[var(--line)] px-6 py-4 font-bold" href="/compare">Compare models</Link></div></div>
        <div className="hero-visual overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)]"><Image src="/images/rivet-hero.png" alt="Graphite RIVET commuter e-bike under a concrete city overpass" width={1536} height={1024} priority className="min-h-[420px] w-full object-cover lg:min-h-[620px]" /></div>
      </div>
    </section>
    <section className="border-b border-[var(--line)] py-20"><div className="shell"><h2 className="display max-w-2xl text-4xl sm:text-5xl">THREE WAYS THROUGH THE CITY.</h2><p className="mt-5 max-w-xl text-[var(--muted)]">Choose a practical daily platform, then configure the exact battery and finish you need.</p><div className="mt-10 grid gap-6 lg:grid-cols-2">{products.map((product, index) => <div key={product.id} className={index === 2 ? "lg:col-span-2 lg:w-[68%] lg:justify-self-end" : ""}><ProductCard product={product} priority={index === 0} /></div>)}</div></div></section>
    <section className="py-24"><div className="shell grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:items-center"><div><h2 className="display text-4xl sm:text-5xl">COMMUTE HARDER. MAINTAIN LESS.</h2><p className="mt-5 max-w-md leading-7 text-[var(--muted)]">Every sample model starts with practical equipment for year-round American city riding.</p></div><div className="grid gap-8 sm:grid-cols-2"><Feature icon={<BatteryCharging size={28} />} title="Integrated power" text="Frame-mounted batteries stay protected and easy to charge." /><Feature icon={<ShieldCheck size={28} />} title="Street-ready equipment" text="Lights, fenders, hydraulic brakes, and cargo mounts come standard." /><Feature icon={<Wrench size={28} />} title="Serviceable parts" text="Common wear components use familiar bicycle standards." /></div></div></section>
    <section className="bg-[var(--surface)] py-20"><div className="shell flex flex-col items-start justify-between gap-8 md:flex-row md:items-end"><div><h2 className="display max-w-xl text-4xl sm:text-5xl">PUT RIVET ON YOUR FLOOR.</h2><p className="mt-5 max-w-lg text-[var(--muted)]">Dealer and fleet inquiries are tracked in our local B2B workspace.</p></div><Link href="/dealer" className="button focus-ring rounded-lg bg-[var(--foreground)] px-6 py-4 font-black text-[var(--background)]">Become a dealer</Link></div></section>
  </main>;
}

function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) { return <div className="border-t border-[var(--line)] pt-5"><div className="text-[var(--accent)]">{icon}</div><h3 className="mt-5 text-xl font-black">{title}</h3><p className="mt-2 text-sm leading-6 text-[var(--muted)]">{text}</p></div>; }
