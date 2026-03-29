import "dotenv/config";
import fs from 'fs';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { PrismaClient } from '../lib/generated/prisma/client';

const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("Reading CSV...");
    const csvData = fs.readFileSync('C:/Users/adoma/Downloads/Courses.csv', 'utf8');
    const lines = csvData.split(/\r?\n/).filter((line: string) => line.trim() !== '');
    
    // skip header row
    const courses = lines.slice(1).map((line: string) => {
        const [name, code] = line.split(',');
        return {
            name: name ? name.trim() : '',
            code: code ? code.trim() : '',
        };
    });

    console.log(`Found ${courses.length} courses in CSV. Seeding...`);

    let count = 0;
    for (const course of courses) {
        if (!course.code || !course.name) continue;
        
        await prisma.course.upsert({
            where: { code: course.code },
            update: { name: course.name },
            create: {
                code: course.code,
                name: course.name,
            }
        });
        count++;
    }

    console.log(`Successfully seeded/updated ${count} courses into the database.`);
}

main()
    .catch((e) => {
        console.error("Error during seed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
