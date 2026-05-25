import { StarRating } from "@/components/ratings/star-rating";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

type RatingItem = {
  id: string;
  score: number;
  comment: string | null;
  createdAt: Date;
  raterId: string;
  raterName: string;
  listing: { id: string; customTitle: string | null; type: string } | null;
};

type Props = {
  ratings: RatingItem[];
};

const TYPE_LABEL: Record<string, string> = {
  sell: "出售",
  want: "徵求",
  trade: "交換",
};

export function RatingList({ ratings }: Props) {
  if (ratings.length === 0) return null;

  return (
    <ul className="space-y-3">
      {ratings.map((r) => (
        <li key={r.id} className="bey-card p-4 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <StarRating value={r.score} readonly size="sm" />
              <span className="text-sm font-medium">{r.raterName}</span>
            </div>
            <span className="text-xs text-zinc-500">
              {formatDate(r.createdAt.toISOString())}
            </span>
          </div>
          {r.comment && (
            <p className="text-sm text-zinc-700 dark:text-zinc-300">{r.comment}</p>
          )}
          {r.listing && (
            <p className="text-xs text-zinc-500">
              {TYPE_LABEL[r.listing.type] ?? r.listing.type} ·{" "}
              <Link href={`/listings/${r.listing.id}`} className="underline">
                {r.listing.customTitle ?? "查看刊登"}
              </Link>
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
