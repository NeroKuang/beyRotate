"use client";

import { useState } from "react";
import {
  CatalogProductSearch,
  type CatalogSuggestion,
} from "@/components/catalog/catalog-product-search";
import { Input, Label } from "@/components/ui/input";

type SelectedVariant = CatalogSuggestion & { amount: string };

type Props = {
  category: string;
  name?: string;
  label: string;
  required?: boolean;
  listingType?: "sell" | "want" | "trade";
};

export function MultiVariantPicker({
  category,
  name = "variant_ids",
  label,
  required,
  listingType = "sell",
}: Props) {
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<SelectedVariant[]>([]);

  const showAmount = listingType === "sell" || listingType === "want";
  const amountLabel = listingType === "want" ? "預算（TWD）" : "標價（TWD）";

  const addItem = (item: CatalogSuggestion) => {
    setSelected((prev) =>
      prev.some((s) => s.id === item.id)
        ? prev
        : [...prev, { ...item, amount: "" }]
    );
  };

  const removeItem = (id: string) => {
    setSelected((prev) => prev.filter((s) => s.id !== id));
  };

  const updateAmount = (id: string, value: string) => {
    setSelected((prev) =>
      prev.map((v) => (v.id === id ? { ...v, amount: value } : v))
    );
  };

  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      {showAmount && (
        <p className="text-xs text-zinc-500">每件品項可單獨{listingType === "want" ? "填預算" : "定價"}。</p>
      )}
      <CatalogProductSearch
        category={category}
        value={q}
        onQueryChange={setQ}
        onSelect={addItem}
        clearOnSelect
        placeholder="搜尋後點選結果加入；可重複搜尋加入多件"
      />
      {selected.length > 0 && (
        <ul className="space-y-2 rounded-lg border border-zinc-200 dark:border-zinc-700 p-3">
          {selected.map((v, i) => (
            <li
              key={v.id}
              className="space-y-2 text-sm border-b border-zinc-100 dark:border-zinc-800 last:border-0 pb-2 last:pb-0"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-xs text-zinc-500 font-mono">
                    {i + 1}. {v.catalog_products?.code}
                  </span>
                  <div className="font-medium leading-snug">{v.display_label}</div>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(v.id)}
                  className="shrink-0 text-xs text-red-600 hover:underline"
                >
                  移除
                </button>
              </div>
              {showAmount && (
                <div>
                  <label className="text-xs text-zinc-500">{amountLabel}</label>
                  <Input
                    type="number"
                    min={1}
                    max={999999}
                    required
                    value={v.amount}
                    onChange={(e) => updateAmount(v.id, e.target.value)}
                    placeholder="必填"
                    className="mt-0.5"
                  />
                </div>
              )}
              <input type="hidden" name={name} value={v.id} />
              {showAmount && (
                <input type="hidden" name="variant_amounts" value={v.amount} />
              )}
            </li>
          ))}
        </ul>
      )}
      {required && selected.length === 0 && (
        <input
          tabIndex={-1}
          className="sr-only"
          required
          value=""
          readOnly
          aria-hidden
        />
      )}
    </div>
  );
}
