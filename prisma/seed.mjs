import {PrismaClient} from '@prisma/client';
import pkg from 'bcryptjs';
const {hash} = pkg;

const prisma = new PrismaClient();

async function main() {
  // Create Super Admin
  const superAdminPassword = await hash('Admin@123', 12);
  const superAdmin = await prisma.user.upsert({
    where: {email: 'superadmin@tafta.com'},
    update: {},
    create: {
      email: 'superadmin@tafta.com',
      password: superAdminPassword,
      firstName: 'Super',
      lastName: 'Admin',
      role: 'SUPERADMIN',
    },
  });

  // Create Regular Admin
  const adminPassword = await hash('Admin@123', 12);
  const admin = await prisma.user.upsert({
    where: {email: 'admin@tafta.com'},
    update: {},
    create: {
      email: 'admin@tafta.com',
      password: adminPassword,
      firstName: 'Regular',
      lastName: 'Admin',
      role: 'ADMIN',
    },
  });

  // Create Support User
  const supportPassword = await hash('Support@123', 12);
  const support = await prisma.user.upsert({
    where: {email: 'support@tafta.com'},
    update: {},
    create: {
      email: 'support@tafta.com',
      password: supportPassword,
      firstName: 'Support',
      lastName: 'User',
      role: 'SUPPORT',
    },
  });

  // Create Regular User
  const userPassword = await hash('User@123', 12);
  const user = await prisma.user.upsert({
    where: {email: 'user@tafta.com'},
    update: {},
    create: {
      email: 'user@tafta.com',
      password: userPassword,
      firstName: 'Regular',
      lastName: 'User',
      role: 'USER',
    },
  });

  console.log({superAdmin, admin, support, user});

  // Create a sample cohort
  const cohort = await prisma.cohort.upsert({
    where: {id: 'test-cohort-1'},
    update: {},
    create: {
      id: 'test-cohort-1',
      name: 'Test Cohort 2024',
      start_date: new Date('2024-01-01'),
      end_date: new Date('2024-12-31'),
      active: true,
      color: '#FF5733',
    },
  });

  console.log({cohort});
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

// npx prisma db seed