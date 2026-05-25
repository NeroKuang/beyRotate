"use client";

import { useState } from "react";
import {
  CatalogProductSearch,
  type CatalogSuggestion,
} from "@/components/catalog/catalog-product-search";
import { Input, Label } from "@/components/ui/input";

type SelectedVariant = CatalogSuggestion & { amount: string; qty: string };

type Props = {
  category: string;
  name?: string;
  label: string;
  required?: boolean;
  listingType?: "sell" | "want" | "trade";
  initialSelected?: CatalogSuggestion[];
};

export function MultiVariantPicker({
  category,
  name = "variant_ids",
  label,
  required,
  listingType = "sell",
  initialSelected,
}: Props) {
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<SelectedVariant[]>(
    () => initialSelected?.map((s) => ({ ...s, amount: "", qty: "1" })) ?? []
  );

  const showAmount = listingType === "sell" || listingType === "want";
  const amountLabel = listingType === "want" ? "預算（TWD）" : "標價（TWD）";

  const addItem = (item: CatalogSuggestion) => {
    setSelected((prev) =>
      prev.some((s) => s.id === item.id)
        ? prev
        : [...prev, { ...item, amount: "", qty: "1" }]
    );
  };

  const removeItem = (id: string) => {
    setSelected((prev) => prev.filter((s) => s.id !== id));
  };

  const updateField = (id: string, field: "amount" | "qty", value: string) => {
    setSelected((prev) =>
      prev.map((v) => (v.id === id ? { ...v, [field]: value } : v))
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
              <div className={`grid gap-2 ${showAmount ? "sm:grid-cols-2" : ""}`}>
                <div>
                  <label className="text-xs text-zinc-500">數量</label>
                  <Input
                    type="number"
                    min={1}
                    max={999}
                    required
                    value={v.qty}
                    onChange={(e) => updateField(v.id, "qty", e.target.value)}
                    className="mt-0.5"
                  />
                </div>
                {showAmount && (
                  <div>
                    <label className="text-xs text-zinc-500">{amountLabel}（單件）</label>
                    <Input
                      type="number"
                      min={1}
                      max={999999}
                      required
                      value={v.amount}
                      onChange={(e) => updateField(v.id, "amount", e.target.value)}
                      placeholder="必填"
                      className="mt-0.5"
                    />
                  </div>
                )}
              </div>
              <input type="hidden" name={name} value={v.id} />
              <input type="hidden" name="variant_quantities" value={v.qty || "1"} />
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
