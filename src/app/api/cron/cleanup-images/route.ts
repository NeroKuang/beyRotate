import { NextResponse } from "next/server";
import { cleanupExpiredListingImages } from "@/lib/cleanup-listing-images";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const result = await cleanupExpiredListingImages();
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    const message = e instanceof Error ? e.message : "cleanup failed";
    console.error("[cron/cleanup-images]", e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
