export type CatalogVariantDto = {
  id: string;
  display_label: string;
  package_type: string;
  package_label_zh: string | null;
  build_string: string;
  blade_abbr: string | null;
  ratchet_abbr: string | null;
  bit_abbr: string | null;
  blade_name_zh: string | null;
  ratchet_name_zh: string | null;
  bit_name_zh: string | null;
  coat: string | null;
  region_tag: string | null;
  code: string;
  category_id: string;
  image_url: string | null;
};

export type CatalogGroupDto = {
  code: string;
  category_id: string;
  series: string;
  series_label: string;
  variant_count: number;
  variants: CatalogVariantDto[];
};

import { buildVariantDisplayLabel } from "@/lib/catalog/display-label";
import { bitDisplayAbbr } from "@/lib/catalog/part-names-zh";
import { goShootVariantImageUrl } from "@/lib/go-shoot-images";

export function mapVariant(
  v: {
    id: string;
    displayLabel: string;
    packageType: string;
    packageLabelZh: string | null;
    buildString: string;
    bladeAbbr: string | null;
    ratchetAbbr: string | null;
    bitAbbr: string | null;
    bladeNameZh: string | null;
    ratchetNameZh: string | null;
    bitNameZh: string | null;
    coat: string | null;
    regionTag: string | null;
    youtubeId?: string | null;
    meta?: unknown;
    product: { code: string; categoryId: string; series: string };
  }
): CatalogVariantDto {
  const display_label = buildVariantDisplayLabel({
    code: v.product.code,
    packageType: v.packageType,
    packageLabelZh: v.packageLabelZh,
    bladeNameZh: v.bladeNameZh,
    ratchetAbbr: v.ratchetAbbr,
    ratchetNameZh: v.ratchetNameZh,
    bitAbbr: v.bitAbbr,
    bitNameZh: v.bitNameZh,
    coat: v.coat,
    meta: {},
  });
  const bitLabel = bitDisplayAbbr(v.bitAbbr) ?? v.bitNameZh;
  return {
    id: v.id,
    display_label,
    package_type: v.packageType,
    package_label_zh: v.packageLabelZh,
    build_string: v.buildString,
    blade_abbr: v.bladeAbbr,
    ratchet_abbr: v.ratchetAbbr,
    bit_abbr: v.bitAbbr,
    blade_name_zh: v.bladeNameZh,
    ratchet_name_zh: v.ratchetNameZh,
    bit_name_zh: bitLabel,
    coat: v.coat,
    region_tag: v.regionTag,
    code: v.product.code,
    category_id: v.product.categoryId,
    image_url: goShootVariantImageUrl({
      productCode: v.product.code,
      youtubeId: v.youtubeId,
      bladeAbbr: v.bladeAbbr,
      ratchetAbbr: v.ratchetAbbr,
      bitAbbr: v.bitAbbr,
      meta: v.meta,
    }),
  };
}
