"use server";

import { prisma } from "@/lib/prisma";
import { requireVerifiedUser, redirectByAuthError } from "@/lib/auth";
import { MAX_NOTE_LENGTH } from "@/lib/constants";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

function parseDateTime(value: string): Date | null {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function tournamentFormData(formData: FormData) {
  return {
    title: String(formData.get("title") ?? "").trim().slice(0, 120),
    description: String(formData.get("description") ?? "").trim().slice(0, 5000) || null,
    prizes: String(formData.get("prizes") ?? "").trim().slice(0, 2000) || null,
    region: String(formData.get("region") ?? "").trim(),
    venue: String(formData.get("venue") ?? "").trim().slice(0, 200) || null,
    startsAt: parseDateTime(String(formData.get("starts_at") ?? "")),
    endsAt: parseDateTime(String(formData.get("ends_at") ?? "")),
    registrationMethod: String(formData.get("registration_method") ?? "").trim().slice(0, 2000),
    registrationUrl: String(formData.get("registration_url") ?? "").trim().slice(0, 500) || null,
    registrationDeadline: parseDateTime(String(formData.get("registration_deadline") ?? "")),
    contactInfo: String(formData.get("contact_info") ?? "").trim().slice(0, 500) || null,
    format: String(formData.get("format") ?? "").trim() || null,
    entryFee: String(formData.get("entry_fee") ?? "").trim().slice(0, 100) || null,
    maxParticipants: formData.get("max_participants")
      ? parseInt(String(formData.get("max_participants")), 10)
      : null,
    rules: String(formData.get("rules") ?? "").trim().slice(0, MAX_NOTE_LENGTH) || null,
    publish: formData.get("publish") === "on",
  };
}

export async function createTournament(formData: FormData) {
  const auth = await requireVerifiedUser();
  if (auth.error) redirectByAuthError(auth.error);

  const data = tournamentFormData(formData);
  if (!data.title) redirect("/tournaments/new?error=title");
  if (!data.region) redirect("/tournaments/new?error=region");
  if (!data.startsAt) redirect("/tournaments/new?error=starts_at");
  if (!data.registrationMethod) redirect("/tournaments/new?error=registration");

  const created = await prisma.tournament.create({
    data: {
      organizerId: auth.user.id,
      title: data.title,
      description: data.description,
      prizes: data.prizes,
      region: data.region,
      venue: data.venue,
      startsAt: data.startsAt,
      endsAt: data.endsAt,
      registrationMethod: data.registrationMethod,
      registrationUrl: data.registrationUrl,
      registrationDeadline: data.registrationDeadline,
      contactInfo: data.contactInfo,
      format: data.format,
      entryFee: data.entryFee,
      maxParticipants: data.maxParticipants && data.maxParticipants > 0
        ? data.maxParticipants
        : null,
      rules: data.rules,
      status: data.publish ? "published" : "draft",
      publishedAt: data.publish ? new Date() : null,
    },
  });

  revalidatePath("/tournaments");
  redirect(`/tournaments/${created.id}/edit`);
}

export async function updateTournament(formData: FormData) {
  const auth = await requireVerifiedUser();
  if (auth.error) redirectByAuthError(auth.error);

  const id = String(formData.get("id") ?? "");
  const existing = await prisma.tournament.findUnique({ where: { id } });
  if (!existing || existing.organizerId !== auth.user.id) redirect("/tournaments");

  const data = tournamentFormData(formData);
  if (!data.title) redirect(`/tournaments/${id}/edit?error=title`);
  if (!data.region) redirect(`/tournaments/${id}/edit?error=region`);
  if (!data.startsAt) redirect(`/tournaments/${id}/edit?error=starts_at`);
  if (!data.registrationMethod) redirect(`/tournaments/${id}/edit?error=registration`);

  const status = String(formData.get("status") ?? existing.status) as
    | "draft"
    | "published"
    | "cancelled";

  await prisma.tournament.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description,
      prizes: data.prizes,
      region: data.region,
      venue: data.venue,
      startsAt: data.startsAt,
      endsAt: data.endsAt,
      registrationMethod: data.registrationMethod,
      registrationUrl: data.registrationUrl,
      registrationDeadline: data.registrationDeadline,
      contactInfo: data.contactInfo,
      format: data.format,
      entryFee: data.entryFee,
      maxParticipants: data.maxParticipants && data.maxParticipants > 0
        ? data.maxParticipants
        : null,
      rules: data.rules,
      status,
      publishedAt:
        status === "published" && !existing.publishedAt
          ? new Date()
          : existing.publishedAt,
    },
  });

  revalidatePath(`/tournaments/${id}`);
  revalidatePath("/tournaments");
  redirect(`/tournaments/${id}`);
}

export async function toggleTournamentInterest(tournamentId: string) {
  const auth = await requireVerifiedUser();
  if (auth.error) redirectByAuthError(auth.error);

  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    select: { status: true },
  });
  if (!tournament || tournament.status !== "published") {
    redirect(`/tournaments/${tournamentId}`);
  }

  const existing = await prisma.tournamentInterest.findUnique({
    where: {
      tournamentId_userId: { tournamentId, userId: auth.user.id },
    },
  });

  if (existing) {
    await prisma.tournamentInterest.delete({
      where: {
        tournamentId_userId: { tournamentId, userId: auth.user.id },
      },
    });
  } else {
    await prisma.tournamentInterest.create({
      data: { tournamentId, userId: auth.user.id },
    });
  }

  revalidatePath(`/tournaments/${tournamentId}`);
  revalidatePath("/tournaments/calendar");
  revalidatePath("/tournaments");
}
