import { prisma } from "@/lib/prisma";
import type { TournamentStatus } from "@prisma/client";

export const tournamentInclude = {
  organizer: { select: { id: true, displayName: true, avatarUrl: true } },
  _count: { select: { interests: true } },
};

export type TournamentRow = {
  id: string;
  organizer_id: string;
  title: string;
  description: string | null;
  prizes: string | null;
  poster_path: string | null;
  region: string;
  venue: string | null;
  starts_at: string;
  ends_at: string | null;
  registration_method: string;
  registration_url: string | null;
  registration_deadline: string | null;
  contact_info: string | null;
  format: string | null;
  entry_fee: string | null;
  max_participants: number | null;
  rules: string | null;
  status: TournamentStatus;
  published_at: string | null;
  created_at: string;
  interest_count: number;
  organizer?: {
    id: string;
    display_name: string;
    avatar_url: string | null;
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapTournament(t: any): TournamentRow {
  return {
    id: t.id,
    organizer_id: t.organizerId,
    title: t.title,
    description: t.description,
    prizes: t.prizes,
    poster_path: t.posterPath,
    region: t.region,
    venue: t.venue,
    starts_at: t.startsAt.toISOString(),
    ends_at: t.endsAt?.toISOString() ?? null,
    registration_method: t.registrationMethod,
    registration_url: t.registrationUrl,
    registration_deadline: t.registrationDeadline?.toISOString() ?? null,
    contact_info: t.contactInfo,
    format: t.format,
    entry_fee: t.entryFee,
    max_participants: t.maxParticipants,
    rules: t.rules,
    status: t.status,
    published_at: t.publishedAt?.toISOString() ?? null,
    created_at: t.createdAt.toISOString(),
    interest_count: t._count?.interests ?? 0,
    organizer: t.organizer
      ? {
          id: t.organizer.id,
          display_name: t.organizer.displayName,
          avatar_url: t.organizer.avatarUrl,
        }
      : undefined,
  };
}

export async function fetchPublishedTournaments(opts?: {
  region?: string;
  from?: Date;
  to?: Date;
  limit?: number;
}) {
  const rows = await prisma.tournament.findMany({
    where: {
      status: "published",
      ...(opts?.region ? { region: opts.region } : {}),
      ...(opts?.from || opts?.to
        ? {
            startsAt: {
              ...(opts.from ? { gte: opts.from } : {}),
              ...(opts.to ? { lte: opts.to } : {}),
            },
          }
        : {}),
    },
    include: tournamentInclude,
    orderBy: { startsAt: "asc" },
    take: opts?.limit ?? 200,
  });
  return rows.map(mapTournament);
}
