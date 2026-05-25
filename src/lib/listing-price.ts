import { formatPrice } from "@/lib/utils";
import type { ListingWithRelations } from "@/types/database";

export function offerItemAmounts(listing: ListingWithRelations): number[] {
  const offers =
    listing.listing_items?.filter((i) => i.role === "offer") ?? [];
  if (listing.type === "sell") {
    return offers
      .map((i) => i.price)
      .filter((p): p is number => p != null && p > 0);
  }
  if (listing.type === "want") {
    return offers
      .map((i) => i.budget)
      .filter((b): b is number => b != null && b > 0);
  }
  return [];
}

export function listingPriceLabel(listing: ListingWithRelations): string {
  if (listing.type === "sell") {
    const amounts = offerItemAmounts(listing);
    if (amounts.length > 0) {
      const min = Math.min(...amounts);
      const max = Math.max(...amounts);
      if (min === max) return formatPrice(min);
      return `${formatPrice(min)} 起`;
    }
    return formatPrice(listing.price);
  }
  if (listing.type === "want") {
    const amounts = offerItemAmounts(listing);
    if (amounts.length > 0) {
      const max = Math.max(...amounts);
      return `各項預算 ${formatPrice(max)} 內`;
    }
    return `預算 ${formatPrice(listing.budget)}`;
  }
  return listing.cash_diff
    ? `補差 ${formatPrice(listing.cash_diff)}`
    : "交換";
}

export function listingItemAmountLabel(
  listing: ListingWithRelations,
  item: NonNullable<ListingWithRelations["listing_items"]>[number]
): string | null {
  if (listing.type === "sell" && item.price != null) {
    return formatPrice(item.price);
  }
  if (listing.type === "want" && item.budget != null) {
    return `預算 ${formatPrice(item.budget)}`;
  }
  return null;
}
