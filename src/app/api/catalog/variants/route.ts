import { searchCatalogVariants } from "@/lib/catalog/query";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") ?? "bey";
  const q = (searchParams.get("q") ?? "").trim();
  const seriesParam = searchParams.get("series");
  const limit = Math.min(Number(searchParams.get("limit") ?? 20), 50);

  const series =
    q.trim() || !seriesParam || seriesParam === "all" ? undefined : seriesParam;

  const variants = await searchCatalogVariants(category, q, limit, series);

  return NextResponse.json({
    variants: variants.map((v) => ({
      id: v.id,
      display_label: v.display_label,
      package_label_zh: v.package_label_zh,
      blade_name_zh: v.blade_name_zh,
      ratchet_name_zh: v.ratchet_name_zh,
      bit_name_zh: v.bit_name_zh,
      catalog_products: { code: v.code, category_id: v.category_id },
    })),
  });
}
