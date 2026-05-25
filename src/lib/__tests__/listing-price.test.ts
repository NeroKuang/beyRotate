import { describe, it, expect } from "vitest";
import {
  offerItemAmounts,
  listingPriceLabel,
  listingItemAmountLabel,
} from "../listing-price";
import type { ListingWithRelations } from "@/types/database";

function baseListing(
  overrides: Partial<ListingWithRelations> = {}
): ListingWithRelations {
  return {
    id: "l1",
    user_id: "u1",
    type: "sell",
    status: "active",
    custom_title: null,
    price: null,
    budget: null,
    cash_diff: null,
    negotiable: false,
    currency: "TWD",
    condition: null,
    quantity: 1,
    region: null,
    delivery_tags: [],
    note: null,
    contact_pref: "in_app",
    accept_inquiries_while_reserved: true,
    view_count: 0,
    published_at: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    listing_items: [],
    listing_images: [],
    ...overrides,
  };
}

function makeItem(
  role: "offer" | "seek",
  overrides: { price?: number | null; budget?: number | null } = {}
) {
  return {
    id: "it1",
    listing_id: "l1",
    catalog_variant_id: null,
    role,
    seek_text: null,
    ...overrides,
  };
}

describe("offerItemAmounts", () => {
  it("returns prices for sell listings", () => {
    const listing = baseListing({
      type: "sell",
      listing_items: [
        makeItem("offer", { price: 500 }),
        makeItem("offer", { price: 800 }),
      ],
    });
    expect(offerItemAmounts(listing)).toEqual([500, 800]);
  });

  it("returns budgets for want listings", () => {
    const listing = baseListing({
      type: "want",
      listing_items: [
        makeItem("offer", { budget: 300 }),
        makeItem("offer", { budget: 600 }),
      ],
    });
    expect(offerItemAmounts(listing)).toEqual([300, 600]);
  });

  it("filters out null and zero values", () => {
    const listing = baseListing({
      type: "sell",
      listing_items: [
        makeItem("offer", { price: 0 }),
        makeItem("offer", { price: null }),
        makeItem("offer", { price: 500 }),
      ],
    });
    expect(offerItemAmounts(listing)).toEqual([500]);
  });

  it("returns empty for trade listings", () => {
    const listing = baseListing({ type: "trade" });
    expect(offerItemAmounts(listing)).toEqual([]);
  });

  it("ignores seek items", () => {
    const listing = baseListing({
      type: "sell",
      listing_items: [makeItem("seek", { price: 999 })],
    });
    expect(offerItemAmounts(listing)).toEqual([]);
  });
});

describe("listingPriceLabel", () => {
  it("shows single price for sell listing with one item", () => {
    const listing = baseListing({
      type: "sell",
      listing_items: [makeItem("offer", { price: 1000 })],
    });
    expect(listingPriceLabel(listing)).toBe("NT$ 1,000");
  });

  it("shows price range for sell listing with multiple items", () => {
    const listing = baseListing({
      type: "sell",
      listing_items: [
        makeItem("offer", { price: 500 }),
        makeItem("offer", { price: 1200 }),
      ],
    });
    expect(listingPriceLabel(listing)).toBe("NT$ 500 起");
  });

  it("falls back to listing.price when no item prices", () => {
    const listing = baseListing({ type: "sell", price: 2000 });
    expect(listingPriceLabel(listing)).toBe("NT$ 2,000");
  });

  it("shows budget for want listings", () => {
    const listing = baseListing({
      type: "want",
      listing_items: [makeItem("offer", { budget: 800 })],
    });
    expect(listingPriceLabel(listing)).toBe("各項預算 NT$ 800 內");
  });

  it("falls back to listing.budget when no item budgets", () => {
    const listing = baseListing({ type: "want", budget: 1500 });
    expect(listingPriceLabel(listing)).toBe("預算 NT$ 1,500");
  });

  it("shows cash diff for trade listings", () => {
    const listing = baseListing({ type: "trade", cash_diff: 300 });
    expect(listingPriceLabel(listing)).toBe("補差 NT$ 300");
  });

  it("shows 交換 for trade without cash diff", () => {
    const listing = baseListing({ type: "trade" });
    expect(listingPriceLabel(listing)).toBe("交換");
  });
});

describe("listingItemAmountLabel", () => {
  it("returns formatted price for sell listing items", () => {
    const listing = baseListing({ type: "sell" });
    const item = makeItem("offer", { price: 750 });
    expect(listingItemAmountLabel(listing, item)).toBe("NT$ 750");
  });

  it("returns budget label for want listing items", () => {
    const listing = baseListing({ type: "want" });
    const item = makeItem("offer", { budget: 500 });
    expect(listingItemAmountLabel(listing, item)).toBe("預算 NT$ 500");
  });

  it("returns null for trade listing items", () => {
    const listing = baseListing({ type: "trade" });
    const item = makeItem("offer");
    expect(listingItemAmountLabel(listing, item)).toBeNull();
  });

  it("returns null when price is undefined", () => {
    const listing = baseListing({ type: "sell" });
    const item = makeItem("offer");
    expect(listingItemAmountLabel(listing, item)).toBeNull();
  });
});
