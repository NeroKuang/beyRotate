import Link from "next/link";
import { ProductImage } from "@/components/ui/product-image";
import { slotLabel } from "@/lib/catalog/part-groups";
import { resolveItemImageUrl } from "@/lib/listing-images";
import { listingItemAmountLabel } from "@/lib/listing-price";
import { listingItemDisplayLabel } from "@/lib/listing-item-label";
import { BeyEmptyState } from "@/components/layout/bey-empty-state";
import type { ListingItem, ListingWithRelations } from "@/types/database";

const ROLE_LABEL: Record<string, string> = {
  offer: "提供",
  seek: "想要",
};

function SpecRow({ label, value }: { label: string; value?: string | null }) {
  if (!value?.trim()) return null;
  return (
    <div className="grid grid-cols-[5.5rem_1fr] gap-x-3 gap-y-0.5 text-sm">
      <dt className="text-zinc-500">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function ItemCard({
  listing,
  item,
}: {
  listing: ListingWithRelations;
  item: ListingItem;
}) {
  const label = listingItemDisplayLabel(item);
  const amount = listingItemAmountLabel(listing, item);
  const imageUrl = resolveItemImageUrl(item);
  const v = item.catalog_variants;
  const p = item.catalog_parts;
  const productCode =
    v?.catalog_products?.code ?? v?.code ?? item.source_product_code ?? null;

  return (
    <article className="rounded-lg border border-sky-100 bg-white/80 p-4 dark:border-indigo-900/40 dark:bg-slate-950/50">
      <div className="flex gap-4">
        <ProductImage
          src={imageUrl}
          alt={label ?? ""}
          containerClassName="h-20 w-20 shrink-0 rounded-lg"
        />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-sky-600 dark:text-sky-400">
            {ROLE_LABEL[item.role] ?? item.role}
            {item.quantity > 1 && (
              <span className="ml-1.5 rounded bg-sky-100 px-1.5 py-0.5 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300">
                ×{item.quantity}
              </span>
            )}
            {amount && (
              <span className="ml-2 font-semibold text-emerald-700 dark:text-emerald-400">
                {amount}
              </span>
            )}
          </p>
          <h3 className="mt-0.5 font-medium leading-snug">
            {label ?? (item.seek_text ? item.seek_text : "未命名品項")}
          </h3>
          {productCode && (
            <Link
              href={`/catalog?q=${encodeURIComponent(productCode)}#${productCode}`}
              className="mt-1 inline-block font-mono text-xs text-zinc-500 underline"
            >
              查看目錄 {productCode}
            </Link>
          )}
        </div>
      </div>

      {v && (
        <dl className="mt-4 space-y-1.5 border-t border-zinc-100 pt-3 dark:border-zinc-800">
          <SpecRow label="品項編號" value={v.code ?? v.catalog_products?.code} />
          <SpecRow label="包裝" value={v.package_label_zh} />
          <SpecRow label="組裝代碼" value={v.build_string} />
          <SpecRow label="刃／戰刃" value={v.blade_name_zh} />
          <SpecRow label="核輪" value={v.ratchet_name_zh} />
          <SpecRow label="軸心" value={v.bit_name_zh} />
          <SpecRow label="塗裝" value={v.coat} />
        </dl>
      )}

      {p && (
        <dl className="mt-4 space-y-1.5 border-t border-zinc-100 pt-3 dark:border-zinc-800">
          <SpecRow
            label="零件類型"
            value={slotLabel(p.part_type, p.part_group ?? "")}
          />
          <SpecRow label="代號" value={p.abbr} />
          <SpecRow label="名稱" value={p.name_zh} />
          {item.source_product_code && (
            <SpecRow label="來源產品" value={item.source_product_code} />
          )}
          {item.source_part_spec && (
            <SpecRow label="規格" value={item.source_part_spec} />
          )}
        </dl>
      )}

      {!v && !p && item.seek_text && (
        <p className="mt-3 border-t border-zinc-100 pt-3 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
          {item.seek_text}
        </p>
      )}
    </article>
  );
}

export function ListingItemDetails({
  listing,
}: {
  listing: ListingWithRelations;
}) {
  const items = listing.listing_items ?? [];
  const offerItems = items.filter((i) => i.role === "offer");
  const seekItems = items.filter((i) => i.role === "seek");

  if (items.length === 0) {
    return (
      <section className="mt-6">
        <BeyEmptyState
          title="尚未關聯產品"
          description="此刊登尚未關聯產品目錄品項。若為刊登者，可編輯刊登並選擇品項。"
          action={{ href: `/listings/${listing.id}/edit`, label: "編輯刊登" }}
        />
      </section>
    );
  }

  return (
    <section className="mt-6 space-y-4">
      <h2 className="font-bold">產品明細</h2>
      {offerItems.length > 0 && (
        <div className="space-y-3">
          {offerItems.length > 1 && (
            <p className="text-xs text-zinc-500">提供 {offerItems.length} 項</p>
          )}
          {offerItems.map((item) => (
            <ItemCard key={item.id} listing={listing} item={item} />
          ))}
        </div>
      )}
      {seekItems.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs text-zinc-500">想要</p>
          {seekItems.map((item) => (
            <ItemCard key={item.id} listing={listing} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}
