import { loadEnvLocal } from "../src/lib/load-env";
import { PrismaClient } from "@prisma/client";

loadEnvLocal();

const GO_SHOOT = "https://go-shoot.github.io/x/db";

type BeyRow = [string, string, string, string?, Record<string, unknown>?];

async function main() {
  const prisma = new PrismaClient();

  const [beysRes, keihinRes] = await Promise.all([
    fetch(`${GO_SHOOT}/prod-beys.json`),
    fetch(`${GO_SHOOT}/prod-keihin.json`),
  ]);

  const beys = (await beysRes.json()) as BeyRow[];
  const keihins = (await keihinRes.json()) as Record<string, unknown>;

  const goCodes = new Set(beys.map((r) => r[0]));
  const goKeys = new Set(
    beys.map((r) => `${r[0]}|${r[1] ?? ""}|${(r[2] ?? "").trim()}`)
  );
  const dupRows = beys.length - goKeys.size;

  const dbProducts = await prisma.catalogProduct.findMany({
    where: { categoryId: "bey" },
    select: { code: true },
  });
  const dbCodes = new Set(dbProducts.map((p) => p.code));
  const dbVariants = await prisma.catalogVariant.count({
    where: { product: { categoryId: "bey" } },
  });

  const missingInDb = [...goCodes].filter((c) => !dbCodes.has(c));
  const extraInDb = [...dbCodes].filter((c) => !goCodes.has(c));

  const keihinCodes = Object.keys(keihins);
  const dbKeihin = await prisma.catalogProduct.count({
    where: { categoryId: "keihin" },
  });

  console.log("=== go-shoot prod-beys.json ===");
  console.log("列數（品項）:", beys.length);
  console.log("不重複產品編號:", goCodes.size);
  console.log("來源完全重複列（合併為一筆）:", dupRows);

  console.log("\n=== 資料庫（陀螺 bey）===");
  console.log("產品編號數:", dbCodes.size);
  console.log("品項列數:", dbVariants);

  const bySeries = await prisma.catalogProduct.groupBy({
    by: ["series"],
    where: { categoryId: "bey" },
    _count: true,
  });
  console.log("\n=== 資料庫系列分布 ===");
  bySeries
    .sort((a, b) => a.series.localeCompare(b.series))
    .forEach((r) => console.log(`  ${r.series}: ${r._count} 個編號`));

  console.log("\n=== 差異 ===");
  console.log("缺少編號:", missingInDb.length ? missingInDb.join(", ") : "無");
  console.log("多餘編號:", extraInDb.length ? extraInDb.join(", ") : "無");

  console.log("\n=== 景品 prod-keihin.json ===");
  console.log("go-shoot 景品編號:", keihinCodes.length);
  console.log("資料庫景品:", dbKeihin);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
