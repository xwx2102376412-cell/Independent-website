import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { rivetAdminPrisma?: PrismaClient };

export const prisma = globalForPrisma.rivetAdminPrisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.rivetAdminPrisma = prisma;
