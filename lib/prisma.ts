import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'path'
import type { SqlDriverAdapterFactory } from '@prisma/client/runtime/client.js'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function createPrismaClient(): PrismaClient {
  const dbPath = path.resolve(process.cwd(), 'prisma/dev.db')
  const adapter = new PrismaBetterSqlite3({ url: dbPath }) as unknown as SqlDriverAdapterFactory
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma || createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
