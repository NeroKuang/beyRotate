"use client";

import Link from "next/link";
import { formatDate, cn } from "@/lib/utils";
import { resolveListingCoverUrl } from "@/lib/listing-images";
import { listingItemDisplayLabel } from "@/lib/listing-item-label";
import { listingPriceLabel } from "@/lib/listing-price";
import { regionLabel } from "@/lib/constants";
import { ProductImage } from "@/components/ui/product-image";
import type { ListingWithRelations } from "@/types/database";

const TYPE_LABEL: Record<string, string> = {
  sell: "出售",
  want: "徵求",
  trade: "交換",
};

export function ListingCard({ listing }: { listing: ListingWithRelations }) {
  const imageUrl = resolveListingCoverUrl(listing);

  const offerItems = listing.listing_items?.filter((i) => i.role === "offer") ?? [];
  const offerLabels = offerItems.map((i) => listingItemDisplayLabel(i)).filter(Boolean);
  const title =
    listing.custom_title ??
    (offerLabels.length > 1
      ? `${offerLabels[0]} 等 ${offerLabels.length} 項`
      : offerLabels[0]) ??
    "刊登";

  const totalQty = offerItems.reduce((sum, i) => sum + (i.quantity ?? 1), 0);
  const priceLabel = listingPriceLabel(listing);

  return (
    <Link
      href={`/listings/${listing.id}`}
      className={cn(
        "block overflow-hidden rounded-xl border border-sky-200/60 bg-white/95 transition-shadow hover:border-sky-300/80 hover:shadow-lg hover:shadow-sky-500/10 dark:border-indigo-900/50 dark:bg-slate-900/95 dark:hover:border-indigo-800",
        listing.status === "sold" || listing.status === "closed"
          ? "opacity-60"
          : ""
      )}
    >
      <div className="relative">
        <ProductImage
          src={imageUrl}
          alt={title}
          fit="cover"
          containerClassName="aspect-[4/3] bg-zinc-100 dark:bg-zinc-800"
        />
        {listing.status === "reserved" && (
          <span className="absolute top-2 left-2 bg-amber-500 text-white text-xs px-2 py-0.5 rounded">
            已預留
          </span>
        )}
      </div>
      <div className="p-3 space-y-1">
        <div className="flex justify-between gap-2 text-xs text-zinc-500">
          <span>
            {TYPE_LABEL[listing.type]}
            {totalQty > 0 && (
              <span className="ml-1 rounded bg-sky-100 px-1 py-0.5 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300">
                {totalQty} 件
              </span>
            )}
          </span>
          <span>{listing.view_count} 瀏覽</span>
        </div>
        <h3 className="font-medium line-clamp-2">{title}</h3>
        <p className="font-semibold text-emerald-700 dark:text-emerald-400">
          {priceLabel}
          {listing.negotiable && listing.type === "sell" && (
            <span className="text-xs font-normal text-zinc-500 ml-1">
              可議價
            </span>
          )}
        </p>
        <p className="text-xs text-zinc-500 truncate">
          {regionLabel(listing.region) ?? "—"} · {formatDate(listing.published_at ?? listing.created_at)}
        </p>
      </div>
    </Link>
  );
}
