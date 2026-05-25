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
import { RatingForm } from "@/components/ratings/rating-form";
import { StarRating, StarRatingDisplay } from "@/components/ratings/star-rating";
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

const RATING_ERRORS: Record<string, string> = {
  score: "請選擇 1-5 星評分。",
  self: "不能為自己評分。",
  status: "此刊登尚未完成交易，無法評分。",
  permission: "你沒有此刊登的交易紀錄，無法評分。",
  duplicate: "你已經為此刊登評過分了。",
};

export default async function ListingDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ rated?: string; rating_error?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const user = await getSessionUser();

  const row = await prisma.listing.findUnique({
    where: { id },
    include: listingInclude,
  });

  if (!row) notFound();
  const listing = mapListing(row);

  const isOwner = user?.id === listing.user_id;
  const publicStatuses = ["active", "reserved"];
  const completedStatuses = ["sold", "closed"];

  let isConversationParticipant = false;
  if (user && !isOwner && completedStatuses.includes(listing.status)) {
    const convo = await prisma.conversation.findFirst({
      where: {
        listingId: id,
        OR: [{ participantA: user.id }, { participantB: user.id }],
      },
    });
    isConversationParticipant = !!convo;
  }

  if (
    !publicStatuses.includes(listing.status) &&
    !isOwner &&
    !isConversationParticipant
  ) {
    notFound();
  }

  if (user && !isOwner && publicStatuses.includes(listing.status)) {
    await recordListingView(id);
  }

  const canContact =
    publicStatuses.includes(listing.status) &&
    (listing.status !== "reserved" || listing.accept_inquiries_while_reserved);

  const sellerRatings = await prisma.rating.findMany({
    where: { rateeId: listing.user_id },
    select: { score: true },
  });
  const sellerRatingStats = sellerRatings.length > 0
    ? {
        average: sellerRatings.reduce((s, r) => s + r.score, 0) / sellerRatings.length,
        total: sellerRatings.length,
      }
    : null;

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
              <dd className="flex items-center gap-2">
                <Link href={`/users/${listing.user_id}`} className="underline">
                  {listing.profiles?.display_name}
                </Link>
                {sellerRatingStats && (
                  <StarRatingDisplay
                    average={sellerRatingStats.average}
                    total={sellerRatingStats.total}
                    size="sm"
                  />
                )}
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

      {/* Rating section */}
      {await (async () => {
        if (!user || !completedStatuses.includes(listing.status)) return null;

        const existingRating = await prisma.rating.findUnique({
          where: { listingId_raterId: { listingId: id, raterId: user.id } },
        });

        const rateeId = isOwner
          ? null
          : listing.user_id;

        let sellerRatee: { id: string; name: string } | null = null;
        if (isOwner) {
          const convos = await prisma.conversation.findMany({
            where: { listingId: id },
            select: { participantA: true, participantB: true },
          });
          const buyerIds = new Set<string>();
          for (const c of convos) {
            if (c.participantA !== user.id) buyerIds.add(c.participantA);
            if (c.participantB !== user.id) buyerIds.add(c.participantB);
          }
          if (buyerIds.size === 1) {
            const buyerId = [...buyerIds][0];
            const buyerProfile = await prisma.profile.findUnique({
              where: { id: buyerId },
              select: { displayName: true },
            });
            sellerRatee = { id: buyerId, name: buyerProfile?.displayName ?? "買家" };
          }
        }

        const targetId = rateeId ?? sellerRatee?.id;
        const targetName = rateeId
          ? (listing.profiles?.display_name ?? "賣家")
          : sellerRatee?.name ?? "";

        const existingRatings = await prisma.rating.findMany({
          where: { listingId: id },
          orderBy: { createdAt: "desc" },
          include: {
            listing: { select: { id: true, customTitle: true, type: true } },
          },
        });

        const raterIds = existingRatings.map((r) => r.raterId);
        const raterProfiles = raterIds.length > 0
          ? await prisma.profile.findMany({
              where: { id: { in: raterIds } },
              select: { id: true, displayName: true },
            })
          : [];
        const raterNameMap = new Map(raterProfiles.map((p) => [p.id, p.displayName]));

        return (
          <section className="mt-8 space-y-4">
            <h2 className="font-bold">交易評價</h2>

            {sp.rated === "1" && (
              <p className="text-sm text-emerald-600">評分已送出！</p>
            )}
            {sp.rating_error && (
              <p className="text-sm text-red-600">
                {RATING_ERRORS[sp.rating_error] ?? "評分失敗，請稍後再試。"}
              </p>
            )}

            {!existingRating && targetId && (
              <RatingForm
                listingId={id}
                rateeId={targetId}
                rateeName={targetName}
              />
            )}

            {existingRating && (
              <div className="bey-card p-4 space-y-1">
                <p className="text-sm text-zinc-500">你的評分</p>
                <StarRating value={existingRating.score} readonly size="md" />
                {existingRating.comment && (
                  <p className="text-sm">{existingRating.comment}</p>
                )}
              </div>
            )}

            {existingRatings.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm text-zinc-500">所有評價（{existingRatings.length}）</p>
                {existingRatings.map((r) => (
                  <div key={r.id} className="bey-card p-4 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <StarRating value={r.score} readonly size="sm" />
                        <Link href={`/users/${r.raterId}`} className="text-sm font-medium underline">
                          {raterNameMap.get(r.raterId) ?? "使用者"}
                        </Link>
                      </div>
                      <span className="text-xs text-zinc-500">
                        {formatDate(r.createdAt.toISOString())}
                      </span>
                    </div>
                    {r.comment && (
                      <p className="text-sm text-zinc-700 dark:text-zinc-300">{r.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        );
      })()}
    </div>
  );
}
