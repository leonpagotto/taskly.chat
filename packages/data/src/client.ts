import { PrismaClient } from '@prisma/client';

// Singleton Prisma client (simple for now; may add logging/middleware later)
let globalAny = global as any;

export const prisma: PrismaClient = globalAny.__tasklyPrisma || new PrismaClient();
if (!globalAny.__tasklyPrisma) {
  globalAny.__tasklyPrisma = prisma;
}
