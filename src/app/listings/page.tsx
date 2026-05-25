import Link from "next/link";
import { ListingCard } from "@/components/listings/listing-card";
import { BeyHeroBanner } from "@/components/layout/bey-hero-banner";
import { BeyEmptyState } from "@/components/layout/bey-empty-state";
import { sortListings, type SortMode } from "@/lib/listing-sort";
import { LISTING_TYPES, PAGE_SIZE } from "@/lib/constants";
import { fetchPublicListings } from "@/lib/queries/listings";

export const revalidate = 60;

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<{
    type?: string;
    sort?: string;
    q?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const sort = (["hot", "newest", "price"].includes(params.sort ?? "")
    ? params.sort
    : "hot") as SortMode;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);

  let items = await fetchPublicListings({ limit: 200 });
  if (params.type && ["sell", "want", "trade"].includes(params.type)) {
    items = items.filter((l) => l.type === params.type);
  }

  if (params.q?.trim()) {
    const q = params.q.trim().toLowerCase();
    items = items.filter((l) => {
      const title = (l.custom_title ?? "").toLowerCase();
      const note = (l.note ?? "").toLowerCase();
      const region = (l.region ?? "").toLowerCase();
      const name = (l.profiles?.display_name ?? "").toLowerCase();
      const codes =
        l.listing_items
          ?.map((i) => i.catalog_variants?.catalog_products?.code?.toLowerCase() ?? "")
          .join(" ") ?? "";
      const seek = l.listing_items?.find((i) => i.seek_text)?.seek_text ?? "";
      return (
        title.includes(q) ||
        note.includes(q) ||
        region.includes(q) ||
        name.includes(q) ||
        codes.includes(q) ||
        seek.toLowerCase().includes(q)
      );
    });
  }

  items = sortListings(items, sort);
  const total = items.length;
  const pageItems = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(total / PAGE_SIZE) || 1;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <BeyHeroBanner
        title="市集"
        description="搜尋出售、徵求或交換刊登。依熱度、最新或價格排序。"
      />
      <form className="bey-card mb-6 flex flex-wrap gap-2 p-4" method="get">
        <input
          name="q"
          defaultValue={params.q}
          placeholder="搜尋產品碼、備註、地區、暱稱…"
          className="bey-input min-w-[200px] flex-1"
        />
        <select
          name="type"
          defaultValue={params.type}
          className="bey-input w-auto"
        >
          <option value="">全部類型</option>
          {LISTING_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <select
          name="sort"
          defaultValue={sort}
          className="bey-input w-auto"
        >
          <option value="hot">熱度</option>
          <option value="newest">最新</option>
          <option value="price">價格</option>
        </select>
        <button type="submit" className="bey-btn-primary">
          搜尋
        </button>
      </form>
      <p className="mb-4 text-sm text-zinc-500">共 {total} 則</p>
      {pageItems.length === 0 ? (
        <BeyEmptyState
          title="沒有符合的刊登"
          description="試試調整關鍵字或篩選條件，或自己刊登一則。"
          action={{ href: "/listings/new", label: "我要刊登" }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pageItems.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      )}
      {totalPages > 1 && (
        <div className="flex gap-2 mt-8 justify-center">
          {page > 1 && (
            <Link href={buildUrl(params, page - 1)} className="bey-btn-secondary px-3 py-1 text-sm">
              上一頁
            </Link>
          )}
          <span className="self-center text-sm text-zinc-500">
            {page} / {totalPages}
          </span>
          {page < totalPages && (
            <Link href={buildUrl(params, page + 1)} className="bey-btn-secondary px-3 py-1 text-sm">
              下一頁
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

function buildUrl(
  params: { type?: string; sort?: string; q?: string },
  page: number
) {
  const sp = new URLSearchParams();
  if (params.q) sp.set("q", params.q);
  if (params.type) sp.set("type", params.type);
  if (params.sort) sp.set("sort", params.sort);
  sp.set("page", String(page));
  return `/listings?${sp.toString()}`;
}
