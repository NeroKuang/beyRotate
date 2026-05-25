import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/go-shoot-images", () => ({
  goShootProductImageUrl: vi.fn(),
  goShootVariantImageUrl: vi.fn(),
  goShootPartImageUrl: vi.fn(),
}));

vi.mock("@/lib/storage", () => ({
  publicStorageUrl: vi.fn((p: string) => `/storage/${p}`),
}));

import {
  listingImageSrc,
  resolveItemImageUrl,
  resolveListingCoverUrl,
  resolveListingGalleryUrls,
} from "../listing-images";

import {
  goShootProductImageUrl,
  goShootVariantImageUrl,
  goShootPartImageUrl,
} from "@/lib/go-shoot-images";

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

beforeEach(() => {
  vi.mocked(goShootProductImageUrl).mockReturnValue(null);
  vi.mocked(goShootVariantImageUrl).mockReturnValue(null);
  vi.mocked(goShootPartImageUrl).mockReturnValue(null);
});

describe("listingImageSrc", () => {
  it("passes through http URLs", () => {
    expect(listingImageSrc("https://example.com/a.jpg")).toBe(
      "https://example.com/a.jpg"
    );
  });

  it("passes through HTTP (case-insensitive)", () => {
    expect(listingImageSrc("HTTP://example.com/a.jpg")).toBe(
      "HTTP://example.com/a.jpg"
    );
  });

  it("resolves storage paths via publicStorageUrl", () => {
    expect(listingImageSrc("abc/def.jpg")).toBe("/storage/abc/def.jpg");
  });
});

describe("resolveItemImageUrl", () => {
  it("returns product image when source_product_code is present", () => {
    vi.mocked(goShootProductImageUrl).mockReturnValue("https://product.png");
    const item = {
      role: "offer" as const,
      item_kind: "variant" as const,
      source_product_code: "BX-01",
    };
    expect(resolveItemImageUrl(item)).toBe("https://product.png");
  });

  it("returns part image for part items", () => {
    vi.mocked(goShootPartImageUrl).mockReturnValue("https://part.png");
    const item = {
      role: "offer" as const,
      item_kind: "part" as const,
      source_product_code: null as string | null | undefined,
      catalog_parts: {
        part_type: "blade",
        abbr: "Wizard",
        line: "BX",
        part_group: "main",
      },
    };
    expect(resolveItemImageUrl(item)).toBe("https://part.png");
  });

  it("returns variant image when catalog_variants exist", () => {
    vi.mocked(goShootVariantImageUrl).mockReturnValue("https://variant.png");
    const item = {
      role: "offer" as const,
      item_kind: "variant" as const,
      source_product_code: null as string | null | undefined,
      catalog_variants: {
        youtube_id: "abc",
        blade_abbr: "Wiz",
        ratchet_abbr: "4-60",
        bit_abbr: "FB",
        meta: null,
        catalog_products: { code: "BX-01" },
      },
    };
    expect(resolveItemImageUrl(item)).toBe("https://variant.png");
  });

  it("returns null when no image source available", () => {
    const item = {
      role: "offer" as const,
      item_kind: undefined,
      source_product_code: null as string | null | undefined,
    };
    expect(resolveItemImageUrl(item)).toBeNull();
  });
});

describe("resolveListingCoverUrl", () => {
  it("uses first uploaded image sorted by sort_order", () => {
    const listing = baseListing({
      listing_images: [
        { id: "i2", listing_id: "l1", storage_path: "b.jpg", sort_order: 2 },
        { id: "i1", listing_id: "l1", storage_path: "a.jpg", sort_order: 1 },
      ],
    });
    expect(resolveListingCoverUrl(listing)).toBe("/storage/a.jpg");
  });

  it("falls back to first offer item image", () => {
    vi.mocked(goShootProductImageUrl).mockReturnValue("https://product.png");
    const listing = baseListing({
      listing_items: [
        {
          id: "it1",
          listing_id: "l1",
          catalog_variant_id: null,
          role: "offer",
          seek_text: null,
          source_product_code: "BX-01",
        },
      ],
    });
    expect(resolveListingCoverUrl(listing)).toBe("https://product.png");
  });

  it("returns null for empty listing", () => {
    const listing = baseListing();
    expect(resolveListingCoverUrl(listing)).toBeNull();
  });
});

describe("resolveListingGalleryUrls", () => {
  it("returns uploaded images sorted by sort_order", () => {
    const listing = baseListing({
      listing_images: [
        { id: "i2", listing_id: "l1", storage_path: "b.jpg", sort_order: 2 },
        { id: "i1", listing_id: "l1", storage_path: "a.jpg", sort_order: 1 },
      ],
    });
    expect(resolveListingGalleryUrls(listing)).toEqual([
      "/storage/a.jpg",
      "/storage/b.jpg",
    ]);
  });

  it("deduplicates offer item images", () => {
    vi.mocked(goShootProductImageUrl).mockReturnValue("https://same.png");
    const listing = baseListing({
      listing_items: [
        {
          id: "it1",
          listing_id: "l1",
          catalog_variant_id: null,
          role: "offer",
          seek_text: null,
          source_product_code: "BX-01",
        },
        {
          id: "it2",
          listing_id: "l1",
          catalog_variant_id: null,
          role: "offer",
          seek_text: null,
          source_product_code: "BX-01",
        },
      ],
    });
    expect(resolveListingGalleryUrls(listing)).toEqual(["https://same.png"]);
  });

  it("ignores seek items", () => {
    vi.mocked(goShootProductImageUrl).mockReturnValue("https://product.png");
    const listing = baseListing({
      listing_items: [
        {
          id: "it1",
          listing_id: "l1",
          catalog_variant_id: null,
          role: "seek",
          seek_text: null,
          source_product_code: "BX-01",
        },
      ],
    });
    expect(resolveListingGalleryUrls(listing)).toEqual([]);
  });
});
