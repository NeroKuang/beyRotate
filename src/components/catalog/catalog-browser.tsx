"use client";

import { useCallback, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { CodeIndex } from "@/components/catalog/code-index";
import { ProductGroups } from "@/components/catalog/product-groups";
import { SeriesTabs, type SeriesTab } from "@/components/catalog/series-tabs";
import { BeyEmptyState } from "@/components/layout/bey-empty-state";
import type { CatalogGroupDto } from "@/lib/catalog/types";
import type { MarketPriceStats } from "@/lib/catalog/market-prices";

type Props = {
  initialCategory: string;
  initialQ: string;
};

type Stats = {
  productCount: number;
  variantCount: number;
  lastSynced?: Record<string, unknown> | null;
};

export function CatalogBrowser({ initialCategory, initialQ }: Props) {
  const [category, setCategory] = useState(initialCategory);
  const [series, setSeries] = useState("all");
  const [q, setQ] = useState(initialQ);
  const [groups, setGroups] = useState<CatalogGroupDto[]>([]);
  const [codes, setCodes] = useState<string[]>([]);
  const [seriesTabs, setSeriesTabs] = useState<SeriesTab[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [marketPrices, setMarketPrices] = useState<Record<string, MarketPriceStats>>({});
  const [loading, setLoading] = useState(false);

  const loadMarketPrices = useCallback(async (variantIds: string[]) => {
    if (variantIds.length === 0) {
      setMarketPrices({});
      return;
    }
    try {
      const chunkSize = 200;
      const merged: Record<string, MarketPriceStats> = {};
      for (let i = 0; i < variantIds.length; i += chunkSize) {
        const chunk = variantIds.slice(i, i + chunkSize);
        const res = await fetch(
          `/api/catalog/market-prices?variant_ids=${chunk.join(",")}`,
        );
        const data = await res.json();
        Object.assign(merged, data.variants ?? {});
      }
      setMarketPrices(merged);
    } catch {
      setMarketPrices({});
    }
  }, []);

  const loadGroups = useCallback(async (cat: string, ser: string, query: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ category: cat });
      if (query.trim()) params.set("q", query.trim());
      if (ser !== "all") params.set("series", ser);

      const codesParams = new URLSearchParams({ category: cat });
      if (ser !== "all") codesParams.set("series", ser);

      const [groupsRes, codesRes, statsRes, seriesRes] = await Promise.all([
        fetch(`/api/catalog/groups?${params}`),
        fetch(`/api/catalog/codes?${codesParams}`),
        fetch(
          `/api/catalog/stats?category=${encodeURIComponent(cat)}${ser !== "all" ? `&series=${encodeURIComponent(ser)}` : ""}`
        ),
        cat === "bey"
          ? fetch(`/api/catalog/series?category=bey`)
          : Promise.resolve(null),
      ]);

      const groupsData = await groupsRes.json();
      const codesData = await codesRes.json();
      const statsData = await statsRes.json();
      const nextGroups: CatalogGroupDto[] = groupsData.groups ?? [];
      setGroups(nextGroups);
      setCodes(codesData.codes ?? []);
      setStats(statsData);

      const variantIds = nextGroups.flatMap((g) => g.variants.map((v) => v.id));
      void loadMarketPrices(variantIds);

      if (seriesRes) {
        const seriesData = await seriesRes.json();
        const tabs: SeriesTab[] = [
          {
            id: "all",
            label: "全部系列",
            short: "全部",
            count: seriesData.total ?? 0,
          },
          ...(seriesData.series ?? []).map(
            (s: { id: string; label: string; short: string; count: number }) => ({
              id: s.id,
              label: s.label,
              short: s.short,
              count: s.count,
            })
          ),
        ];
        setSeriesTabs(tabs);
      } else {
        setSeriesTabs([]);
        setSeries("all");
      }
    } catch {
      setGroups([]);
      setCodes([]);
      setStats(null);
      setSeriesTabs([]);
    } finally {
      setLoading(false);
    }
  }, [loadMarketPrices]);

  useEffect(() => {
    if (category !== "bey") setSeries("all");
  }, [category]);

  useEffect(() => {
    // 有搜尋關鍵字時不分系列，直接全庫搜
    const effectiveSeries = q.trim() ? "all" : series;
    const t = setTimeout(() => loadGroups(category, effectiveSeries, q), q ? 250 : 0);
    return () => clearTimeout(t);
  }, [category, series, q, loadGroups]);

  const last = stats?.lastSynced;

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-4 items-end">
        <Input
          name="q"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="搜尋編號或中文（CX-11、帝皇、4-60…）全系列"
          className="flex-1 min-w-[200px]"
          autoComplete="off"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="bey-input h-10 w-auto"
          aria-label="產品大類"
        >
          <option value="bey">陀螺</option>
          <option value="launcher">發射器</option>
          <option value="keihin">景品／限定</option>
          <option value="other">其他</option>
        </select>
        <button
          type="button"
          onClick={() => loadGroups(category, series, q)}
          className="rounded-lg bg-zinc-900 text-white px-4 py-2 text-sm h-10"
        >
          重新整理
        </button>
      </div>

      {category === "bey" && seriesTabs.length > 0 && (
        <SeriesTabs tabs={seriesTabs} active={series} onChange={setSeries} />
      )}

      {stats && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
          {category === "bey" && series !== "all" ? (
            <>
              目前系列共 <strong>{stats.productCount}</strong> 個編號、
              <strong> {stats.variantCount}</strong> 種品項
            </>
          ) : (
            <>
              共 <strong>{stats.productCount}</strong> 個產品編號、
              <strong> {stats.variantCount}</strong> 種品項
            </>
          )}
          {category === "bey" && last?.sourceBeyCodes != null && series === "all" && (
            <>
              {" "}
              （BX / CX / UX / BXG / BXA 海外 / BXC 聯名 / BXH 非賣品，與 go-shoot{" "}
              {String(last.sourceBeyCodes)} 個編號對齊）
            </>
          )}
        </p>
      )}

      {!q.trim() && codes.length > 0 && (
        <CodeIndex codes={codes} onPick={(code) => setQ(code)} />
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <span className="mr-2 inline-block h-5 w-5 animate-spin rounded-full border-2 border-sky-600 border-t-transparent" />
          <span className="text-sm text-zinc-500">載入中…</span>
        </div>
      ) : groups.length === 0 ? (
        <BeyEmptyState
          title="此系列尚無資料"
          description="目錄尚未同步，請聯繫管理員執行同步。"
        />
      ) : (
        <ProductGroups
          groups={groups}
          showSeriesBadge={series === "all"}
          marketPrices={marketPrices}
        />
      )}
    </>
  );
}
