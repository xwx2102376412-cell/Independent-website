import { AdminShell } from "@/components/admin-shell";
import { requireAdmin } from "@/lib/admin";

export default async function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const storefrontUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
  return <AdminShell email={admin.email} roleName={admin.role.name} storefrontUrl={storefrontUrl}>{children}</AdminShell>;
}
