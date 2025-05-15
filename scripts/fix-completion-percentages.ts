const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixCompletionPercentages() {
  try {
    console.log('Starting completion percentage fix...');

    // Get all enrollments with percentage_completed > 1
    const enrollments = await prisma.enrollment.findMany({
      where: {
        percentage_completed: {
          gt: 1
        }
      }
    });

    console.log(`Found ${enrollments.length} enrollments with percentage > 1`);

    // Update each enrollment
    for (const enrollment of enrollments) {
      const newPercentage = enrollment.percentage_completed! / 100;
      await prisma.enrollment.update({
        where: { uid: enrollment.uid },
        data: { percentage_completed: newPercentage }
      });
      console.log(`Updated enrollment ${enrollment.uid}: ${enrollment.percentage_completed} -> ${newPercentage}`);
    }

    console.log('Completed percentage fix!');
  } catch (error) {
    console.error('Error fixing completion percentages:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixCompletionPercentages(); 