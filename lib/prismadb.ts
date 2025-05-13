import { PrismaClient } from "@prisma/client"

declare global {
  var prisma: PrismaClient | undefined
}

const prisma = global.prisma || new PrismaClient({
  log: ['query', 'error', 'warn'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

// Handle connection errors
// prisma.$on('query' as any, (e: { query: string; duration: number }) => {
//   console.log('Query:', e.query)
//   console.log('Duration:', e.duration, 'ms')
// })

// prisma.$on('error' as any, (e: Error) => {
//   console.error('Prisma Error:', e)
// })

if (process.env.NODE_ENV !== "production") global.prisma = prisma

export default prisma