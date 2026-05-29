import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { applyWatermark } from "@/lib/watermark";
import { uploadToImgur, deleteStoredImage } from "@/lib/image-storage";
import { MAX_IMAGE_BYTES } from "@/lib/constants";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登入" }, { status: 401 });
  }

  const { id } = await params;
  const tournament = await prisma.tournament.findUnique({
    where: { id },
    select: { organizerId: true, posterPath: true, posterDeleteHash: true },
  });
  if (!tournament || tournament.organizerId !== session.user.id) {
    return NextResponse.json({ error: "無權限" }, { status: 403 });
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
    console.error("[tournament poster] watermark error:", err);
    return NextResponse.json({ error: "圖片處理失敗" }, { status: 500 });
  }

  let uploaded: Awaited<ReturnType<typeof uploadToImgur>>;
  try {
    uploaded = await uploadToImgur(processed);
  } catch (err) {
    console.error("[tournament poster] Imgur error:", err);
    return NextResponse.json({ error: "圖片儲存失敗" }, { status: 500 });
  }

  if (tournament.posterPath) {
    try {
      await deleteStoredImage(tournament.posterPath, tournament.posterDeleteHash);
    } catch (err) {
      console.error("[tournament poster] old delete failed:", err);
    }
  }

  await prisma.tournament.update({
    where: { id },
    data: {
      posterPath: uploaded.url,
      posterDeleteHash: uploaded.deleteHash,
    },
  });

  return NextResponse.json({ url: uploaded.url });
}
