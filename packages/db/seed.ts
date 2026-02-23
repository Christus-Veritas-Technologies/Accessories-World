import { PrismaClient } from "./src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  try {
    // Delete existing admin if exists
    await prisma.admin.deleteMany({
      where: { email: "admin@accessoriesworld.co.zw" },
    });

    // Hash password using Bun's built-in password hashing
    const passwordHash = await Bun.password.hash("12345678", {
      algorithm: "bcrypt",
      cost: 4,
    });

    // Create admin user
    const admin = await prisma.admin.create({
      data: {
        email: "admin@accessoriesworld.co.zw",
        name: "Admin",
        passwordHash,
        whatsapp: "+263784923973",
        isAdmin: true,
      },
    });

    console.log("✅ Admin user created:");
    console.log(`   Email: ${admin.email}`);
    console.log(`   Name: ${admin.name}`);
    console.log(`   WhatsApp: ${admin.whatsapp}`);
    console.log(`   Password: 12345678`);

    // Create default categories
    const categories = [
      { name: "Headphones", slug: "headphones", description: "Quality headphones and earbuds" },
      { name: "Chargers", slug: "chargers", description: "Fast chargers and power supplies" },
      { name: "Cables", slug: "cables", description: "Phone and device cables" },
      { name: "Phone Cases", slug: "cases", description: "Protective phone cases" },
      { name: "Speakers", slug: "speakers", description: "Portable and home speakers" },
      { name: "Power Banks", slug: "power-banks", description: "Mobile power banks" },
    ];

    for (const cat of categories) {
      await prisma.category.upsert({
        where: { slug: cat.slug },
        update: {},
        create: cat,
      });
    }

    console.log(`✅ Created ${categories.length} categories`);
    console.log("\n✅ Database seeded successfully!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
