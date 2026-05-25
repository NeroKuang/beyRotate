import { loadEnvLocal } from "../src/lib/load-env";
import { syncCatalogParts } from "../src/lib/sync-parts";
import { invalidateCatalogCache } from "../src/lib/catalog/cache";

loadEnvLocal();

syncCatalogParts()
  .then(async (n) => {
    await invalidateCatalogCache();
    console.log("零件目錄已同步:", n, "筆");
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
