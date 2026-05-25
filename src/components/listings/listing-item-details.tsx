"use client";

import { useState } from "react";
import Link from "next/link";
import { ProductImage } from "@/components/ui/product-image";
import { slotLabel } from "@/lib/catalog/part-groups";
import { stadiumTypeLabel } from "@/lib/constants";
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

function ItemSpecs({ item }: { item: ListingItem }) {
  const v = item.catalog_variants;
  const p = item.catalog_parts;

  if (v) {
    return (
      <dl className="space-y-1 py-2">
        <SpecRow label="品項編號" value={v.code ?? v.catalog_products?.code} />
        <SpecRow label="包裝" value={v.package_label_zh} />
        <SpecRow label="組裝代碼" value={v.build_string} />
        <SpecRow label="刃／戰刃" value={v.blade_name_zh} />
        <SpecRow label="核輪" value={v.ratchet_name_zh} />
        <SpecRow label="軸心" value={v.bit_name_zh} />
        <SpecRow label="塗裝" value={v.coat} />
      </dl>
    );
  }

  if (p) {
    return (
      <dl className="space-y-1 py-2">
        <SpecRow label="零件類型" value={slotLabel(p.part_type, p.part_group ?? "")} />
        <SpecRow label="代號" value={p.abbr} />
        <SpecRow label="名稱" value={p.name_zh} />
        {item.source_product_code && <SpecRow label="來源產品" value={item.source_product_code} />}
        {item.source_part_spec && <SpecRow label="規格" value={item.source_part_spec} />}
      </dl>
    );
  }

  if (item.item_kind === "stadium" && item.seek_text) {
    return (
      <dl className="space-y-1 py-2">
        <SpecRow label="類型" value="戰鬥盤" />
        <SpecRow label="種類" value={stadiumTypeLabel(item.seek_text) ?? item.seek_text} />
      </dl>
    );
  }

  return null;
}

function CompactItemRow({
  listing,
  item,
  index,
}: {
  listing: ListingWithRelations;
  item: ListingItem;
  index: number;
}) {
  const [open, setOpen] = useState(false);
  const label = listingItemDisplayLabel(item);
  const amount = listingItemAmountLabel(listing, item);
  const imageUrl = resolveItemImageUrl(item);
  const qty = item.quantity ?? 1;
  const unitPrice = item.price ?? item.budget ?? 0;
  const hasSpecs = !!(item.catalog_variants || item.catalog_parts || (item.item_kind === "stadium" && item.seek_text));
  const productCode =
    item.catalog_variants?.catalog_products?.code ??
    item.catalog_variants?.code ??
    item.source_product_code ??
    null;

  return (
    <li className="border-b border-zinc-100 last:border-0 dark:border-zinc-800">
      <button
        type="button"
        onClick={() => hasSpecs && setOpen(!open)}
        className={`flex w-full items-center gap-3 py-3 text-left ${hasSpecs ? "cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50" : ""} transition-colors`}
      >
        <span className="w-5 shrink-0 text-center text-xs text-zinc-400">{index + 1}</span>
        <ProductImage
          src={imageUrl}
          alt={label ?? ""}
          containerClassName="h-12 w-12 shrink-0 rounded-lg"
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium leading-snug truncate">
            {label ?? "未命名品項"}
          </p>
          {productCode && (
            <p className="text-xs text-zinc-400 font-mono">{productCode}</p>
          )}
        </div>
        <div className="shrink-0 text-right">
          <span className={`inline-block rounded px-1.5 py-0.5 text-xs ${
            qty > 1
              ? "bg-sky-100 font-semibold text-sky-700 dark:bg-sky-900/40 dark:text-sky-300"
              : "text-zinc-500"
          }`}>
            ×{qty}
          </span>
        </div>
        {amount && (
          <div className="shrink-0 text-right min-w-[5rem]">
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">{amount}</p>
            {qty > 1 && unitPrice > 0 && (
              <p className="text-[10px] text-zinc-400">共 {unitPrice * qty} TWD</p>
            )}
          </div>
        )}
        {hasSpecs && (
          <svg
            className={`h-4 w-4 shrink-0 text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>
      {open && (
        <div className="pb-3 pl-[4.5rem] pr-3">
          <ItemSpecs item={item} />
          {productCode && (
            <Link
              href={`/catalog?q=${encodeURIComponent(productCode)}#${productCode}`}
              className="inline-block text-xs text-zinc-500 underline"
            >
              查看目錄 {productCode}
            </Link>
          )}
        </div>
      )}
    </li>
  );
}

function FullItemCard({
  listing,
  item,
}: {
  listing: ListingWithRelations;
  item: ListingItem;
}) {
  const label = listingItemDisplayLabel(item);
  const amount = listingItemAmountLabel(listing, item);
  const imageUrl = resolveItemImageUrl(item);
  const qty = item.quantity ?? 1;
  const unitPrice = item.price ?? item.budget ?? 0;
  const productCode =
    item.catalog_variants?.catalog_products?.code ??
    item.catalog_variants?.code ??
    item.source_product_code ??
    null;

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
            <span className={`ml-1.5 rounded px-1.5 py-0.5 ${
              qty > 1
                ? "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300 font-semibold"
                : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
            }`}>
              ×{qty}
            </span>
            {amount && (
              <span className="ml-2 font-semibold text-emerald-700 dark:text-emerald-400">
                {amount}
                {qty > 1 && unitPrice > 0 && (
                  <span className="ml-1 font-normal text-zinc-500">
                    （共 {unitPrice * qty} TWD）
                  </span>
                )}
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
      <div className="mt-4 border-t border-zinc-100 pt-3 dark:border-zinc-800">
        <ItemSpecs item={item} />
      </div>
      {!item.catalog_variants && !item.catalog_parts && item.item_kind !== "stadium" && item.seek_text && (
        <p className="mt-3 border-t border-zinc-100 pt-3 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
          {item.seek_text}
        </p>
      )}
    </article>
  );
}

function ItemSection({
  listing,
  items,
  roleLabel,
}: {
  listing: ListingWithRelations;
  items: ListingItem[];
  roleLabel: string;
}) {
  if (items.length === 0) return null;

  if (items.length === 1) {
    return (
      <div className="space-y-2">
        <FullItemCard listing={listing} item={items[0]} />
      </div>
    );
  }

  const totalQty = items.reduce((sum, i) => sum + (i.quantity ?? 1), 0);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs text-zinc-500">{roleLabel} {items.length} 種品項</p>
        <p className="text-xs text-zinc-400">共 {totalQty} 件</p>
      </div>
      <div className="rounded-lg border border-sky-100 bg-white/80 dark:border-indigo-900/40 dark:bg-slate-950/50">
        <ul className="divide-y-0 px-2">
          {items.map((item, i) => (
            <CompactItemRow key={item.id} listing={listing} item={item} index={i} />
          ))}
        </ul>
      </div>
    </div>
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
      <ItemSection listing={listing} items={offerItems} roleLabel="提供" />
      <ItemSection listing={listing} items={seekItems} roleLabel="想要" />
    </section>
  );
}
