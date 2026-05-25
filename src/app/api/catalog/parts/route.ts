import { searchCatalogParts } from "@/lib/catalog/search-parts";
import { ALL_PART_SLOTS } from "@/lib/catalog/part-groups";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();
  const partType = searchParams.get("part_type") ?? undefined;
  const partGroup = searchParams.has("part_group")
    ? searchParams.get("part_group") ?? ""
    : undefined;
  const slotLabel = searchParams.get("slot_label") ?? undefined;
  const limit = Math.min(Number(searchParams.get("limit") ?? 25), 40);

  const slot =
    slotLabel != null
      ? ALL_PART_SLOTS.find((s) => s.label === slotLabel)
      : undefined;

  const parts = await searchCatalogParts(q, {
    slot,
    partType,
    partGroup,
    limit: q ? limit : Math.min(limit, 30),
  });
  return NextResponse.json({ parts });
}
