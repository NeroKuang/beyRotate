import { hotScore } from "@/lib/utils";

export type SortMode = "hot" | "newest" | "price";

export interface SortableListing {
  view_count: number;
  published_at: string | null;
  price: number | null;
  type: string;
}

export function sortListings<T extends SortableListing>(
  items: T[],
  mode: SortMode
): T[] {
  const copy = [...items];
  if (mode === "newest") {
    return copy.sort(
      (a, b) =>
        new Date(b.published_at ?? 0).getTime() -
        new Date(a.published_at ?? 0).getTime()
    );
  }
  if (mode === "price") {
    return copy.sort((a, b) => {
      const pa = a.type === "sell" ? (a.price ?? 999999999) : 999999999;
      const pb = b.type === "sell" ? (b.price ?? 999999999) : 999999999;
      return pa - pb;
    });
  }
  return copy.sort(
    (a, b) =>
      hotScore(b.view_count, b.published_at) -
      hotScore(a.view_count, a.published_at)
  );
}
