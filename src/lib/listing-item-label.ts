import type { ListingItem } from "@/types/database";

function formatPartSource(item: ListingItem): string | null {
  const code = item.source_product_code?.trim();
  const spec = item.source_part_spec?.trim();
  if (!code && !spec) return null;
  if (code && spec) return `來自 ${code} · ${spec}`;
  if (code) return `來自 ${code}`;
  return `規格 ${spec}`;
}

export function listingItemDisplayLabel(item: ListingItem): string | null {
  const base =
    item.catalog_variants?.display_label ??
    item.catalog_parts?.display_label ??
    item.seek_text ??
    null;
  if (!base) return null;
  const src = formatPartSource(item);
  return src ? `${base}（${src}）` : base;
}
