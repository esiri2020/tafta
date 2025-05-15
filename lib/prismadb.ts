import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: ['query', 'error', 'warn'],
  })
}

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined
}

const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

// Handle connection errors
// prisma.$on('query' as any, (e: { query: string; duration: number }) => {
//   console.log('Query:', e.query)
//   console.log('Duration:', e.duration, 'ms')
// })

// prisma.$on('error' as any, (e: Error) => {
//   console.error('Prisma Error:', e)
// })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma