import { LISTING_PUBLISH_TTL_DAYS } from "@/lib/constants";

export function listingExpiresAt(publishedAt: Date | string | null): Date | null {
  if (!publishedAt) return null;
  const base = typeof publishedAt === "string" ? new Date(publishedAt) : publishedAt;
  if (Number.isNaN(base.getTime())) return null;
  const exp = new Date(base);
  exp.setDate(exp.getDate() + LISTING_PUBLISH_TTL_DAYS);
  return exp;
}

export function listingExpiryLabel(publishedAt: Date | string | null): string | null {
  const exp = listingExpiresAt(publishedAt);
  if (!exp) return null;
  return exp.toLocaleString("zh-TW", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function isPublishedListingExpired(
  publishedAt: Date | null,
  status: string,
): boolean {
  if (!publishedAt) return false;
  if (status !== "active" && status !== "reserved") return false;
  const exp = listingExpiresAt(publishedAt);
  return exp != null && exp.getTime() <= Date.now();
}
