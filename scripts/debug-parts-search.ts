import { loadEnvLocal } from "../src/lib/load-env";
import { prisma } from "../src/lib/prisma";
import { searchCatalogParts } from "../src/lib/catalog/search-parts";

loadEnvLocal();

async function main() {
  const total = await prisma.catalogPart.count();
  const byScope = await prisma.catalogPart.groupBy({
    by: ["seriesScope"],
    _count: true,
  });
  console.log("total parts:", total);
  console.log("by seriesScope:", byScope);

  if (total === 0) {
    console.log("\n⚠️  catalog_parts 是空的，請執行: npm run sync:parts");
    return;
  }

  const samples = ["4", "FB", "帝皇", "紋章", "P", "peak"];
  for (const q of samples) {
    const all = await searchCatalogParts(q, { limit: 5 });
    console.log(`q="${q}" hits=${all.length}`, all[0]?.display_label);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
