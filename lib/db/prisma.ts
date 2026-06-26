import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  adapter: {
    url: process.env.DATABASE_URL || "mysql://root:@localhost:3306/fingerhr"
  }
});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
