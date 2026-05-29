import { NextResponse } from "next/server";
import {
  getMarketPricesForParts,
  getMarketPricesForVariants,
} from "@/lib/catalog/market-prices";

const MAX_IDS = 500;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const variantIds = searchParams
    .get("variant_ids")
    ?.split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, MAX_IDS) ?? [];
  const partIds = searchParams
    .get("part_ids")
    ?.split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, MAX_IDS) ?? [];

  if (variantIds.length === 0 && partIds.length === 0) {
    return NextResponse.json(
      { error: "請提供 variant_ids 或 part_ids" },
      { status: 400 },
    );
  }

  const [variants, parts] = await Promise.all([
    variantIds.length > 0 ? getMarketPricesForVariants(variantIds) : {},
    partIds.length > 0 ? getMarketPricesForParts(partIds) : {},
  ]);

  return NextResponse.json(
    { variants, parts },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    },
  );
}
