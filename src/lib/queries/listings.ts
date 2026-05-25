import { buildVariantDisplayLabel } from "@/lib/catalog/display-label";
import { bitDisplayAbbr } from "@/lib/catalog/part-names-zh";
import { prisma } from "@/lib/prisma";
import type { ListingWithRelations, Profile, ListingItem, ListingImage } from "@/types/database";

export const listingInclude = {
  user: true,
  items: {
    include: {
      variant: { include: { product: true } },
      part: true,
    },
  },
  images: { orderBy: { sortOrder: "asc" as const } },
};

function mapProfile(p: {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  region: string | null;
  lineId: string | null;
  discord: string | null;
  facebook: string | null;
  emailPublic: string | null;
  phone: string | null;
  isBanned: boolean;
  onboardingCompleted: boolean;
  createdAt: Date;
}): Profile {
  return {
    id: p.id,
    display_name: p.displayName,
    avatar_url: p.avatarUrl,
    bio: p.bio,
    region: p.region,
    line_id: p.lineId,
    discord: p.discord,
    facebook: p.facebook,
    email_public: p.emailPublic,
    phone: p.phone,
    is_banned: p.isBanned,
    onboarding_completed: p.onboardingCompleted,
    created_at: p.createdAt.toISOString(),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapListing(l: any): ListingWithRelations {
  const items: ListingItem[] = (l.items ?? []).map((i: any) => ({
    id: i.id,
    listing_id: i.listingId,
    item_kind: i.itemKind ?? (i.catalogPartId ? "part" : "variant"),
    catalog_variant_id: i.catalogVariantId,
    catalog_part_id: i.catalogPartId,
    source_product_code: i.sourceProductCode,
    source_part_spec: i.sourcePartSpec,
    quantity: i.quantity ?? 1,
    price: i.price,
    budget: i.budget,
    role: i.role,
    seek_text: i.seekText,
    catalog_variants: i.variant
      ? {
          display_label: buildVariantDisplayLabel({
            code: i.variant.product.code,
            packageType: i.variant.packageType,
            packageLabelZh: i.variant.packageLabelZh,
            bladeNameZh: i.variant.bladeNameZh,
            ratchetAbbr: i.variant.ratchetAbbr,
            ratchetNameZh: i.variant.ratchetNameZh,
            bitAbbr: i.variant.bitAbbr,
            bitNameZh: i.variant.bitNameZh,
            coat: i.variant.coat,
          }),
          build_string: i.variant.buildString,
          package_type: i.variant.packageType,
          package_label_zh: i.variant.packageLabelZh,
          blade_name_zh: i.variant.bladeNameZh,
          ratchet_name_zh: i.variant.ratchetNameZh,
          bit_name_zh: i.variant.bitNameZh,
          coat: i.variant.coat,
          code: i.variant.product.code,
          youtube_id: i.variant.youtubeId,
          blade_abbr: i.variant.bladeAbbr,
          ratchet_abbr: i.variant.ratchetAbbr,
          bit_abbr: i.variant.bitAbbr,
          meta: i.variant.meta,
          catalog_products: i.variant.product
            ? { code: i.variant.product.code, category_id: i.variant.product.categoryId }
            : undefined,
        }
      : undefined,
    catalog_parts: i.part
      ? {
          display_label: i.part.displayLabel,
          part_type: i.part.partType,
          name_zh: i.part.nameZh,
          abbr: i.part.abbr,
          line: i.part.line,
          part_group: i.part.partGroup,
        }
      : undefined,
  }));

  const images: ListingImage[] = (l.images ?? []).map((img: any) => ({
    id: img.id,
    listing_id: img.listingId,
    storage_path: img.storagePath,
    sort_order: img.sortOrder,
  }));

  return {
    id: l.id,
    user_id: l.userId,
    type: l.type,
    status: l.status,
    custom_title: l.customTitle,
    price: l.price,
    budget: l.budget,
    cash_diff: l.cashDiff,
    negotiable: l.negotiable,
    currency: l.currency,
    condition: l.condition,
    quantity: l.quantity,
    region: l.region,
    delivery_tags: l.deliveryTags ?? [],
    note: l.note,
    contact_pref: l.contactPref,
    accept_inquiries_while_reserved: l.acceptInquiriesWhileReserved,
    view_count: l.viewCount,
    published_at: l.publishedAt?.toISOString() ?? null,
    created_at: l.createdAt.toISOString(),
    updated_at: l.updatedAt.toISOString(),
    profiles: l.user ? mapProfile(l.user) : undefined,
    listing_items: items,
    listing_images: images,
  };
}

export async function fetchPublicListings(opts?: {
  type?: string;
  limit?: number;
}) {
  const rows = await prisma.listing.findMany({
    where: {
      status: { in: ["active", "reserved"] },
      ...(opts?.type ? { type: opts.type as "sell" | "want" | "trade" } : {}),
    },
    include: listingInclude,
    orderBy: { publishedAt: "desc" },
    take: opts?.limit ?? 200,
  });
  return rows.map(mapListing);
}
