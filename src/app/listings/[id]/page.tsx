import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { recordListingView } from "@/app/actions/listings";
import { ListingContactButton } from "@/components/listings/listing-contact-button";
import { ListingStatusManager } from "@/components/listings/listing-status-manager";
import { TradeDisclaimer } from "@/components/listings/trade-disclaimer";
import { ContactSection } from "@/components/listings/contact-section";
import { ReportButton } from "@/components/reports/report-button";
import { ListingGallery } from "@/components/listings/listing-gallery";
import { ListingItemDetails } from "@/components/listings/listing-item-details";
import { listingItemDisplayLabel } from "@/lib/listing-item-label";
import { listingPriceLabel } from "@/lib/listing-price";
import { listingInclude, mapListing } from "@/lib/queries/listings";
import { resolveListingGalleryUrls } from "@/lib/listing-images";
import { GO_SHOOT_ATTRIBUTION } from "@/lib/go-shoot-images";
import { conditionLabel, deliveryTagLabel } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

const TYPE_LABEL: Record<string, string> = {
  sell: "出售",
  want: "徵求",
  trade: "交換",
};

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getSessionUser();

  const row = await prisma.listing.findUnique({
    where: { id },
    include: listingInclude,
  });

  if (!row) notFound();
  const listing = mapListing(row);

  const isOwner = user?.id === listing.user_id;
  const publicStatuses = ["active", "reserved"];
  if (!publicStatuses.includes(listing.status) && !isOwner) notFound();

  if (user && !isOwner && publicStatuses.includes(listing.status)) {
    await recordListingView(id);
  }

  const canContact =
    publicStatuses.includes(listing.status) &&
    (listing.status !== "reserved" || listing.accept_inquiries_while_reserved);

  const offerItems =
    listing.listing_items?.filter((i) => i.role === "offer") ?? [];
  const offerLabels = offerItems
    .map((i) => listingItemDisplayLabel(i))
    .filter(Boolean) as string[];
  const title =
    listing.custom_title ??
    (offerLabels.length > 1
      ? `${offerLabels[0]} 等 ${offerLabels.length} 項`
      : offerLabels[0]) ??
    "刊登";

  const galleryUrls = resolveListingGalleryUrls(listing);
  const usesGoShootDefaults =
    (listing.listing_images ?? []).length === 0 && galleryUrls.length > 0;
  const condition = conditionLabel(listing.condition);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <TradeDisclaimer />
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <ListingGallery urls={galleryUrls} />
          {usesGoShootDefaults && (
            <p className="mt-2 text-xs text-zinc-400">{GO_SHOOT_ATTRIBUTION}</p>
          )}
        </div>
        <div>
          <p className="text-sm text-zinc-500">
            {TYPE_LABEL[listing.type]} · {listing.view_count} 瀏覽
          </p>
          <h1 className="mt-1 text-2xl font-bold">{title}</h1>
          <p className="mt-2 text-xl font-semibold text-emerald-700 dark:text-emerald-400">
            {listingPriceLabel(listing)}
            {listing.negotiable && listing.type === "sell" && " · 可議價"}
          </p>
          <dl className="mt-4 space-y-2 text-sm">
            <div>
              <dt className="text-zinc-500">賣家</dt>
              <dd>
                <Link href={`/users/${listing.user_id}`} className="underline">
                  {listing.profiles?.display_name}
                </Link>
              </dd>
            </div>
            {condition && (
              <div>
                <dt className="text-zinc-500">成色</dt>
                <dd>{condition}</dd>
              </div>
            )}
            <div>
              <dt className="text-zinc-500">地區</dt>
              <dd>{listing.region ?? "—"}</dd>
            </div>
            {(listing.delivery_tags?.length ?? 0) > 0 && (
              <div>
                <dt className="text-zinc-500">交易方式</dt>
                <dd>
                  {listing.delivery_tags
                    .map((t) => deliveryTagLabel(t))
                    .join("、")}
                </dd>
              </div>
            )}
            <div>
              <dt className="text-zinc-500">發布</dt>
              <dd>{formatDate(listing.published_at ?? listing.created_at)}</dd>
            </div>
            {listing.note && (
              <div>
                <dt className="text-zinc-500">備註</dt>
                <dd className="whitespace-pre-wrap">{listing.note}</dd>
              </div>
            )}
          </dl>
          <div className="mt-6 flex flex-wrap gap-2">
            {canContact && (
              <ListingContactButton
                href={
                  user
                    ? `/messages/new?listing=${id}&to=${listing.user_id}`
                    : `/login?callbackUrl=${encodeURIComponent(`/listings/${id}`)}`
                }
                label={user ? "聯絡賣家" : "登入後聯絡"}
                pendingLabel={user ? "開啟對話中…" : "前往登入…"}
              />
            )}
            {user && <ReportButton targetType="listing" targetId={id} />}
          </div>
          {user && listing.profiles && (
            <ContactSection
              listing={listing}
              seller={listing.profiles}
              viewerLoggedIn={!!user}
            />
          )}
          {isOwner && (
            <ListingStatusManager listingId={id} currentStatus={listing.status} />
          )}
        </div>
      </div>
      <ListingItemDetails listing={listing} />
    </div>
  );
}
