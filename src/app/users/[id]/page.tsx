import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { ListingCard } from "@/components/listings/listing-card";
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
    </div>
  );
}
