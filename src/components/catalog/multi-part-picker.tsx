"use client";

import { useState } from "react";
import {
  CatalogPartSearch,
  type PartSuggestion,
} from "@/components/catalog/catalog-part-search";
import { Input, Label } from "@/components/ui/input";
import { ALL_PART_SLOTS, slotLabel, type PartSlot } from "@/lib/catalog/part-groups";

export type SelectedPartEntry = PartSuggestion & {
  sourceProductCode: string;
  sourcePartSpec: string;
  amount: string;
  qty: string;
};

type Props = {
  name?: string;
  label: string;
  required?: boolean;
  listingType?: "sell" | "want" | "trade";
};

function slotKey(slot: PartSlot) {
  return `${slot.part_type}:${slot.part_group}:${slot.label}`;
}

export function MultiPartPicker({
  name = "part_ids",
  label,
  required,
  listingType = "sell",
}: Props) {
  const [activeSlot, setActiveSlot] = useState<string>("");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<SelectedPartEntry[]>([]);

  const showAmount = listingType === "sell" || listingType === "want";
  const amountLabel = listingType === "want" ? "預算（TWD）" : "標價（TWD）";

  const currentSlot =
    ALL_PART_SLOTS.find((s) => slotKey(s) === activeSlot) ?? null;

  const addItem = (item: PartSuggestion) => {
    setSelected((prev) =>
      prev.some((s) => s.id === item.id)
        ? prev
        : [
            ...prev,
            {
              ...item,
              sourceProductCode: "",
              sourcePartSpec: "",
              amount: "",
              qty: "1",
            },
          ]
    );
  };

  const removeItem = (id: string) => {
    setSelected((prev) => prev.filter((s) => s.id !== id));
  };

  const updateField = (
    id: string,
    field: "sourceProductCode" | "sourcePartSpec" | "amount" | "qty",
    value: string
  ) => {
    setSelected((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const onSlotChange = (key: string) => {
    setActiveSlot(key);
    setQ("");
  };

  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      <p className="text-xs text-zinc-500">
        依部件類型搜尋即可。每件可單獨{listingType === "want" ? "填預算" : "定價"}。
        可選填來源（例：BX-23、9-60）。
      </p>

      <div className="flex flex-wrap gap-2 text-sm">
        <button
          type="button"
          onClick={() => onSlotChange("")}
          className={`px-2 py-1 rounded border ${
            activeSlot === ""
              ? "border-emerald-600 text-emerald-700"
              : "border-zinc-300"
          }`}
        >
          全部部件
        </button>
        {ALL_PART_SLOTS.map((slot) => {
          const key = slotKey(slot);
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSlotChange(key)}
              className={`px-2 py-1 rounded border ${
                activeSlot === key
                  ? "border-emerald-600 text-emerald-700"
                  : "border-zinc-300"
              }`}
            >
              {slot.label}
            </button>
          );
        })}
      </div>

      <CatalogPartSearch
        slot={currentSlot}
        partType={currentSlot?.part_type}
        partGroup={currentSlot?.part_group}
        value={q}
        onQueryChange={setQ}
        onSelect={addItem}
        clearOnSelect
        placeholder={
          currentSlot?.part_type === "ratchet"
            ? "例：7-60、9-60、七刃高度60"
            : currentSlot?.part_type === "bit"
              ? "例：FB、MN、LR"
              : currentSlot?.part_group === "assist"
                ? "例：F、H、K"
                : currentSlot?.label?.includes("BX")
                  ? "例：翔龍突擊、DrSt"
                  : currentSlot
                    ? `搜尋${currentSlot.label}…`
                    : "搜尋零件…"
        }
      />

      {selected.length > 0 && (
        <ul className="space-y-3 rounded-lg border border-zinc-200 dark:border-zinc-700 p-3">
          {selected.map((p, i) => (
            <li
              key={p.id}
              className="space-y-2 text-sm border-b border-zinc-100 dark:border-zinc-800 last:border-0 pb-3 last:pb-0"
            >
              <div className="flex items-start gap-3">
                <span className={`mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold leading-none ${
                  p.part_type === "ratchet"
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                    : p.part_type === "bit"
                      ? "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300"
                      : "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300"
                }`}>
                  {slotLabel(p.part_type, p.part_group)}
                </span>
                <div className="min-w-0 flex-1">
                  <span className="text-xs text-zinc-500">{i + 1}.</span>
                  <div className="font-medium leading-snug">{p.display_label}</div>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(p.id)}
                  className="shrink-0 text-xs text-red-600 hover:underline"
                >
                  移除
                </button>
              </div>
              <div
                className={`grid gap-2 ${showAmount ? "sm:grid-cols-4" : "sm:grid-cols-3"}`}
              >
                <div>
                  <label className="text-xs text-zinc-500">數量</label>
                  <Input
                    type="number"
                    min={1}
                    max={999}
                    required
                    value={p.qty}
                    onChange={(e) =>
                      updateField(p.id, "qty", e.target.value)
                    }
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
                      value={p.amount}
                      onChange={(e) =>
                        updateField(p.id, "amount", e.target.value)
                      }
                      placeholder="必填"
                      className="mt-0.5"
                    />
                  </div>
                )}
                <div>
                  <label className="text-xs text-zinc-500">來源產品編號（選填）</label>
                  <Input
                    value={p.sourceProductCode}
                    onChange={(e) =>
                      updateField(p.id, "sourceProductCode", e.target.value)
                    }
                    placeholder="例：BX-23"
                    className="mt-0.5"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-500">來源規格（選填）</label>
                  <Input
                    value={p.sourcePartSpec}
                    onChange={(e) =>
                      updateField(p.id, "sourcePartSpec", e.target.value)
                    }
                    placeholder="例：9-60"
                    className="mt-0.5"
                  />
                </div>
              </div>
              <input type="hidden" name={name} value={p.id} />
              <input type="hidden" name="part_quantities" value={p.qty || "1"} />
              {showAmount && (
                <input type="hidden" name="part_amounts" value={p.amount} />
              )}
              <input
                type="hidden"
                name="part_source_codes"
                value={p.sourceProductCode}
              />
              <input
                type="hidden"
                name="part_source_specs"
                value={p.sourcePartSpec}
              />
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
