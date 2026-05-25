import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.catalogCategory.createMany({
    data: [
      { id: "bey", nameZh: "陀螺" },
      { id: "launcher", nameZh: "發射器" },
      { id: "keihin", nameZh: "景品／限定" },
      { id: "other", nameZh: "其他" },
    ],
    skipDuplicates: true,
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
