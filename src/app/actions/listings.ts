"use server";

import { prisma } from "@/lib/prisma";
import { requireVerifiedUser } from "@/lib/auth";
import { LISTING_QUOTA, MAX_NOTE_LENGTH, MAX_SEEK_TEXT, DELIVERY_TAGS, MAX_LISTING_IMAGES } from "@/lib/constants";
import {
  listingSellPriceFromItems,
  listingWantBudgetFromItems,
  parseItemAmounts,
  validateItemAmounts,
} from "@/lib/listings/parse-item-amounts";
import { resolveItemImageUrlFromDb } from "@/lib/listing-images";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

const DELIVERY_TAG_VALUES = new Set<string>(DELIVERY_TAGS.map((t) => t.value));

export async function createListing(formData: FormData) {
  const auth = await requireVerifiedUser();
  if (auth.error) redirect(`/${auth.error === "login" ? "login" : auth.error === "verify" ? "login?message=verify" : "onboarding"}`);

  const type = String(formData.get("type")) as "sell" | "want" | "trade";
  const offerKind = String(formData.get("offer_kind") ?? "variant") as
    | "variant"
    | "part";
  const variantId = String(formData.get("variant_id") ?? "");
  const variantIds = formData
    .getAll("variant_ids")
    .map((v) => String(v))
    .filter(Boolean);
  const offerVariantIds =
    variantIds.length > 0 ? variantIds : variantId ? [variantId] : [];
  const partIds = formData
    .getAll("part_ids")
    .map((v) => String(v))
    .filter(Boolean);
  const partSourceCodes = formData.getAll("part_source_codes").map((v) => String(v));
  const partSourceSpecs = formData.getAll("part_source_specs").map((v) => String(v));
  const partAmounts = parseItemAmounts(formData, "part_amounts");
  const variantAmounts = parseItemAmounts(formData, "variant_amounts");
  const seekVariantId = String(formData.get("seek_variant_id") ?? "");
  const seekText = String(formData.get("seek_text") ?? "").trim();
  const publish = formData.get("publish") === "on";
  const hasPerItemPricing =
    (type === "sell" || type === "want") &&
    ((offerKind === "part" && partIds.length > 0) ||
      (offerKind === "variant" && offerVariantIds.length > 0));

  let price = formData.get("price")
    ? parseInt(String(formData.get("price")), 10)
    : null;
  let budget = formData.get("budget")
    ? parseInt(String(formData.get("budget")), 10)
    : null;

  if (type === "sell" && hasPerItemPricing) {
    const amounts =
      offerKind === "part" ? partAmounts : variantAmounts;
    if (!validateItemAmounts(amounts, offerKind === "part" ? partIds.length : offerVariantIds.length)) {
      redirect("/listings/new?error=item_price");
    }
    price = listingSellPriceFromItems(amounts);
  }
  if (type === "want" && hasPerItemPricing) {
    const amounts =
      offerKind === "part" ? partAmounts : variantAmounts;
    if (!validateItemAmounts(amounts, offerKind === "part" ? partIds.length : offerVariantIds.length)) {
      redirect("/listings/new?error=item_price");
    }
    budget = listingWantBudgetFromItems(amounts);
  }

  if (type === "sell" && !hasPerItemPricing && !price) {
    redirect("/listings/new?error=price");
  }
  if (type === "want" && !hasPerItemPricing && !budget) {
    redirect("/listings/new?error=budget");
  }

  const cashDiff = formData.get("cash_diff")
    ? parseInt(String(formData.get("cash_diff")), 10)
    : null;

  const activeCount = await prisma.listing.count({
    where: {
      userId: auth.user.id,
      status: { in: ["active", "reserved"] },
    },
  });
  if (activeCount >= LISTING_QUOTA && publish) redirect("/listings/new?error=quota");

  const note = String(formData.get("note") ?? "").slice(0, MAX_NOTE_LENGTH);

  const deliveryTags = formData
    .getAll("delivery_tags")
    .map((v) => String(v))
    .filter((v) => DELIVERY_TAG_VALUES.has(v));
  if (deliveryTags.length === 0) redirect("/listings/new?error=delivery");

  if (offerKind === "part") {
    if (!partIds.length) redirect("/listings/new?error=part");
  } else if (!offerVariantIds.length) {
    redirect("/listings/new?error=variant");
  }

  if (type === "trade" && !seekVariantId && !seekText) {
    redirect("/listings/new?error=seek");
  }

  const listing = await prisma.$transaction(async (tx) => {
    const created = await tx.listing.create({
      data: {
        userId: auth.user.id,
        type,
        status: publish ? "active" : "draft",
        customTitle: String(formData.get("custom_title") || "") || null,
        price: type === "sell" ? price : null,
        budget: type === "want" ? budget : null,
        cashDiff: type === "trade" ? cashDiff : null,
        negotiable: formData.get("negotiable") === "on",
        condition: (String(formData.get("condition") || "") || null) as
          | "new"
          | "like_new"
          | "used"
          | "parts"
          | null,
        region: String(formData.get("region") || "") || null,
        deliveryTags,
        note: note || null,
        contactPref: (String(formData.get("contact_pref") || "in_app")) as
          | "in_app"
          | "external"
          | "both",
        acceptInquiriesWhileReserved:
          formData.get("accept_inquiries_while_reserved") !== "off",
        publishedAt: publish ? new Date() : null,
      },
    });

    if (offerKind === "part") {
      await tx.listingItem.createMany({
        data: partIds.map((catalogPartId, i) => ({
          listingId: created.id,
          itemKind: "part" as const,
          catalogPartId,
          sourceProductCode:
            (partSourceCodes[i] ?? "").trim().slice(0, 32) || null,
          sourcePartSpec: (partSourceSpecs[i] ?? "").trim().slice(0, 64) || null,
          price: type === "sell" ? partAmounts[i] : null,
          budget: type === "want" ? partAmounts[i] : null,
          role: "offer" as const,
        })),
      });
    } else {
      await tx.listingItem.createMany({
        data: offerVariantIds.map((catalogVariantId, i) => ({
          listingId: created.id,
          itemKind: "variant" as const,
          catalogVariantId,
          price: type === "sell" ? variantAmounts[i] : null,
          budget: type === "want" ? variantAmounts[i] : null,
          role: "offer" as const,
        })),
      });
    }

    if (type === "trade") {
      if (seekVariantId) {
        await tx.listingItem.create({
          data: {
            listingId: created.id,
            itemKind: "variant",
            catalogVariantId: seekVariantId,
            role: "seek",
          },
        });
      } else if (seekText) {
        await tx.listingItem.create({
          data: {
            listingId: created.id,
            role: "seek",
            seekText: seekText.slice(0, MAX_SEEK_TEXT),
          },
        });
      }
    }

    return created;
  });

  revalidatePath("/");
  await attachDefaultListingImages(listing.id);
  redirect(publish ? `/listings/${listing.id}` : `/listings/${listing.id}/edit`);
}

async function attachDefaultListingImages(listingId: string) {
  const items = await prisma.listingItem.findMany({
    where: { listingId, role: "offer" },
    include: {
      variant: { include: { product: true } },
      part: true,
    },
  });

  const seen = new Set<string>();
  const urls: string[] = [];
  for (const item of items) {
    const url = resolveItemImageUrlFromDb(item);
    if (url && !seen.has(url)) {
      seen.add(url);
      urls.push(url);
    }
    if (urls.length >= MAX_LISTING_IMAGES) break;
  }

  if (urls.length === 0) return;

  await prisma.listingImage.createMany({
    data: urls.map((storagePath, sortOrder) => ({
      listingId,
      storagePath,
      sortOrder,
    })),
  });
}

export async function updateListing(formData: FormData) {
  const auth = await requireVerifiedUser();
  if (auth.error) redirect("/login");

  const id = String(formData.get("id") ?? "");
  const listing = await prisma.listing.findUnique({
    where: { id },
    select: { userId: true, type: true, status: true },
  });
  if (!listing || listing.userId !== auth.user.id) redirect("/dashboard");

  const status = String(formData.get("status") ?? listing.status);
  const customTitle = String(formData.get("custom_title") || "") || null;
  const condition = String(formData.get("condition") || "") || null;
  const region = String(formData.get("region") || "") || null;
  const note = String(formData.get("note") ?? "").slice(0, MAX_NOTE_LENGTH) || null;
  const contactPref = String(formData.get("contact_pref") || "in_app");
  const negotiable = formData.get("negotiable") === "on";
  const acceptInquiries = formData.get("accept_inquiries_while_reserved") === "on";

  const deliveryTags = formData
    .getAll("delivery_tags")
    .map((v) => String(v))
    .filter((v) => DELIVERY_TAG_VALUES.has(v));

  const data: Record<string, unknown> = {
    status,
    customTitle,
    condition,
    region,
    deliveryTags,
    note,
    contactPref,
    negotiable,
    acceptInquiriesWhileReserved: acceptInquiries,
  };

  if (listing.type === "sell") {
    const price = formData.get("price")
      ? parseInt(String(formData.get("price")), 10)
      : null;
    data.price = price;
  } else if (listing.type === "want") {
    const budget = formData.get("budget")
      ? parseInt(String(formData.get("budget")), 10)
      : null;
    data.budget = budget;
  } else if (listing.type === "trade") {
    const cashDiff = formData.get("cash_diff")
      ? parseInt(String(formData.get("cash_diff")), 10)
      : null;
    data.cashDiff = cashDiff;
  }

  if (status === "active" && listing.status !== "active") {
    data.publishedAt = new Date();
  }

  await prisma.listing.update({ where: { id }, data });

  revalidatePath(`/listings/${id}`);
  revalidatePath("/dashboard");
  redirect(`/listings/${id}`);
}

export async function updateListingStatus(listingId: string, status: string) {
  const auth = await requireVerifiedUser();
  if (auth.error) redirect("/login");

  await prisma.listing.updateMany({
    where: { id: listingId, userId: auth.user.id },
    data: { status: status as "active" | "reserved" | "sold" | "closed" },
  });

  revalidatePath(`/listings/${listingId}`);
  revalidatePath("/dashboard");
}

export async function updateListingStatusAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  await updateListingStatus(id, status);
  redirect(`/listings/${id}`);
}

export async function recordListingView(listingId: string) {
  const auth = await requireVerifiedUser();
  if (auth.error) return;

  try {
    await prisma.listingView.create({
      data: { listingId, userId: auth.user.id },
    });
    await prisma.listing.update({
      where: { id: listingId },
      data: { viewCount: { increment: 1 } },
    });
  } catch {
    /* already viewed */
  }
}
