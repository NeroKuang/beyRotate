import { prisma } from "@/lib/prisma";
import { LISTING_PUBLISH_TTL_DAYS } from "@/lib/constants";
import { purgeListingImages } from "@/lib/cleanup-listing-images";
import { invalidateMarketPriceCache } from "@/lib/catalog/market-prices";

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

export type ExpireListingsResult = {
  closed: number;
  imagesRemoved: number;
};

/** Close published listings past TTL and purge their uploaded images. */
export async function expirePublishedListings(): Promise<ExpireListingsResult> {
  const cutoff = daysAgo(LISTING_PUBLISH_TTL_DAYS);

  const expired = await prisma.listing.findMany({
    where: {
      status: { in: ["active", "reserved"] },
      publishedAt: { not: null, lte: cutoff },
    },
    select: { id: true },
  });

  const ids = expired.map((l) => l.id);
  if (ids.length === 0) {
    return { closed: 0, imagesRemoved: 0 };
  }

  await prisma.listing.updateMany({
    where: { id: { in: ids } },
    data: { status: "closed" },
  });

  const imagesRemoved = await purgeListingImages(ids);
  invalidateMarketPriceCache();

  return { closed: ids.length, imagesRemoved };
}
