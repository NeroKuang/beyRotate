import { listProductCodes } from "@/lib/catalog/query";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") ?? "bey";
  const series = searchParams.get("series") ?? "all";
  const codes = await listProductCodes(category, series === "all" ? undefined : series);
  return NextResponse.json({ codes, count: codes.length });
}
