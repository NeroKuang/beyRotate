import { describe, it, expect } from "vitest";
import { listingItemDisplayLabel } from "../listing-item-label";
import type { ListingItem } from "@/types/database";

function makeItem(overrides: Partial<ListingItem> = {}): ListingItem {
  return {
    id: "it1",
    listing_id: "l1",
    catalog_variant_id: null,
    role: "offer",
    seek_text: null,
    ...overrides,
  };
}

describe("listingItemDisplayLabel", () => {
  it("uses variant display_label when present", () => {
    const item = makeItem({
      catalog_variants: {
        display_label: "BX-01 入門組",
        build_string: "Wizard.4-60.FB",
      },
    });
    expect(listingItemDisplayLabel(item)).toBe("BX-01 入門組");
  });

  it("uses part display_label when no variant", () => {
    const item = makeItem({
      catalog_parts: {
        display_label: "Wizard Arrow",
        part_type: "blade",
        name_zh: "巫師矢",
        abbr: "Wiz",
      },
    });
    expect(listingItemDisplayLabel(item)).toBe("Wizard Arrow");
  });

  it("uses seek_text when no variant or part", () => {
    const item = makeItem({ seek_text: "任何 BX 系列" });
    expect(listingItemDisplayLabel(item)).toBe("任何 BX 系列");
  });

  it("appends source product code annotation", () => {
    const item = makeItem({
      catalog_parts: {
        display_label: "Wizard Arrow",
        part_type: "blade",
        name_zh: "巫師矢",
        abbr: "Wiz",
      },
      source_product_code: "BX-01",
    });
    expect(listingItemDisplayLabel(item)).toBe(
      "Wizard Arrow（來自 BX-01）"
    );
  });

  it("appends source part spec annotation", () => {
    const item = makeItem({
      catalog_parts: {
        display_label: "Wizard Arrow",
        part_type: "blade",
        name_zh: "巫師矢",
        abbr: "Wiz",
      },
      source_part_spec: "金屬塗裝",
    });
    expect(listingItemDisplayLabel(item)).toBe(
      "Wizard Arrow（規格 金屬塗裝）"
    );
  });

  it("appends both code and spec", () => {
    const item = makeItem({
      catalog_parts: {
        display_label: "Wizard Arrow",
        part_type: "blade",
        name_zh: "巫師矢",
        abbr: "Wiz",
      },
      source_product_code: "BX-01",
      source_part_spec: "金色",
    });
    expect(listingItemDisplayLabel(item)).toBe(
      "Wizard Arrow（來自 BX-01 · 金色）"
    );
  });

  it("returns null when nothing is available", () => {
    const item = makeItem();
    expect(listingItemDisplayLabel(item)).toBeNull();
  });

  it("ignores whitespace-only source fields", () => {
    const item = makeItem({
      seek_text: "想要",
      source_product_code: "  ",
      source_part_spec: "  ",
    });
    expect(listingItemDisplayLabel(item)).toBe("想要");
  });
});
