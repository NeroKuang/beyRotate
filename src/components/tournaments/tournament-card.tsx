import Link from "next/link";
import { regionLabel, tournamentFormatLabel } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import type { TournamentRow } from "@/lib/queries/tournaments";

const STATUS_LABEL: Record<string, string> = {
  published: "報名中",
  cancelled: "已取消",
};

export function TournamentCard({ tournament }: { tournament: TournamentRow }) {
  const dateLabel = tournament.ends_at
    ? `${formatDate(tournament.starts_at)} — ${formatDate(tournament.ends_at)}`
    : formatDate(tournament.starts_at);

  return (
    <Link
      href={`/tournaments/${tournament.id}`}
      className="flex gap-4 overflow-hidden rounded-xl border border-sky-200/60 bg-white/95 p-3 transition-shadow hover:shadow-md dark:border-indigo-900/50 dark:bg-slate-900/95"
    >
      <div className="h-24 w-32 shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
        {tournament.poster_path ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={tournament.poster_path}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-zinc-400">
            賽事
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded bg-sky-100 px-1.5 py-0.5 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300">
            {regionLabel(tournament.region)}
          </span>
          {tournament.status === "cancelled" && (
            <span className="rounded bg-zinc-200 px-1.5 py-0.5 text-zinc-600">
              {STATUS_LABEL.cancelled}
            </span>
          )}
          <span className="text-zinc-400">{tournament.interest_count} 人感興趣</span>
        </div>
        <h3 className="font-semibold leading-snug line-clamp-2">{tournament.title}</h3>
        <p className="text-xs text-zinc-500">{dateLabel}</p>
        {tournament.venue && (
          <p className="text-xs text-zinc-500 truncate">{tournament.venue}</p>
        )}
        {tournament.format && (
          <p className="text-xs text-zinc-400">{tournamentFormatLabel(tournament.format)}</p>
        )}
        {tournament.organizer && (
          <p className="text-xs text-zinc-500">
            主辦：
            <span className="underline">{tournament.organizer.display_name}</span>
          </p>
        )}
      </div>
    </Link>
  );
}
