import { prisma } from "@/lib/prisma";
import { catalogCacheKey, getCached, setCached } from "@/lib/catalog/cache";
import { seriesScopesForSlot, type PartSlot } from "@/lib/catalog/part-groups";
import {
  expandRatchetSearchTerms,
  parseRatchetQuery,
} from "@/lib/catalog/ratchet-search";
import type { Prisma } from "@prisma/client";

export type CatalogPartDto = {
  id: string;
  part_type: string;
  abbr: string;
  name_zh: string;
  display_label: string;
  line: string;
  part_group: string;
  series_scope: string;
};

export function mapPart(p: {
  id: string;
  partType: string;
  abbr: string;
  nameZh: string;
  displayLabel: string;
  line: string;
  partGroup: string;
  seriesScope: string;
}): CatalogPartDto {
  return {
    id: p.id,
    part_type: p.partType,
    abbr: p.abbr,
    name_zh: p.nameZh,
    display_label: p.displayLabel,
    line: p.line,
    part_group: p.partGroup,
    series_scope: p.seriesScope,
  };
}

export type SearchPartsOpts = {
  slot?: PartSlot;
  partType?: string;
  partGroup?: string;
  limit?: number;
};

function buildSearchOr(trimmed: string): Prisma.CatalogPartWhereInput[] {
  const or: Prisma.CatalogPartWhereInput[] = [
    { abbr: { contains: trimmed, mode: "insensitive" } },
    { nameZh: { contains: trimmed, mode: "insensitive" } },
    { displayLabel: { contains: trimmed, mode: "insensitive" } },
    { searchText: { contains: trimmed, mode: "insensitive" } },
  ];

  const ratchetTerms = expandRatchetSearchTerms(trimmed);
  for (const term of ratchetTerms) {
    if (term === trimmed) continue;
    or.push(
      { abbr: { equals: term, mode: "insensitive" } },
      { searchText: { contains: term, mode: "insensitive" } }
    );
  }

  const parsed = parseRatchetQuery(trimmed);
  if (parsed?.kind === "code") {
    or.push({ partType: "ratchet", abbr: parsed.code });
  } else if (parsed?.kind === "prefix") {
    or.push({
      partType: "ratchet",
      abbr: { startsWith: parsed.prefix, mode: "insensitive" },
    });
  }

  return or;
}

export async function searchCatalogParts(
  q: string,
  opts: SearchPartsOpts = {}
): Promise<CatalogPartDto[]> {
  const { slot, partType, partGroup, limit = 25 } = opts;
  const slotKey = slot
    ? `${slot.part_type}:${slot.part_group}:${slot.label}`
    : "all";
  const cacheKey = catalogCacheKey(
    "parts",
    [slotKey, partType ?? "all", partGroup ?? "all"].join(":"),
    q
  );
  const trimmed = q.trim();

  if (trimmed) {
    const cached = await getCached<CatalogPartDto[]>(cacheKey);
    if (cached) return cached;
  }

  const scopes = slot ? seriesScopesForSlot(slot) : undefined;
  const baseWhere: Prisma.CatalogPartWhereInput = {
    ...(scopes ? { seriesScope: { in: scopes } } : {}),
    ...(partType ? { partType } : {}),
    ...(partGroup !== undefined ? { partGroup } : {}),
  };

  const rows = await prisma.catalogPart.findMany({
    where: trimmed
      ? { ...baseWhere, OR: buildSearchOr(trimmed) }
      : baseWhere,
    take: limit,
    orderBy: [
      { partType: "asc" },
      { partGroup: "asc" },
      { displayLabel: "asc" },
    ],
  });

  const result = rows.map(mapPart);
  if (trimmed && result.length > 0) {
    await setCached(cacheKey, result, 300);
  }
  return result;
}
