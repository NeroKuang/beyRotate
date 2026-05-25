"use client";

import type { ProductSeriesId } from "@/lib/catalog/series";

export type SeriesTab = {
  id: ProductSeriesId | "all";
  label: string;
  short: string;
  count: number;
};

export function SeriesTabs({
  tabs,
  active,
  onChange,
}: {
  tabs: SeriesTab[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="產品系列">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={active === tab.id}
          onClick={() => onChange(tab.id)}
          className={`rounded-full px-3 py-1.5 text-sm border transition-colors ${
            active === tab.id
              ? "bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900"
              : "border-zinc-300 dark:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          }`}
        >
          <span className="font-medium">{tab.label}</span>
          <span className="ml-1.5 text-xs opacity-80">({tab.count})</span>
        </button>
      ))}
    </div>
  );
}
