"use server";

import { prisma } from "@/lib/prisma";
import { requireVerifiedUser, redirectByAuthError } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function submitRating(formData: FormData) {
  const auth = await requireVerifiedUser();
  if (auth.error) redirectByAuthError(auth.error);

  const listingId = String(formData.get("listing_id") ?? "");
  const rateeId = String(formData.get("ratee_id") ?? "");
  const score = parseInt(String(formData.get("score") ?? "0"), 10);
  const comment = String(formData.get("comment") ?? "").trim().slice(0, 300) || null;

  if (score < 1 || score > 5) {
    redirect(`/listings/${listingId}?rating_error=score`);
  }

  if (rateeId === auth.user.id) {
    redirect(`/listings/${listingId}?rating_error=self`);
  }

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { userId: true, status: true },
  });

  if (!listing || !["sold", "closed"].includes(listing.status)) {
    redirect(`/listings/${listingId}?rating_error=status`);
  }

  const hasConversation = await prisma.conversation.findFirst({
    where: {
      listingId,
      OR: [
        { participantA: auth.user.id, participantB: rateeId },
        { participantA: rateeId, participantB: auth.user.id },
      ],
    },
  });

  const isListingOwner = listing.userId === auth.user.id;

  if (!hasConversation && !isListingOwner) {
    redirect(`/listings/${listingId}?rating_error=permission`);
  }

  const existing = await prisma.rating.findUnique({
    where: { listingId_raterId: { listingId, raterId: auth.user.id } },
  });
  if (existing) {
    redirect(`/listings/${listingId}?rating_error=duplicate`);
  }

  await prisma.rating.create({
    data: {
      listingId,
      raterId: auth.user.id,
      rateeId,
      score,
      comment,
    },
  });

  revalidatePath(`/listings/${listingId}`);
  revalidatePath(`/users/${rateeId}`);
  redirect(`/listings/${listingId}?rated=1`);
}

export async function getUserRatingStats(userId: string) {
  const ratings = await prisma.rating.findMany({
    where: { rateeId: userId },
    select: { score: true },
  });

  if (ratings.length === 0) return null;

  const total = ratings.length;
  const sum = ratings.reduce((acc, r) => acc + r.score, 0);
  const average = sum / total;
  const distribution = [0, 0, 0, 0, 0];
  for (const r of ratings) {
    distribution[r.score - 1]++;
  }

  return { average, total, distribution };
}

export async function getUserRatings(userId: string, limit = 20) {
  return prisma.rating.findMany({
    where: { rateeId: userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      listing: {
        select: { id: true, customTitle: true, type: true },
      },
    },
  });
}
