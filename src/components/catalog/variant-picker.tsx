"use client";

import { useState } from "react";
import {
  CatalogProductSearch,
  type CatalogSuggestion,
} from "@/components/catalog/catalog-product-search";
import { Label } from "@/components/ui/input";

type Props = {
  category: string;
  name: string;
  label: string;
  required?: boolean;
};

export function VariantPicker({ category, name, label, required }: Props) {
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<CatalogSuggestion | null>(null);

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <CatalogProductSearch
        category={category}
        value={q}
        onQueryChange={(next) => {
          setQ(next);
          if (!next.trim()) setSelected(null);
        }}
        onSelect={(item) => {
          setSelected(item);
          setQ(item.display_label);
        }}
        placeholder="輸入 BX-01、CX-08 或中文名稱，點選下方結果"
      />
      {selected && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400 rounded-lg bg-zinc-50 dark:bg-zinc-900 px-3 py-2">
          已選：<span className="font-mono font-medium">{selected.catalog_products?.code}</span>
          {" — "}
          {selected.display_label}
        </p>
      )}
      <input type="hidden" name={name} value={selected?.id ?? ""} required={required} />
    </div>
  );
}
