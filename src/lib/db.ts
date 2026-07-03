import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Use a fallback URL if DATABASE_URL is not set, so build doesn't fail on missing env
const connectionString = process.env.DATABASE_URL || "mysql://root:password@localhost:3306/skillbridge_db";

let prismaInstance: PrismaClient;

try {
  const adapter = new PrismaMariaDb(connectionString);
  prismaInstance =
    globalForPrisma.prisma ??
    new PrismaClient({
      adapter,
      log:
        process.env.NODE_ENV === "development"
          ? ["query", "error", "warn"]
          : ["error"],
    });
} catch (error) {
  console.error("Prisma initialization failed. Verify DATABASE_URL is correct.", error);
  // Fallback client to prevent compilation crash
  prismaInstance = new PrismaClient({} as any);
}

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prismaInstance;
}

export const prisma = prismaInstance;
export const db = prismaInstance;
export default prismaInstance;
