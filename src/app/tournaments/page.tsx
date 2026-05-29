import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { fetchPublishedTournaments } from "@/lib/queries/tournaments";
import { TournamentCard } from "@/components/tournaments/tournament-card";
import { BeyHeroBanner } from "@/components/layout/bey-hero-banner";
import { BeyEmptyState } from "@/components/layout/bey-empty-state";
import { REGIONS } from "@/lib/constants";

export default async function TournamentsPage({
  searchParams,
}: {
  searchParams: Promise<{ region?: string }>;
}) {
  const params = await searchParams;
  const region = params.region?.trim() || undefined;
  const tournaments = await fetchPublishedTournaments({ region });
  const session = await getServerSession(authOptions);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <BeyHeroBanner
        title="賽事資訊"
        description="瀏覽陀螺對戰賽事，標記感興趣的比賽並加入你的行事曆。"
      >
        <div className="flex flex-wrap gap-2">
          {session?.user && (
            <>
              <Link href="/tournaments/new" className="bey-btn-primary text-sm">
                發布賽事
              </Link>
              <Link href="/tournaments/calendar" className="bey-btn-secondary text-sm">
                我的賽事行事曆
              </Link>
            </>
          )}
        </div>
      </BeyHeroBanner>

      <form method="get" className="mb-6 flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="region" className="mb-1 block text-xs text-zinc-500">
            地區篩選
          </label>
          <select
            id="region"
            name="region"
            defaultValue={region ?? ""}
            className="bey-input h-10 min-w-[10rem]"
          >
            <option value="">全部地區</option>
            {REGIONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="bey-btn-secondary h-10 px-4 text-sm">
          篩選
        </button>
        {region && (
          <Link href="/tournaments" className="text-sm text-zinc-500 underline">
            清除篩選
          </Link>
        )}
      </form>

      {tournaments.length === 0 ? (
        <BeyEmptyState
          title="目前沒有符合的賽事"
          description={region ? "試試其他地區，或稍後再來看看。" : "成為第一個發布賽事的主辦方吧！"}
          action={
            session?.user
              ? { href: "/tournaments/new", label: "發布賽事" }
              : { href: "/register", label: "註冊帳號" }
          }
        />
      ) : (
        <ul className="space-y-3">
          {tournaments.map((t) => (
            <li key={t.id}>
              <TournamentCard tournament={t} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
