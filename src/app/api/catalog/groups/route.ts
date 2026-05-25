import { getCatalogGroups } from "@/lib/catalog/query";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") ?? "bey";
  const q = (searchParams.get("q") ?? "").trim();
  const series = searchParams.get("series") ?? "all";

  const groups = await getCatalogGroups(category, q, 500, series);

  return NextResponse.json({ groups, cached: !!process.env.REDIS_URL });
}
