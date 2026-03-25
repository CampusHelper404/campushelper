import { prisma } from './lib/prisma';

async function main() {
  try {
    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'HelperProfile';
    `;
    console.log('HelperProfile columns:', JSON.stringify(columns, null, 2));
  } catch (e) {
    console.error('Error fetching columns:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
