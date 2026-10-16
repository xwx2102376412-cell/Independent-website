import type { Metadata } from "next";
import Link from "next/link";
import { CustomerAuthForm } from "@/components/customer-auth-form";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const nextPath = (await searchParams).next?.startsWith("/") ? (await searchParams).next! : "/account";
  return <main className="grid-noise min-h-[70dvh] border-b border-[var(--line)]"><div className="shell grid py-16 lg:grid-cols-[1fr_1fr]"><div className="max-w-xl lg:py-10"><p className="eyebrow text-[var(--accent)]">Rider access / 01</p><h1 className="display mt-5 text-6xl sm:text-7xl">WELCOME<br />BACK.</h1><p className="mt-6 max-w-md text-[var(--muted)]">Log in to sync your machine configuration across devices and complete your order.</p></div><div className="machine-panel mt-10 p-6 sm:p-8 lg:mt-0"><p className="micro-label">Secure session</p><div className="mt-7"><CustomerAuthForm mode="login" nextPath={nextPath} /></div><p className="mt-6 border-t border-[var(--line)] pt-5 text-sm text-[var(--muted)]">New here? <Link className="font-bold text-[var(--accent)]" href={`/register?next=${encodeURIComponent(nextPath)}`}>Create an account</Link></p></div></div></main>;
}
