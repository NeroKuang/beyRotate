import { getSeriesCounts } from "@/lib/catalog/query";
import { PRODUCT_SERIES } from "@/lib/catalog/series";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const category = new URL(request.url).searchParams.get("category") ?? "bey";
  const counts = await getSeriesCounts(category);
  const countMap = Object.fromEntries(counts.map((c) => [c.series, c.count]));

  const series = PRODUCT_SERIES.map((s) => ({
    id: s.id,
    label: s.label,
    short: s.short,
    description: s.description,
    count: countMap[s.id] ?? 0,
  }));

  return NextResponse.json({ series, total: counts.reduce((n, c) => n + c.count, 0) });
}
