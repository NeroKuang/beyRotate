import Link from "next/link";
import { goShootProductImageUrl } from "@/lib/go-shoot-product-images";
import { ProductImage } from "@/components/ui/product-image";
import { MarketPriceCell } from "@/components/catalog/market-price-cell";
import { EMPTY_MARKET_STATS, type MarketPriceStats } from "@/lib/catalog/market-prices";
import type { CatalogGroupDto } from "@/lib/catalog/types";

export function ProductGroups({
  groups,
  showSeriesBadge = false,
  marketPrices = {},
}: {
  groups: CatalogGroupDto[];
  showSeriesBadge?: boolean;
  marketPrices?: Record<string, MarketPriceStats>;
}) {
  if (groups.length === 0) {
    return (
      <p className="text-zinc-500">
        找不到符合的產品。請換關鍵字或執行{" "}
        <code className="text-xs bg-zinc-100 dark:bg-zinc-800 px-1 rounded">
          npm run sync:catalog
        </code>
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {groups.map((g) => {
        const cover =
          g.variants.find((v) => v.image_url)?.image_url ??
          goShootProductImageUrl(g.code);

        return (
          <section
            key={g.code}
            id={g.code}
            className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden scroll-mt-24"
          >
            <header className="flex flex-wrap items-center gap-4 bg-zinc-50 dark:bg-zinc-900 px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
              <ProductImage
                src={cover}
                alt={g.code}
                containerClassName="w-14 h-14 rounded-lg bg-zinc-100 dark:bg-zinc-800 shrink-0"
              />
              <div className="flex-1 min-w-0">
                {showSeriesBadge && (
                  <span className="inline-block text-xs font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-200/80 dark:bg-zinc-800 px-2 py-0.5 rounded mb-1">
                    {g.series_label}
                  </span>
                )}
                <p className="text-xs text-zinc-500 mb-0.5">產品編號</p>
                <h2 className="font-mono font-bold text-xl tracking-tight">{g.code}</h2>
              </div>
              <span className="text-xs text-zinc-500">{g.variant_count} 種品項</span>
            </header>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b text-zinc-500 bg-white dark:bg-zinc-950">
                    <th className="px-4 py-2 font-medium w-16">圖片</th>
                    <th className="px-4 py-2 font-medium w-28">編號</th>
                    <th className="px-4 py-2 font-medium w-36">包裝</th>
                    <th className="px-4 py-2 font-medium">刃擊環／戰刃</th>
                    <th className="px-4 py-2 font-medium w-32">核輪</th>
                    <th className="px-4 py-2 font-medium w-24">軸心</th>
                    <th className="px-4 py-2 font-medium w-20">塗裝</th>
                    <th className="px-4 py-2 font-medium min-w-[11rem]">市集均價</th>
                    <th className="px-4 py-2 w-16" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {g.variants.map((v) => (
                    <tr key={v.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-900/50">
                      <td className="px-4 py-2 align-top">
                        <ProductImage
                          src={v.image_url}
                          alt={v.display_label}
                          containerClassName="w-12 h-12 rounded-lg bg-zinc-100 dark:bg-zinc-800"
                        />
                      </td>
                      <td className="px-4 py-2 align-top font-mono font-semibold text-zinc-800 dark:text-zinc-200">
                        {v.code}
                      </td>
                      <td className="px-4 py-2 align-top">
                        <div className="font-medium">{v.package_label_zh ?? "—"}</div>
                      </td>
                      <td className="px-4 py-2 align-top">
                        <div>{v.blade_name_zh ?? "—"}</div>
                      </td>
                      <td className="px-4 py-2 align-top">
                        <div>{v.ratchet_name_zh ?? "—"}</div>
                      </td>
                      <td className="px-4 py-2 align-top">
                        <div>{v.bit_name_zh ?? "—"}</div>
                      </td>
                      <td className="px-4 py-2 align-top text-zinc-600">{v.coat ?? "—"}</td>
                      <td className="px-4 py-2 align-top">
                        <MarketPriceCell stats={marketPrices[v.id] ?? EMPTY_MARKET_STATS} />
                      </td>
                      <td className="px-4 py-2 align-top">
                        <Link
                          href={`/listings/new?variant=${v.id}`}
                          className="text-xs underline whitespace-nowrap"
                        >
                          刊登
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}
    </div>
  );
}
