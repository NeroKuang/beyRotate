"use client";

import { useCallback, useEffect, useState } from "react";
import { ProductImage } from "@/components/ui/product-image";
import { Input } from "@/components/ui/input";

export type CatalogSuggestion = {
  id: string;
  display_label: string;
  image_url?: string | null;
  catalog_products?: { code: string; category_id: string };
};

type Props = {
  category: string;
  value: string;
  onQueryChange: (q: string) => void;
  onSelect?: (item: CatalogSuggestion) => void;
  placeholder?: string;
  /** 選取後是否清空搜尋框（刊登多選時用） */
  clearOnSelect?: boolean;
};

export function CatalogProductSearch({
  category,
  value,
  onQueryChange,
  onSelect,
  placeholder = "搜尋 BX-01、CX-11、帝皇、4-60…（全系列）",
  clearOnSelect = false,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<CatalogSuggestion[]>([]);

  const fetchResults = useCallback(
    async (q: string) => {
      if (q.length < 1) {
        setItems([]);
        return;
      }
      setLoading(true);
      try {
        const params = new URLSearchParams({
          category,
          q,
          limit: "30",
        });
        const res = await fetch(`/api/catalog/variants?${params}`);
        const data = await res.json();
        setItems(data.variants ?? []);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    },
    [category]
  );

  useEffect(() => {
    const t = setTimeout(() => fetchResults(value.trim()), 250);
    return () => clearTimeout(t);
  }, [value, fetchResults]);

  const pick = (item: CatalogSuggestion) => {
    onSelect?.(item);
    if (clearOnSelect) onQueryChange("");
    else onQueryChange(item.catalog_products?.code ?? item.display_label);
    setItems([]);
  };

  return (
    <div className="space-y-2">
      <Input
        value={value}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
      />
      {loading && <p className="text-xs text-zinc-400">搜尋中…</p>}
      {!loading && value.trim() && items.length === 0 && (
        <p className="text-xs text-zinc-500">沒有符合的品項，請換關鍵字</p>
      )}
      {items.length > 0 && (
        <ul className="rounded-lg border border-zinc-200 dark:border-zinc-700 divide-y max-h-64 overflow-y-auto">
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => pick(item)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900 flex gap-3 items-center"
              >
                <ProductImage
                  src={item.image_url}
                  alt={item.display_label}
                  containerClassName="shrink-0 w-12 h-12 rounded-lg bg-zinc-100 dark:bg-zinc-800"
                />
                <div className="min-w-0 flex-1">
                  <span className="font-mono text-xs text-zinc-500">
                    {item.catalog_products?.code}
                  </span>
                  <div className="font-medium truncate">{item.display_label}</div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
