import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { mapTournament } from "@/lib/queries/tournaments";
import { TournamentCalendar } from "@/components/tournaments/tournament-calendar";
import { BeyHeroBanner } from "@/components/layout/bey-hero-banner";

export default async function TournamentCalendarPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const rows = await prisma.tournament.findMany({
    where: {
      status: "published",
      interests: { some: { userId: session.user.id } },
    },
    include: {
      organizer: { select: { id: true, displayName: true, avatarUrl: true } },
      _count: { select: { interests: true } },
    },
    orderBy: { startsAt: "asc" },
  });

  const events = rows.map((r) => {
    const t = mapTournament(r);
    return {
      id: t.id,
      title: t.title,
      starts_at: t.starts_at,
      ends_at: t.ends_at,
      region: t.region,
      venue: t.venue,
    };
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <BeyHeroBanner
        title="我的賽事行事曆"
        description="只顯示你標記「我有興趣」的賽事。"
      >
        <Link href="/tournaments" className="bey-btn-secondary text-sm">
          瀏覽全部賽事
        </Link>
      </BeyHeroBanner>
      <TournamentCalendar events={events} />
    </div>
  );
}
