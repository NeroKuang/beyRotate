import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { applyWatermark } from "@/lib/watermark";
import { uploadToImgur } from "@/lib/storage";
import { MAX_LISTING_IMAGES, MAX_IMAGE_BYTES } from "@/lib/constants";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登入" }, { status: 401 });
  }

  const { id: listingId } = await params;

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { userId: true },
  });
  if (!listing || listing.userId !== session.user.id) {
    return NextResponse.json({ error: "無權限" }, { status: 403 });
  }

  const existingCount = await prisma.listingImage.count({
    where: { listingId },
  });
  if (existingCount >= MAX_LISTING_IMAGES) {
    return NextResponse.json(
      { error: `最多 ${MAX_LISTING_IMAGES} 張圖片` },
      { status: 400 },
    );
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  if (!file || !file.type.startsWith("image/")) {
    return NextResponse.json({ error: "請上傳圖片檔案" }, { status: 400 });
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return NextResponse.json({ error: "圖片大小不可超過 5MB" }, { status: 400 });
  }

  const rawBuffer = Buffer.from(await file.arrayBuffer());

  let processed: Buffer;
  try {
    processed = await applyWatermark(rawBuffer);
  } catch (err) {
    console.error("[image upload] watermark error:", err);
    return NextResponse.json({ error: "圖片處理失敗" }, { status: 500 });
  }

  let imgurUrl: string;
  try {
    imgurUrl = await uploadToImgur(processed);
  } catch (err) {
    console.error("[image upload] Imgur error:", err);
    return NextResponse.json({ error: "圖片儲存失敗，請確認 IMGUR_CLIENT_ID 設定" }, { status: 500 });
  }

  const image = await prisma.listingImage.create({
    data: {
      listingId,
      storagePath: imgurUrl,
      sortOrder: existingCount,
    },
  });

  return NextResponse.json({
    id: image.id,
    url: imgurUrl,
    sort_order: image.sortOrder,
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登入" }, { status: 401 });
  }

  const { id: listingId } = await params;

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { userId: true },
  });
  if (!listing || listing.userId !== session.user.id) {
    return NextResponse.json({ error: "無權限" }, { status: 403 });
  }

  const { imageId } = await request.json();
  if (!imageId) {
    return NextResponse.json({ error: "缺少 imageId" }, { status: 400 });
  }

  await prisma.listingImage.deleteMany({
    where: { id: imageId, listingId },
  });

  return NextResponse.json({ ok: true });
}
