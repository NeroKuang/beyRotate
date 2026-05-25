import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { getUserRatingStats } from "@/app/actions/ratings";
import { ListingCard } from "@/components/listings/listing-card";
import { StarRatingDisplay } from "@/components/ratings/star-rating";
import { StarRating } from "@/components/ratings/star-rating";
import { RatingList } from "@/components/ratings/rating-list";
import { formatDate } from "@/lib/utils";
import { AvatarImage } from "@/components/ui/avatar-image";
import { Button } from "@/components/ui/button";
import { BeyEmptyState } from "@/components/layout/bey-empty-state";
import { listingInclude, mapListing } from "@/lib/queries/listings";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const viewer = await getSessionUser();

  const profile = await prisma.profile.findUnique({ where: { id } });
  if (!profile || profile.isBanned) notFound();

  const ratingStats = await getUserRatingStats(id);

  const ratingsRaw = await prisma.rating.findMany({
    where: { rateeId: id },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      listing: { select: { id: true, customTitle: true, type: true } },
    },
  });
  const raterIds = ratingsRaw.map((r) => r.raterId);
  const raterProfiles = raterIds.length > 0
    ? await prisma.profile.findMany({
        where: { id: { in: raterIds } },
        select: { id: true, displayName: true },
      })
    : [];
  const raterNameMap = new Map(raterProfiles.map((p) => [p.id, p.displayName]));
  const ratings = ratingsRaw.map((r) => ({
    ...r,
    raterName: raterNameMap.get(r.raterId) ?? "使用者",
  }));

  const activeRows = await prisma.listing.findMany({
    where: { userId: id, status: { in: ["active", "reserved"] } },
    include: listingInclude,
  });

  const historyRows = await prisma.listing.findMany({
    where: { userId: id, status: { in: ["sold", "closed"] } },
    include: listingInclude,
    take: 12,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <AvatarImage src={profile.avatarUrl} name={profile.displayName} size="md" />
        <div>
          <h1 className="text-2xl font-bold">{profile.displayName}</h1>
          {ratingStats && (
            <div className="mt-1">
              <StarRatingDisplay average={ratingStats.average} total={ratingStats.total} size="sm" />
            </div>
          )}
          <p className="text-sm text-zinc-500">
            加入於 {formatDate(profile.createdAt.toISOString())}
          </p>
        </div>
      </div>
      {viewer?.id && viewer.id !== id && (
        <Link href={`/messages/new?to=${id}`} className="inline-block mb-6">
          <Button>發送私訊</Button>
        </Link>
      )}
      <h2 className="font-bold mb-4">上架中</h2>
      {activeRows.length === 0 ? (
        <div className="mb-12">
          <BeyEmptyState
            title="目前無上架刊登"
            description="此用戶還沒有上架中的品項。"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {activeRows.map((r) => <ListingCard key={r.id} listing={mapListing(r)} />)}
        </div>
      )}
      {historyRows.length > 0 && (
        <>
          <h2 className="font-bold mb-4 text-zinc-500">歷史刊登</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {historyRows.map((r) => (
              <ListingCard key={r.id} listing={mapListing(r)} />
            ))}
          </div>
        </>
      )}

      {ratings.length > 0 && (
        <section className="mt-12">
          <h2 className="font-bold mb-4">
            交易評價
            {ratingStats && (
              <span className="ml-2 font-normal text-sm text-zinc-500">
                平均 {Math.round(ratingStats.average * 10) / 10} 星 · {ratingStats.total} 則
              </span>
            )}
          </h2>
          {ratingStats && (
            <div className="bey-card mb-4 p-4">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="text-center">
                  <p className="text-3xl font-bold">{Math.round(ratingStats.average * 10) / 10}</p>
                  <StarRating value={Math.round(ratingStats.average)} readonly size="sm" />
                  <p className="text-xs text-zinc-500 mt-1">{ratingStats.total} 則評價</p>
                </div>
                <div className="flex-1 min-w-[140px] space-y-1">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = ratingStats.distribution[star - 1];
                    const pct = ratingStats.total > 0 ? (count / ratingStats.total) * 100 : 0;
                    return (
                      <div key={star} className="flex items-center gap-2 text-xs">
                        <span className="w-3 text-right">{star}</span>
                        <div className="flex-1 h-2 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-amber-400"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-6 text-right text-zinc-500">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
          <RatingList ratings={ratings} />
        </section>
      )}
    </div>
  );
}
