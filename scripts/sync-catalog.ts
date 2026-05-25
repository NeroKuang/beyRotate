import { loadEnvLocal } from "../src/lib/load-env";
import { syncCatalog } from "../src/lib/sync-catalog";

loadEnvLocal();

syncCatalog()
  .then((r) => {
    console.log("Catalog synced:");
    console.log(`  陀螺品項: ${r.beys}（go-shoot ${r.sourceBeyRows} 列 / ${r.sourceBeyCodes} 個編號）`);
    if (r.skippedDuplicateRows) {
      console.log(`  略過重複列: ${r.skippedDuplicateRows}`);
    }
    console.log(`  發射器: ${r.gear}`);
    console.log(`  景品: ${r.keihin}`);
    console.log(`  單獨零件: ${r.parts}`);
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
