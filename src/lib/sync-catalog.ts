import { GO_SHOOT_DB } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { buildVariantDisplayLabel } from "@/lib/catalog/display-label";
import { packageLabelZh } from "@/lib/catalog/package-labels";
import { parseBuildString } from "@/lib/catalog/parse-build";
import { loadPartsDb, resolvePartNames } from "@/lib/catalog/parts-db";
import { coatZh } from "@/lib/catalog/part-names-zh";
import { invalidateCatalogCache } from "@/lib/catalog/cache";
import { syncCatalogParts } from "@/lib/sync-parts";
import { inferProductSeries } from "@/lib/catalog/series";

type BeyRow = [string, string, string, string?, Record<string, unknown>?];

type KeihinEntry = {
  type?: string;
  date?: string;
  note?: string;
  ver?: string[];
  img?: unknown;
  abbr?: string;
};

export type SyncCatalogResult = {
  beys: number;
  gear: number;
  keihin: number;
  parts: number;
  skippedDuplicateRows: number;
  sourceBeyRows: number;
  sourceBeyCodes: number;
};

function strOrNull(v: unknown): string | null {
  if (v == null || v === "") return null;
  return String(v);
}

function variantLabel(
  code: string,
  pkg: string,
  parts: { bladeNameZh: string | null; ratchetNameZh: string | null; bitNameZh: string | null },
  meta?: Record<string, unknown>
): string {
  return buildVariantDisplayLabel({
    code,
    packageType: pkg,
    bladeNameZh: parts.bladeNameZh,
    ratchetNameZh: parts.ratchetNameZh,
    bitNameZh: parts.bitNameZh,
    meta,
  });
}

function pkgSortOrder(pkg: string): number {
  const order = ["St", "St H", "SS", "SS H", "S", "S H", "B", "B H", "RB", "RB H", "Lm", "Lm H"];
  const i = order.indexOf(pkg);
  return i === -1 ? 99 : i;
}

function normalizeKeihinCode(code: string): string {
  return code.replace(/\s+/g, "").trim();
}

export async function syncCatalog(): Promise<SyncCatalogResult> {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "缺少 DATABASE_URL。請 cp .env.example .env.local 並執行 npm run docker:up && npm run db:setup"
    );
  }

  const partsDb = await loadPartsDb();

  await prisma.catalogCategory.createMany({
    data: [
      { id: "bey", nameZh: "陀螺" },
      { id: "launcher", nameZh: "發射器" },
      { id: "keihin", nameZh: "景品／限定" },
      { id: "other", nameZh: "其他" },
    ],
    skipDuplicates: true,
  });

  const [beysRes, gearRes, keihinRes] = await Promise.all([
    fetch(`${GO_SHOOT_DB}/prod-beys.json`),
    fetch(`${GO_SHOOT_DB}/prod-gear.json`),
    fetch(`${GO_SHOOT_DB}/prod-keihin.json`),
  ]);

  if (!beysRes.ok || !gearRes.ok || !keihinRes.ok) {
    throw new Error("Failed to fetch go-shoot data");
  }

  const beys = (await beysRes.json()) as BeyRow[];
  const gear = await gearRes.json();
  const keihins = (await keihinRes.json()) as Record<string, KeihinEntry>;

  const sourceCodes = new Set(beys.map((r) => r[0]));
  const rowKeys = new Set<string>();
  let skippedDuplicateRows = 0;

  let beyCount = 0;

  for (const row of beys) {
    const [code, pkg, build, youtubeOrId, meta] = row;
    const buildStr = (build ?? "").trim();
    const pkgStr = (pkg ?? "").trim();
    const rowKey = `${code}|${pkgStr}|${buildStr}`;

    if (rowKeys.has(rowKey)) {
      skippedDuplicateRows++;
      continue;
    }
    rowKeys.add(rowKey);

    const parsed = parseBuildString(buildStr);
    const partNames = resolvePartNames(parsed, code, partsDb);
    const youtubeId =
      typeof youtubeOrId === "string" && youtubeOrId.length > 4 ? youtubeOrId : null;

    const product = await prisma.catalogProduct.upsert({
      where: {
        categoryId_code: { categoryId: "bey", code },
      },
      create: { categoryId: "bey", code, series: inferProductSeries(code) },
      update: { series: inferProductSeries(code) },
    });

    await prisma.catalogVariant.upsert({
      where: {
        productId_packageType_buildString: {
          productId: product.id,
          packageType: pkgStr,
          buildString: buildStr,
        },
      },
      create: {
        productId: product.id,
        packageType: pkgStr,
        buildString: buildStr,
        packageLabelZh: packageLabelZh(pkgStr),
        bladeAbbr: parsed.bladeAbbr || null,
        ratchetAbbr: parsed.ratchetAbbr,
        bitAbbr: parsed.bitAbbr,
        bladeNameZh: partNames.bladeNameZh,
        ratchetNameZh: partNames.ratchetNameZh,
        bitNameZh: partNames.bitNameZh,
        coat: coatZh(meta?.coat as string | undefined) ?? strOrNull(meta?.coat),
        regionTag: strOrNull(meta?.get),
        youtubeId,
        meta: (meta ?? {}) as object,
        displayLabel: variantLabel(code, pkgStr, partNames, meta),
        sortOrder: pkgSortOrder(pkgStr),
      },
      update: {
        packageLabelZh: packageLabelZh(pkgStr),
        bladeAbbr: parsed.bladeAbbr || null,
        ratchetAbbr: parsed.ratchetAbbr,
        bitAbbr: parsed.bitAbbr,
        bladeNameZh: partNames.bladeNameZh,
        ratchetNameZh: partNames.ratchetNameZh,
        bitNameZh: partNames.bitNameZh,
        coat: coatZh(meta?.coat as string | undefined) ?? strOrNull(meta?.coat),
        regionTag: strOrNull(meta?.get),
        youtubeId,
        meta: (meta ?? {}) as object,
        displayLabel: variantLabel(code, pkgStr, partNames, meta),
        sortOrder: pkgSortOrder(pkgStr),
      },
    });
    beyCount++;
  }

  let gearCount = 0;
  const launchers = gear?.[0]?.launchers ?? [];

  for (const launcher of launchers) {
    for (const color of launcher.colors ?? []) {
      const code = color[0];
      if (!code || typeof code !== "string") continue;
      const pkgStr = String(color[1] ?? "");

      const product = await prisma.catalogProduct.upsert({
        where: {
          categoryId_code: { categoryId: "launcher", code },
        },
        create: {
          categoryId: "launcher",
          code,
          series: "launcher",
          meta: { desc: launcher.desc },
        },
        update: { meta: { desc: launcher.desc }, series: "launcher" },
      });

      const buildStr = launcher.eng ?? code;
      const desc = launcher.desc ?? "發射器";
      await prisma.catalogVariant.upsert({
        where: {
          productId_packageType_buildString: {
            productId: product.id,
            packageType: pkgStr,
            buildString: buildStr,
          },
        },
        create: {
          productId: product.id,
          packageType: pkgStr,
          buildString: buildStr,
          packageLabelZh: desc,
          displayLabel: `${code} · ${desc}`,
          sortOrder: 0,
        },
        update: {
          packageLabelZh: desc,
          displayLabel: `${code} · ${desc}`,
        },
      });
      gearCount++;
    }
  }

  let keihinCount = 0;
  for (const [rawCode, info] of Object.entries(keihins)) {
    const code = normalizeKeihinCode(rawCode);
    const note = info.note?.trim() ?? "";
    const verZh = info.ver?.[0] ?? info.ver?.[1] ?? "";
    const labelParts = [code, "景品／限定", note, verZh].filter(Boolean);

    const product = await prisma.catalogProduct.upsert({
      where: { categoryId_code: { categoryId: "keihin", code } },
      create: {
        categoryId: "keihin",
        code,
        series: "keihin",
        meta: info as object,
      },
      update: { meta: info as object, series: "keihin" },
    });

    const buildStr = note || code;
    await prisma.catalogVariant.upsert({
      where: {
        productId_packageType_buildString: {
          productId: product.id,
          packageType: "景品",
          buildString: buildStr,
        },
      },
      create: {
        productId: product.id,
        packageType: "景品",
        buildString: buildStr,
        packageLabelZh: "景品／限定",
        displayLabel: labelParts.join(" · "),
        meta: info as object,
        sortOrder: 0,
      },
      update: {
        packageLabelZh: "景品／限定",
        displayLabel: labelParts.join(" · "),
        meta: info as object,
      },
    });
    keihinCount++;
  }

  const partsCount = await syncCatalogParts();

  const result: SyncCatalogResult = {
    beys: beyCount,
    gear: gearCount,
    keihin: keihinCount,
    parts: partsCount,
    skippedDuplicateRows,
    sourceBeyRows: beys.length,
    sourceBeyCodes: sourceCodes.size,
  };

  await prisma.catalogMeta.upsert({
    where: { key: "last_synced" },
    create: {
      key: "last_synced",
      value: { at: new Date().toISOString(), ...result },
    },
    update: {
      value: { at: new Date().toISOString(), ...result },
    },
  });

  await invalidateCatalogCache();

  return result;
}
