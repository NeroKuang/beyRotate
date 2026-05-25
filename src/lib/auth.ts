import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import type { Profile } from "@/types/database";

export async function getSessionUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  return {
    id: session.user.id,
    email: session.user.email ?? null,
    email_confirmed_at: null as string | null, // 見 isEmailVerified
  };
}

export async function isEmailVerified(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { emailVerified: true },
  });
  return !!user?.emailVerified;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const p = await prisma.profile.findUnique({ where: { id: userId } });
  if (!p) return null;
  return {
    id: p.id,
    display_name: p.displayName,
    avatar_url: p.avatarUrl,
    bio: p.bio,
    region: p.region,
    line_id: p.lineId,
    discord: p.discord,
    facebook: p.facebook,
    email_public: p.emailPublic,
    phone: p.phone,
    is_banned: p.isBanned,
    onboarding_completed: p.onboardingCompleted,
    created_at: p.createdAt.toISOString(),
  };
}

type VerifiedResult =
  | { error: "login"; user: null; profile?: undefined }
  | { error: "verify"; user: { id: string; email: string | null } }
  | { error: "onboarding"; user: { id: string; email: string | null } }
  | { error: "banned"; user: { id: string; email: string | null } }
  | { error: null; user: { id: string; email: string | null }; profile: Profile };

export async function requireVerifiedUser(): Promise<VerifiedResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "login", user: null };

  const user = { id: session.user.id, email: session.user.email ?? null };

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { emailVerified: true },
  });
  if (!dbUser?.emailVerified) return { error: "verify", user };

  const profile = await getProfile(user.id);
  if (!profile?.onboarding_completed)
    return { error: "onboarding", user };
  if (profile.is_banned) return { error: "banned", user };
  return { error: null, user, profile };
}
