"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { isAdminEmail } from "@/lib/admin";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { purgeListingImages } from "@/lib/cleanup-listing-images";
import { deleteStoredImage, isManagedUserUpload } from "@/lib/image-storage";
import { invalidateMarketPriceCache } from "@/lib/catalog/market-prices";

async function requireAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !isAdminEmail(session.user.email)) {
    redirect("/");
  }
  return session;
}

async function writeAudit(
  adminId: string,
  action: string,
  targetType: string,
  targetId: string,
  reason: string,
) {
  await prisma.adminAuditLog.create({
    data: { adminId, action, targetType, targetId, reason },
  });
}

export async function adminDeleteListing(formData: FormData) {
  const session = await requireAdminSession();
  const listingId = String(formData.get("listing_id") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();
  if (!listingId || !reason) redirect("/admin?error=reason");

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { id: true },
  });
  if (!listing) redirect("/admin?error=not_found");

  await purgeListingImages([listingId]);
  await prisma.listing.delete({ where: { id: listingId } });
  invalidateMarketPriceCache();

  await writeAudit(session.user.id, "delete_listing", "listing", listingId, reason);

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/catalog");
  redirect("/admin?deleted=listing");
}

export async function adminDeleteMessage(formData: FormData) {
  const session = await requireAdminSession();
  const messageId = String(formData.get("message_id") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();
  if (!messageId || !reason) redirect("/admin?error=reason");

  const message = await prisma.message.findUnique({
    where: { id: messageId },
    select: { id: true, conversationId: true, imagePath: true },
  });
  if (!message) redirect("/admin?error=not_found");

  if (message.imagePath && isManagedUserUpload(message.imagePath)) {
    try {
      await deleteStoredImage(message.imagePath, null);
    } catch (err) {
      console.error("[adminDeleteMessage] image delete failed:", messageId, err);
    }
  }

  await prisma.message.delete({ where: { id: messageId } });
  await writeAudit(session.user.id, "delete_message", "message", messageId, reason);

  revalidatePath("/admin");
  revalidatePath(`/messages/${message.conversationId}`);
  redirect("/admin?deleted=message");
}

export async function adminAction(formData: FormData) {
  const session = await requireAdminSession();

  const reportId = String(formData.get("report_id") ?? "");
  const action = String(formData.get("action") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  const targetType = String(formData.get("target_type") ?? "");
  const targetId = String(formData.get("target_id") ?? "");

  if (!reason) redirect("/admin?error=reason");

  if (action === "hide" && targetType === "listing") {
    await prisma.listing.update({
      where: { id: targetId },
      data: { status: "hidden" },
    });
    invalidateMarketPriceCache();
  }

  if (action === "delete_listing" && targetType === "listing") {
    await purgeListingImages([targetId]);
    await prisma.listing.delete({ where: { id: targetId } });
    invalidateMarketPriceCache();
  }

  await prisma.report.update({
    where: { id: reportId },
    data: {
      status:
        action === "hide" || action === "delete_listing" ? "resolved" : "dismissed",
    },
  });

  await writeAudit(session.user.id, action, targetType, targetId, reason);

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/catalog");
  redirect("/admin");
}
