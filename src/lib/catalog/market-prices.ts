import { prisma } from "@/lib/prisma";

export type MarketPriceStats = {
  sell_avg: number | null;
  sell_count: number;
  sell_min: number | null;
  sell_max: number | null;
  want_avg: number | null;
  want_count: number;
  want_min: number | null;
  want_max: number | null;
};

export const EMPTY_MARKET_STATS: MarketPriceStats = {
  sell_avg: null,
  sell_count: 0,
  sell_min: null,
  sell_max: null,
  want_avg: null,
  want_count: 0,
  want_min: null,
  want_max: null,
};

type Bucket = { sell: number[]; want: number[] };

function roundAvg(values: number[]): number | null {
  if (values.length === 0) return null;
  const sum = values.reduce((a, b) => a + b, 0);
  return Math.round(sum / values.length);
}

function toStats(bucket: Bucket): MarketPriceStats {
  return {
    sell_avg: roundAvg(bucket.sell),
    sell_count: bucket.sell.length,
    sell_min: bucket.sell.length ? Math.min(...bucket.sell) : null,
    sell_max: bucket.sell.length ? Math.max(...bucket.sell) : null,
    want_avg: roundAvg(bucket.want),
    want_count: bucket.want.length,
    want_min: bucket.want.length ? Math.min(...bucket.want) : null,
    want_max: bucket.want.length ? Math.max(...bucket.want) : null,
  };
}

function effectiveUnitPrice(
  listingType: string,
  listingPrice: number | null,
  listingBudget: number | null,
  itemPrice: number | null,
  itemBudget: number | null,
  offerCount: number,
): number | null {
  if (listingType === "sell") {
    if (itemPrice != null && itemPrice > 0) return itemPrice;
    if (offerCount === 1 && listingPrice != null && listingPrice > 0) {
      return listingPrice;
    }
    return null;
  }
  if (listingType === "want") {
    if (itemBudget != null && itemBudget > 0) return itemBudget;
    if (offerCount === 1 && listingBudget != null && listingBudget > 0) {
      return listingBudget;
    }
    return null;
  }
  return null;
}

async function loadPriceBuckets() {
  const items = await prisma.listingItem.findMany({
    where: {
      role: "offer",
      listing: {
        status: { in: ["active", "reserved"] },
        type: { in: ["sell", "want"] },
      },
      OR: [{ catalogVariantId: { not: null } }, { catalogPartId: { not: null } }],
    },
    select: {
      catalogVariantId: true,
      catalogPartId: true,
      price: true,
      budget: true,
      listing: {
        select: {
          type: true,
          price: true,
          budget: true,
          items: {
            where: { role: "offer" },
            select: { id: true },
          },
        },
      },
    },
  });

  const variants = new Map<string, Bucket>();
  const parts = new Map<string, Bucket>();

  const getBucket = (map: Map<string, Bucket>, key: string) => {
    let b = map.get(key);
    if (!b) {
      b = { sell: [], want: [] };
      map.set(key, b);
    }
    return b;
  };

  for (const item of items) {
    const offerCount = item.listing.items.length;
    const unit = effectiveUnitPrice(
      item.listing.type,
      item.listing.price,
      item.listing.budget,
      item.price,
      item.budget,
      offerCount,
    );
    if (unit == null) continue;

    if (item.catalogVariantId) {
      const bucket = getBucket(variants, item.catalogVariantId);
      if (item.listing.type === "sell") bucket.sell.push(unit);
      else bucket.want.push(unit);
    }
    if (item.catalogPartId) {
      const bucket = getBucket(parts, item.catalogPartId);
      if (item.listing.type === "sell") bucket.sell.push(unit);
      else bucket.want.push(unit);
    }
  }

  return { variants, parts };
}

let cache: {
  at: number;
  variants: Map<string, MarketPriceStats>;
  parts: Map<string, MarketPriceStats>;
} | null = null;

const CACHE_MS = 5 * 60 * 1000;

async function getCachedMaps() {
  const now = Date.now();
  if (cache && now - cache.at < CACHE_MS) {
    return { variants: cache.variants, parts: cache.parts };
  }
  const { variants: vBuckets, parts: pBuckets } = await loadPriceBuckets();
  const variants = new Map<string, MarketPriceStats>();
  const parts = new Map<string, MarketPriceStats>();
  for (const [id, b] of vBuckets) variants.set(id, toStats(b));
  for (const [id, b] of pBuckets) parts.set(id, toStats(b));
  cache = { at: now, variants, parts };
  return { variants, parts };
}

export function invalidateMarketPriceCache() {
  cache = null;
}

export async function getMarketPriceForVariant(
  variantId: string,
): Promise<MarketPriceStats> {
  const { variants } = await getCachedMaps();
  return variants.get(variantId) ?? { ...EMPTY_MARKET_STATS };
}

export async function getMarketPriceForPart(
  partId: string,
): Promise<MarketPriceStats> {
  const { parts } = await getCachedMaps();
  return parts.get(partId) ?? { ...EMPTY_MARKET_STATS };
}

export async function getMarketPricesForVariants(
  variantIds: string[],
): Promise<Record<string, MarketPriceStats>> {
  const { variants } = await getCachedMaps();
  const out: Record<string, MarketPriceStats> = {};
  for (const id of variantIds) {
    out[id] = variants.get(id) ?? { ...EMPTY_MARKET_STATS };
  }
  return out;
}

export async function getMarketPricesForParts(
  partIds: string[],
): Promise<Record<string, MarketPriceStats>> {
  const { parts } = await getCachedMaps();
  const out: Record<string, MarketPriceStats> = {};
  for (const id of partIds) {
    out[id] = parts.get(id) ?? { ...EMPTY_MARKET_STATS };
  }
  return out;
}
