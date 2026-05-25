import { packageLabelZh } from "@/lib/catalog/package-labels";
import { bitDisplayAbbr, coatZh, ratchetNameZh } from "@/lib/catalog/part-names-zh";

/** 與 sync-catalog variantLabel 一致；讀取時重算以套用最新顯示規則（如核輪 4-60） */
export function buildVariantDisplayLabel(parts: {
  code: string;
  packageType: string;
  packageLabelZh?: string | null;
  bladeNameZh?: string | null;
  ratchetAbbr?: string | null;
  ratchetNameZh?: string | null;
  bitAbbr?: string | null;
  bitNameZh?: string | null;
  coat?: string | null;
  meta?: Record<string, unknown>;
}): string {
  const pkgZh = parts.packageLabelZh ?? packageLabelZh(parts.packageType);
  const ratchet =
    (parts.ratchetAbbr && ratchetNameZh(parts.ratchetAbbr)) ??
    parts.ratchetNameZh ??
    null;
  const coat = coatZh(parts.coat ?? (parts.meta?.coat as string | undefined));
  const segments = [
    parts.code,
    pkgZh,
    parts.bladeNameZh,
    ratchet,
    bitDisplayAbbr(parts.bitAbbr) ?? parts.bitNameZh,
    coat,
  ].filter((s): s is string => !!s);
  return segments.join(" · ");
}
