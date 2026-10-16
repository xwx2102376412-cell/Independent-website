import type { Metadata } from "next";
import Link from "next/link";
import { CustomerAuthForm } from "@/components/customer-auth-form";

export const metadata: Metadata = { title: "Create account" };

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const nextPath = (await searchParams).next?.startsWith("/") ? (await searchParams).next! : "/account";
  return <main className="grid-noise min-h-[70dvh] border-b border-[var(--line)]"><div className="shell grid py-16 lg:grid-cols-[1fr_1fr]"><div className="max-w-xl lg:py-10"><p className="eyebrow text-[var(--accent)]">Rider access / 02</p><h1 className="display mt-5 text-6xl sm:text-7xl">START<br />RIDING.</h1><p className="mt-6 max-w-md text-[var(--muted)]">Create an account to sync your cart, complete purchases, and track every order.</p></div><div className="machine-panel mt-10 p-6 sm:p-8 lg:mt-0"><p className="micro-label">New rider profile</p><div className="mt-7"><CustomerAuthForm mode="register" nextPath={nextPath} /></div><p className="mt-6 border-t border-[var(--line)] pt-5 text-sm text-[var(--muted)]">Already have an account? <Link className="font-bold text-[var(--accent)]" href={`/login?next=${encodeURIComponent(nextPath)}`}>Log in</Link></p></div></div></main>;
}
