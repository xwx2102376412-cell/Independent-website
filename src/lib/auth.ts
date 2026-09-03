import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE = "rivet-admin";
const key = () => new TextEncoder().encode(process.env.SESSION_SECRET ?? "local-development-secret-change-this");

export async function createAdminSession(email: string) {
  const token = await new SignJWT({ email, role: "admin" }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("8h").sign(key());
  (await cookies()).set(COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 8 });
}

export async function clearAdminSession() {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return false;
  try { await jwtVerify(token, key()); return true; } catch { return false; }
}
