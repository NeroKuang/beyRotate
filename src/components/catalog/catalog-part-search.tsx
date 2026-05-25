"use client";

import { useCallback, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import type { PartSlot } from "@/lib/catalog/part-groups";

export type PartSuggestion = {
  id: string;
  part_type: string;
  abbr: string;
  name_zh: string;
  display_label: string;
  part_group: string;
};

type Props = {
  slot?: PartSlot | null;
  partType?: string;
  partGroup?: string;
  value: string;
  onQueryChange: (q: string) => void;
  onSelect?: (item: PartSuggestion) => void;
  placeholder?: string;
  clearOnSelect?: boolean;
};

export function CatalogPartSearch({
  slot,
  partType,
  partGroup,
  value,
  onQueryChange,
  onSelect,
  placeholder = "搜尋零件名稱、縮寫或規格…",
  clearOnSelect = false,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<PartSuggestion[]>([]);

  const fetchResults = useCallback(
    async (q: string) => {
      const trimmed = q.trim();
      const browse =
        !trimmed && (partType !== undefined || partGroup !== undefined);
      if (!trimmed && !browse) {
        setItems([]);
        return;
      }
      setLoading(true);
      try {
        const params = new URLSearchParams({ limit: "20" });
        if (trimmed) params.set("q", trimmed);
        if (partType) params.set("part_type", partType);
        if (partGroup !== undefined) params.set("part_group", partGroup);
        if (slot?.label) params.set("slot_label", slot.label);
        const res = await fetch(`/api/catalog/parts?${params}`);
        if (!res.ok) throw new Error("search failed");
        const data = await res.json();
        setItems(data.parts ?? []);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    },
    [partType, partGroup, slot?.label]
  );

  useEffect(() => {
    const t = setTimeout(() => fetchResults(value.trim()), 250);
    return () => clearTimeout(t);
  }, [value, fetchResults, partType, partGroup, slot?.label]);

  const pick = (item: PartSuggestion) => {
    onSelect?.(item);
    if (clearOnSelect) onQueryChange("");
    else onQueryChange(item.name_zh || item.abbr);
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
      {!loading &&
        (value.trim() || partType !== undefined || partGroup !== undefined) &&
        items.length === 0 && (
          <p className="text-xs text-zinc-500">
            沒有符合的零件。請換關鍵字，或確認已執行{" "}
            <code className="text-xs">npm run sync:parts</code>
          </p>
        )}
      {!loading && !value.trim() && items.length > 0 && (
        <p className="text-xs text-zinc-400">點選下方列表加入，或輸入關鍵字縮小範圍</p>
      )}
      {items.length > 0 && (
        <ul className="rounded-lg border border-zinc-200 dark:border-zinc-700 divide-y max-h-64 overflow-y-auto">
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => pick(item)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900"
              >
                <div className="font-medium">{item.display_label}</div>
                {item.abbr &&
                  item.part_group === "assist" &&
                  item.abbr !== item.name_zh && (
                    <span className="text-xs text-zinc-500 font-mono">{item.abbr}</span>
                  )}
                {item.abbr &&
                  item.part_type === "bit" &&
                  item.abbr !== item.name_zh && (
                    <span className="text-xs text-zinc-500 font-mono">{item.abbr}</span>
                  )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
