import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  catalogCacheKey,
  getCached,
  setCached,
} from "@/lib/catalog/cache";
import {
  mapVariant,
  type CatalogGroupDto,
  type CatalogVariantDto,
} from "@/lib/catalog/types";
import { compareProductCode } from "@/lib/catalog/sort-codes";
import { expandCatalogSearchTerms } from "@/lib/catalog/search-query";
import { inferProductSeries, seriesLabel, type ProductSeriesId } from "@/lib/catalog/series";

const variantInclude = { product: true } as const;

function productFilter(category: string, series?: string) {
  const base: Prisma.CatalogProductWhereInput = { categoryId: category };
  if (series && series !== "all") {
    base.series = series;
  }
  return base;
}

export function catalogSearchWhere(
  category: string,
  q: string,
  series?: string
): Prisma.CatalogVariantWhereInput {
  const product = productFilter(category, series);
  const trimmed = q.trim();
  if (!trimmed) {
    return { product };
  }

  const terms = expandCatalogSearchTerms(trimmed);
  const or: Prisma.CatalogVariantWhereInput[] = [];

  for (const term of terms) {
    or.push(
      { displayLabel: { contains: term, mode: "insensitive" } },
      { buildString: { contains: term, mode: "insensitive" } },
      { packageType: { contains: term, mode: "insensitive" } },
      { packageLabelZh: { contains: term, mode: "insensitive" } },
      { bladeNameZh: { contains: term, mode: "insensitive" } },
      { ratchetNameZh: { contains: term, mode: "insensitive" } },
      { bitNameZh: { contains: term, mode: "insensitive" } },
      { bladeAbbr: { contains: term, mode: "insensitive" } },
      { ratchetAbbr: { contains: term, mode: "insensitive" } },
      { bitAbbr: { contains: term, mode: "insensitive" } },
      {
        product: {
          is: {
            ...productFilter(category, series),
            code: { contains: term, mode: "insensitive" },
          },
        },
      }
    );
  }

  return {
    AND: [{ product }, { OR: or }],
  };
}

async function fetchVariants(
  category: string,
  q: string,
  limit: number,
  series?: string
): Promise<CatalogVariantDto[]> {
  const rows = await prisma.catalogVariant.findMany({
    where: catalogSearchWhere(category, q.trim(), series),
    include: variantInclude,
    orderBy: [{ product: { code: "asc" } }, { sortOrder: "asc" }],
    take: limit,
  });
  return rows.map(mapVariant);
}

/** 全域搜尋品項（不分系列；可從零件庫補命中） */
export async function searchCatalogVariantsUnified(
  category: string,
  q: string,
  limit = 30
): Promise<CatalogVariantDto[]> {
  const trimmed = q.trim();
  if (!trimmed) return [];

  const key = catalogCacheKey("search-unified", category, trimmed, "all");
  const cached = await getCached<CatalogVariantDto[]>(key);
  if (cached) return cached;

  const primary = await fetchVariants(category, trimmed, limit, undefined);
  const seen = new Set(primary.map((v) => v.id));
  const merged = [...primary];

  if (merged.length < limit && category === "bey") {
    const { searchCatalogParts } = await import("@/lib/catalog/search-parts");
    const parts = await searchCatalogParts(trimmed, { limit: 12 });
    const bladeAbbrs = [
      ...new Set(parts.filter((p) => p.part_type === "blade").map((p) => p.abbr)),
    ];
    if (bladeAbbrs.length) {
      const extra = await prisma.catalogVariant.findMany({
        where: {
          product: { categoryId: category },
          OR: bladeAbbrs.flatMap((abbr) => [
            { bladeAbbr: { equals: abbr, mode: "insensitive" } },
            { buildString: { contains: abbr, mode: "insensitive" } },
          ]),
        },
        include: variantInclude,
        take: limit - merged.length,
        orderBy: [{ product: { code: "asc" } }, { sortOrder: "asc" }],
      });
      for (const row of extra) {
        const dto = mapVariant(row);
        if (!seen.has(dto.id)) {
          seen.add(dto.id);
          merged.push(dto);
        }
      }
    }
  }

  await setCached(key, merged, 300);
  return merged.slice(0, limit);
}

export async function searchCatalogVariants(
  category: string,
  q: string,
  limit = 20,
  series?: string
): Promise<CatalogVariantDto[]> {
  const trimmed = q.trim();
  if (trimmed && !series) {
    return searchCatalogVariantsUnified(category, trimmed, limit);
  }

  const key = catalogCacheKey("search", category, trimmed, series ?? "all");
  const cached = await getCached<CatalogVariantDto[]>(key);
  if (cached) return cached;

  const result = await fetchVariants(category, trimmed, limit, series);
  await setCached(key, result, trimmed ? 300 : 900);
  return result;
}

export async function getCatalogStats(category: string, series?: string | null) {
  const productWhere = productFilter(category, series && series !== "all" ? series : undefined);
  const [productCount, variantCount] = await Promise.all([
    prisma.catalogProduct.count({ where: productWhere }),
    prisma.catalogVariant.count({ where: { product: productWhere } }),
  ]);
  const meta = await prisma.catalogMeta.findUnique({ where: { key: "last_synced" } });
  return { productCount, variantCount, lastSynced: meta?.value ?? null };
}

export async function listProductCodes(
  category: string,
  series?: string
): Promise<string[]> {
  const rows = await prisma.catalogProduct.findMany({
    where: productFilter(category, series),
    select: { code: true },
    orderBy: { code: "asc" },
  });
  return rows.map((r) => r.code).sort(compareProductCode);
}

export async function getSeriesCounts(category: string) {
  const rows = await prisma.catalogProduct.groupBy({
    by: ["series"],
    where: { categoryId: category },
    _count: { code: true },
  });
  return rows.map((r) => ({
    series: r.series as ProductSeriesId,
    label: seriesLabel(r.series as ProductSeriesId),
    count: r._count.code,
  }));
}

export async function getCatalogGroups(
  category: string,
  q: string,
  maxGroups = 500,
  series?: string
): Promise<CatalogGroupDto[]> {
  const key = catalogCacheKey("groups", category, q, series ?? "all");
  const cached = await getCached<CatalogGroupDto[]>(key);
  if (cached) return cached;

  const rows = await prisma.catalogVariant.findMany({
    where: catalogSearchWhere(category, q, series),
    include: variantInclude,
    orderBy: [{ product: { code: "asc" } }, { sortOrder: "asc" }, { buildString: "asc" }],
    take: q ? 800 : 2000,
  });

  const byCode = new Map<string, CatalogGroupDto>();

  for (const row of rows) {
    const code = row.product.code;
    let group = byCode.get(code);
    if (!group) {
      group = {
        code,
        category_id: row.product.categoryId,
        series: row.product.series,
        series_label: seriesLabel(row.product.series as ProductSeriesId),
        variant_count: 0,
        variants: [],
      };
      byCode.set(code, group);
    }
    group.variants.push(mapVariant(row));
    group.variant_count = group.variants.length;
  }

  const groups = [...byCode.values()]
    .sort((a, b) => compareProductCode(a.code, b.code))
    .slice(0, maxGroups);
  await setCached(key, groups, q ? 180 : 600);
  return groups;
}
