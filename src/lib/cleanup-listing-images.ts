import { prisma } from "@/lib/prisma";
import {
  DRAFT_IMAGE_RETENTION_DAYS,
  IMAGE_CLEANUP_RETENTION_DAYS,
} from "@/lib/constants";
import { deleteStoredImage, isManagedUserUpload } from "@/lib/image-storage";

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

export async function purgeListingImages(listingIds: string[]): Promise<number> {
  if (listingIds.length === 0) return 0;

  const images = await prisma.listingImage.findMany({
    where: { listingId: { in: listingIds } },
    select: { id: true, storagePath: true, deleteHash: true },
  });

  const managed = images.filter((img) => isManagedUserUpload(img.storagePath));
  if (managed.length === 0) return 0;

  for (const img of managed) {
    try {
      await deleteStoredImage(img.storagePath, img.deleteHash);
    } catch (err) {
      console.error("[purgeListingImages] remote delete failed:", img.id, err);
    }
  }

  const { count } = await prisma.listingImage.deleteMany({
    where: { id: { in: managed.map((m) => m.id) } },
  });
  return count;
}

export type CleanupImagesResult = {
  listingsProcessed: number;
  imagesRemoved: number;
  endedListings: number;
  staleDrafts: number;
};

/**
 * Remove user-uploaded images for expired listings (cron).
 * Does not touch go-shoot catalog default images.
 */
export async function cleanupExpiredListingImages(): Promise<CleanupImagesResult> {
  const endedCutoff = daysAgo(IMAGE_CLEANUP_RETENTION_DAYS);
  const draftCutoff = daysAgo(DRAFT_IMAGE_RETENTION_DAYS);

  const endedListings = await prisma.listing.findMany({
    where: {
      status: { in: ["sold", "closed", "hidden"] },
      updatedAt: { lt: endedCutoff },
      images: { some: {} },
    },
    select: { id: true },
  });

  const staleDrafts = await prisma.listing.findMany({
    where: {
      status: "draft",
      createdAt: { lt: draftCutoff },
      images: { some: {} },
    },
    select: { id: true },
  });

  const allIds = [
    ...endedListings.map((l) => l.id),
    ...staleDrafts.map((l) => l.id),
  ];
  const uniqueIds = [...new Set(allIds)];

  const imagesRemoved = await purgeListingImages(uniqueIds);

  return {
    listingsProcessed: uniqueIds.length,
    imagesRemoved,
    endedListings: endedListings.length,
    staleDrafts: staleDrafts.length,
  };
}
