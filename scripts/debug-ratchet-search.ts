import { loadEnvLocal } from "../src/lib/load-env";
import { parseRatchetQuery, expandRatchetSearchTerms } from "../src/lib/catalog/ratchet-search";
import { searchCatalogParts } from "../src/lib/catalog/search-parts";
import { prisma } from "../src/lib/prisma";

loadEnvLocal();

const queries = ["7-60", "7 - 60", "七刃高度60", "四刃70", "4-70", "7刃", "M-85"];

async function main() {
  for (const q of queries) {
    console.log(q, "→", parseRatchetQuery(q), expandRatchetSearchTerms(q).slice(0, 4));
    const hits = await searchCatalogParts(q, { partType: "ratchet", limit: 3 });
    console.log("  hits:", hits.map((h) => h.display_label).join(" | "));
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
