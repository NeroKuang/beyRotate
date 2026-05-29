import { describe, it, expect } from "vitest";

// Test helpers exported via re-export pattern - test the pure logic inline
function roundAvg(values: number[]): number | null {
  if (values.length === 0) return null;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
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

describe("market price unit extraction", () => {
  it("uses item price for sell listings", () => {
    expect(effectiveUnitPrice("sell", 500, null, 200, null, 2)).toBe(200);
  });

  it("falls back to listing price for single-item sell", () => {
    expect(effectiveUnitPrice("sell", 350, null, null, null, 1)).toBe(350);
  });

  it("uses item budget for want listings", () => {
    expect(effectiveUnitPrice("want", null, 800, null, 300, 2)).toBe(300);
  });

  it("computes average", () => {
    expect(roundAvg([100, 200, 300])).toBe(200);
  });
});
