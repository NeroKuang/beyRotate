import Link from "next/link";
import { ListingCard } from "@/components/listings/listing-card";
import { BeyHeroBanner } from "@/components/layout/bey-hero-banner";
import { BeyEmptyState } from "@/components/layout/bey-empty-state";
import { sortListings } from "@/lib/listing-sort";
import { LISTING_TYPES } from "@/lib/constants";
import { fetchPublicListings } from "@/lib/queries/listings";

export const revalidate = 60;

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const params = await searchParams;
  const listings = await fetchPublicListings({
    type: params.type,
    limit: 36,
  });
  const sorted = sortListings(listings, "hot");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <BeyHeroBanner
        title="戰鬥陀螺 X 交易平台"
        description="刊登出售、徵求或交換。平台不代收代付，請透過站內私訊或賣家提供的方式聯絡。"
      >
        <div className="flex flex-wrap gap-2">
          <Link href="/listings" className="bey-btn-primary">
            瀏覽市集
          </Link>
          <Link href="/listings/new" className="bey-btn-secondary">
            我要刊登
          </Link>
          <Link href="/catalog" className="bey-btn-secondary">
            產品目錄
          </Link>
        </div>
      </BeyHeroBanner>

      <div className="flex gap-2 mb-4 flex-wrap">
        <FilterChip href="/" label="全部" active={!params.type} />
        {LISTING_TYPES.map((t) => (
          <FilterChip
            key={t.value}
            href={`/?type=${t.value}`}
            label={t.label}
            active={params.type === t.value}
          />
        ))}
      </div>

      {sorted.length === 0 ? (
        <BeyEmptyState
          title="尚無刊登"
          description="成為第一個賣家，讓社群開始交易吧。"
          action={{ href: "/listings/new", label: "建立刊登" }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={active ? "bey-chip-active" : "bey-chip-inactive"}
    >
      {label}
    </Link>
  );
}
