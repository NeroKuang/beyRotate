import { getCatalogStats } from "@/lib/catalog/query";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") ?? "bey";
  const series = searchParams.get("series");
  const stats = await getCatalogStats(category, series);
  return NextResponse.json(stats);
}
