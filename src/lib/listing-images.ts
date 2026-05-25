import {
  goShootPartImageUrl,
  goShootProductImageUrl,
  goShootVariantImageUrl,
} from "@/lib/go-shoot-images";
import { publicStorageUrl } from "@/lib/storage";
import type { ListingImage, ListingItem, ListingWithRelations } from "@/types/database";

export function listingImageSrc(storagePath: string): string {
  if (/^https?:\/\//i.test(storagePath)) return storagePath;
  return publicStorageUrl(storagePath);
}

type ItemForImage = Pick<
  ListingItem,
  "role" | "item_kind" | "source_product_code"
> & {
  catalog_variants?: {
    youtube_id?: string | null;
    blade_abbr?: string | null;
    ratchet_abbr?: string | null;
    bit_abbr?: string | null;
    meta?: unknown;
    catalog_products?: { code: string };
  };
  catalog_parts?: {
    part_type: string;
    abbr: string;
    line?: string;
    part_group?: string;
  };
};

export function resolveItemImageUrl(item: ItemForImage): string | null {
  if (item.source_product_code) {
    const fromProduct = goShootProductImageUrl(item.source_product_code);
    if (fromProduct) return fromProduct;
  }

  if (item.item_kind === "part" && item.catalog_parts) {
    return goShootPartImageUrl({
      partType: item.catalog_parts.part_type,
      abbr: item.catalog_parts.abbr,
      line: item.catalog_parts.line,
      partGroup: item.catalog_parts.part_group,
    });
  }

  if (item.catalog_variants) {
    return goShootVariantImageUrl({
      youtubeId: item.catalog_variants.youtube_id,
      bladeAbbr: item.catalog_variants.blade_abbr,
      ratchetAbbr: item.catalog_variants.ratchet_abbr,
      bitAbbr: item.catalog_variants.bit_abbr,
      meta: item.catalog_variants.meta,
      productCode: item.catalog_variants.catalog_products?.code,
    });
  }

  return null;
}

export function resolveListingCoverUrl(listing: ListingWithRelations): string | null {
  const uploaded = [...(listing.listing_images ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order
  )[0];
  if (uploaded) return listingImageSrc(uploaded.storage_path);

  const offerItems =
    listing.listing_items?.filter((i) => i.role === "offer") ?? [];
  for (const item of offerItems) {
    const url = resolveItemImageUrl(item);
    if (url) return url;
  }
  return null;
}

export function resolveListingGalleryUrls(listing: ListingWithRelations): string[] {
  if ((listing.listing_images ?? []).length > 0) {
    return (listing.listing_images ?? [])
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((img) => listingImageSrc(img.storage_path));
  }

  const seen = new Set<string>();
  const urls: string[] = [];
  for (const item of listing.listing_items?.filter((i) => i.role === "offer") ??
    []) {
    const url = resolveItemImageUrl(item);
    if (url && !seen.has(url)) {
      seen.add(url);
      urls.push(url);
    }
  }
  return urls;
}

/** 供 server action 使用：從 Prisma 查詢結果解析預設圖 URL */
export function resolveItemImageUrlFromDb(item: {
  itemKind: string;
  sourceProductCode?: string | null;
  variant?: {
    youtubeId?: string | null;
    bladeAbbr?: string | null;
    ratchetAbbr?: string | null;
    bitAbbr?: string | null;
    meta?: unknown;
    product?: { code: string };
  } | null;
  part?: {
    partType: string;
    abbr: string;
    line: string;
    partGroup: string;
  } | null;
}): string | null {
  if (item.itemKind === "part" && item.part) {
    if (item.sourceProductCode) {
      const fromProduct = goShootProductImageUrl(item.sourceProductCode);
      if (fromProduct) return fromProduct;
    }
    return goShootPartImageUrl({
      partType: item.part.partType,
      abbr: item.part.abbr,
      line: item.part.line,
      partGroup: item.part.partGroup,
    });
  }

  if (item.variant) {
    return goShootVariantImageUrl({
      youtubeId: item.variant.youtubeId,
      bladeAbbr: item.variant.bladeAbbr,
      ratchetAbbr: item.variant.ratchetAbbr,
      bitAbbr: item.variant.bitAbbr,
      meta: item.variant.meta,
      productCode: item.variant.product?.code ?? item.sourceProductCode,
    });
  }

  return null;
}
