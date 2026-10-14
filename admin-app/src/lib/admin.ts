import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { getAdminIdentity } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const requireAdmin = cache(async () => {
  const identity = await getAdminIdentity();
  if (!identity) redirect("/login");
  if (!process.env.DATABASE_URL) throw new Error("尚未配置 PostgreSQL 数据库");

  const existing = await prisma.adminUser.findUnique({ where: { email: identity.email }, include: { role: true } });
  if (existing) {
    if (!existing.active) redirect("/login");
    return existing;
  }

  const role = await prisma.adminRole.upsert({
    where: { code: "OWNER" },
    update: { name: "所有者", permissions: ["*"] },
    create: { code: "OWNER", name: "所有者", permissions: ["*"] },
  });
  const user = await prisma.adminUser.create({
    data: { email: identity.email, name: "RIVET 管理员", roleId: role.id },
    include: { role: true },
  });
  return user;
});
