import { PrismaClient } from "../generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

let db: PrismaClient;

if (typeof window === "undefined") {
  // Use a fallback URL if DATABASE_URL is not set, so build doesn't fail on missing env
  const connectionString = process.env.DATABASE_URL || "mysql://root:password@localhost:3306/skillbridge_db";
  
  try {
    const adapter = new PrismaMariaDb(connectionString);
    
    if (process.env.NODE_ENV === "production") {
      db = new PrismaClient({ adapter });
    } else {
      if (!globalForPrisma.prisma) {
        globalForPrisma.prisma = new PrismaClient({ adapter });
      }
      db = globalForPrisma.prisma;
    }
  } catch (error) {
    console.error("Prisma initialization failed. Verify DATABASE_URL is correct.", error);
    // Fallback client to prevent compilation crash
    db = new PrismaClient({} as any);
  }
} else {
  db = null as any;
}

export { db };
