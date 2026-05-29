import { formatPrice } from "@/lib/utils";
import type { MarketPriceStats } from "@/lib/catalog/market-prices";

function StatLine({
  label,
  avg,
  count,
  min,
  max,
}: {
  label: string;
  avg: number | null;
  count: number;
  min: number | null;
  max: number | null;
}) {
  if (count === 0 || avg == null) {
    return (
      <span className="text-zinc-400">
        {label}：—
      </span>
    );
  }
  const range =
    min != null && max != null && min !== max
      ? ` (${formatPrice(min)}–${formatPrice(max)})`
      : "";
  return (
    <span>
      <span className="text-zinc-500">{label}</span>{" "}
      <span className="font-medium text-emerald-700 dark:text-emerald-400">
        {formatPrice(avg)}
      </span>
      <span className="text-zinc-400">
        {" "}
        · {count} 筆{range}
      </span>
    </span>
  );
}

export function MarketPriceCell({ stats }: { stats: MarketPriceStats }) {
  const hasData = stats.sell_count > 0 || stats.want_count > 0;

  if (!hasData) {
    return <span className="text-xs text-zinc-400">尚無市集報價</span>;
  }

  return (
    <div className="space-y-1 text-xs leading-relaxed min-w-[10rem]">
      <StatLine
        label="出售均價"
        avg={stats.sell_avg}
        count={stats.sell_count}
        min={stats.sell_min}
        max={stats.sell_max}
      />
      <StatLine
        label="徵求均價"
        avg={stats.want_avg}
        count={stats.want_count}
        min={stats.want_min}
        max={stats.want_max}
      />
    </div>
  );
}
