"use client";

import { useState } from "react";
import { Input, Label, Select } from "@/components/ui/input";
import { STADIUM_TYPES } from "@/lib/constants";

type SelectedStadium = {
  type: string;
  label: string;
  qty: string;
  amount: string;
};

type Props = {
  name?: string;
  label: string;
  required?: boolean;
  listingType?: "sell" | "want" | "trade";
};

export function StadiumPicker({
  name = "stadium_types",
  label,
  required,
  listingType = "sell",
}: Props) {
  const [selected, setSelected] = useState<SelectedStadium[]>([]);
  const [addType, setAddType] = useState("");

  const showAmount = listingType === "sell" || listingType === "want";
  const amountLabel = listingType === "want" ? "預算（TWD）" : "標價（TWD）";

  const addItem = () => {
    if (!addType) return;
    const info = STADIUM_TYPES.find((s) => s.value === addType);
    if (!info) return;
    if (selected.some((s) => s.type === addType)) return;
    setSelected((prev) => [...prev, { type: addType, label: info.label, qty: "1", amount: "" }]);
    setAddType("");
  };

  const removeItem = (type: string) => {
    setSelected((prev) => prev.filter((s) => s.type !== type));
  };

  const updateField = (type: string, field: "qty" | "amount", value: string) => {
    setSelected((prev) =>
      prev.map((s) => (s.type === type ? { ...s, [field]: value } : s))
    );
  };

  const availableTypes = STADIUM_TYPES.filter(
    (t) => !selected.some((s) => s.type === t.value)
  );

  return (
    <div className="space-y-3">
      <Label>{label}</Label>

      <div className="flex gap-2">
        <Select
          value={addType}
          onChange={(e) => setAddType(e.target.value)}
          className="flex-1"
        >
          <option value="">— 選擇戰鬥盤類型 —</option>
          {availableTypes.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </Select>
        <button
          type="button"
          onClick={addItem}
          disabled={!addType}
          className="shrink-0 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-40"
        >
          加入
        </button>
      </div>

      {selected.length > 0 && (
        <ul className="space-y-2 rounded-lg border border-zinc-200 dark:border-zinc-700 p-3">
          {selected.map((s, i) => (
            <li
              key={s.type}
              className="space-y-2 text-sm border-b border-zinc-100 dark:border-zinc-800 last:border-0 pb-2 last:pb-0"
            >
              <div className="flex items-center gap-3">
                <span className="shrink-0 rounded bg-orange-100 px-1.5 py-0.5 text-[10px] font-bold text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">
                  戰鬥盤
                </span>
                <div className="min-w-0 flex-1">
                  <span className="text-xs text-zinc-500">{i + 1}.</span>
                  <span className="ml-1 font-medium">{s.label}</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(s.type)}
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
                    max={99}
                    required
                    value={s.qty}
                    onChange={(e) => updateField(s.type, "qty", e.target.value)}
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
                      value={s.amount}
                      onChange={(e) => updateField(s.type, "amount", e.target.value)}
                      placeholder="必填"
                      className="mt-0.5"
                    />
                  </div>
                )}
              </div>
              <input type="hidden" name={name} value={s.type} />
              <input type="hidden" name="stadium_quantities" value={s.qty || "1"} />
              {showAmount && (
                <input type="hidden" name="stadium_amounts" value={s.amount} />
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
