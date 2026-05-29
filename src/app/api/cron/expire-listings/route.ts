import { NextResponse } from "next/server";
import { expirePublishedListings } from "@/lib/expire-listings";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const result = await expirePublishedListings();
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    const message = e instanceof Error ? e.message : "expire failed";
    console.error("[cron/expire-listings]", e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
