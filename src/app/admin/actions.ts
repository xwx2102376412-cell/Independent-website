"use server";

import { timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clearAdminSession, createAdminSession, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const same = (a: string, b: string) => { const aa = Buffer.from(a); const bb = Buffer.from(b); return aa.length === bb.length && timingSafeEqual(aa, bb); };
export async function login(form: FormData) { const email = String(form.get("email") ?? ""); const password = String(form.get("password") ?? ""); if (!same(email, process.env.ADMIN_EMAIL ?? "admin@rivet.local") || !same(password, process.env.ADMIN_PASSWORD ?? "change-me-before-sharing")) redirect("/admin/login?error=1"); await createAdminSession(email); redirect("/admin"); }
export async function logout() { await clearAdminSession(); redirect("/admin/login"); }
async function guard() { if (!(await isAdmin())) throw new Error("Unauthorized"); if (!process.env.DATABASE_URL) throw new Error("PostgreSQL is not configured"); }

export async function createProduct(form: FormData) { await guard(); const name = String(form.get("name")); const slug = String(form.get("slug")); const basePrice = Math.round(Number(form.get("price")) * 100); const sku = String(form.get("sku")); await prisma.product.create({ data: { name, slug, tagline: String(form.get("tagline")), description: String(form.get("description")), imageUrl: String(form.get("imageUrl") || "/images/rivet-hero.png"), status: "ACTIVE", marketVersions: { create: { market: "US", currency: "USD", basePrice, motorWatts: Number(form.get("motorWatts")), speedMph: Number(form.get("speedMph")), rangeMiles: Number(form.get("rangeMiles")), variants: { create: { sku, color: String(form.get("color")), colorHex: String(form.get("colorHex")), batteryWh: Number(form.get("batteryWh")), motorWatts: Number(form.get("motorWatts")), tire: String(form.get("tire")), price: basePrice, inventory: { create: { onHand: Number(form.get("stock")) } } } } } } } }); revalidatePath("/admin"); revalidatePath("/bikes"); }
export async function updateProduct(form: FormData) { await guard(); await prisma.product.update({ where: { id: String(form.get("id")) }, data: { name: String(form.get("name")), tagline: String(form.get("tagline")), description: String(form.get("description")), imageUrl: String(form.get("imageUrl")), featured: form.get("featured") === "on" } }); revalidatePath("/admin"); revalidatePath("/bikes"); }
export async function archiveProduct(form: FormData) { await guard(); await prisma.product.update({ where: { id: String(form.get("id")) }, data: { status: "ARCHIVED" } }); revalidatePath("/admin"); revalidatePath("/bikes"); }
export async function updateInventory(form: FormData) { await guard(); await prisma.inventory.update({ where: { variantId: String(form.get("variantId")) }, data: { onHand: Number(form.get("onHand")) } }); revalidatePath("/admin"); revalidatePath("/bikes"); }
export async function updateOrderStatus(form: FormData) { await guard(); const status = String(form.get("status")) as "PENDING" | "APPROVED" | "PAID" | "CANCELLED" | "FULFILLED" | "REFUNDED"; if (status === "PAID") throw new Error("Manual paid status is disabled. Payment must be confirmed by webhook."); await prisma.order.update({ where: { id: String(form.get("id")) }, data: { status } }); revalidatePath("/admin"); }
export async function updateInquiryStatus(form: FormData) { await guard(); const status = String(form.get("status")) as "NEW" | "CONTACTED" | "QUALIFIED" | "QUOTED" | "NEGOTIATING" | "WON" | "LOST"; await prisma.inquiry.update({ where: { id: String(form.get("id")) }, data: { status } }); revalidatePath("/admin"); }
