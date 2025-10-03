import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Predefined mobilizer codes
const predefinedMobilizerCodes = [
  'TK001', 'TK002', 'TK003', 'TK004', 'TK005',
  'TK006', 'TK007', 'TK008', 'TK009', 'TK010',
  'TK011', 'TK012', 'TK013', 'TK014', 'TK015',
  'TK016', 'TK017', 'TK018', 'TK019', 'TK020'
];

async function seedMobilizerCodes() {
  console.log('🌱 Starting mobilizer codes seeding...');

  try {
    // Check if mobilizer codes already exist
    const existingCount = await prisma.mobilizerCode.count();
    if (existingCount > 0) {
      console.log(`✅ ${existingCount} mobilizer codes already exist. Skipping seeding.`);
      return;
    }

    // Create mobilizer code records
    const mobilizerCodeData = predefinedMobilizerCodes.map((code) => ({
      code,
      isAvailable: true,
    }));

    const createdCodes = await prisma.mobilizerCode.createMany({
      data: mobilizerCodeData,
      skipDuplicates: true,
    });

    console.log(`✅ Successfully created ${createdCodes.count} mobilizer code records`);
    console.log('📋 Available mobilizer codes:');
    predefinedMobilizerCodes.forEach((code) => console.log(`   - ${code}`));

  } catch (error) {
    console.error('❌ Error seeding mobilizer codes:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding function
seedMobilizerCodes()
  .then(() => {
    console.log('🎉 Mobilizer codes seeding completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Mobilizer codes seeding failed:', error);
    process.exit(1);
  });

