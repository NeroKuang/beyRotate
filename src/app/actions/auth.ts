"use server";

import "@/lib/auth-env";
import bcrypt from "bcryptjs";
import { encode } from "next-auth/jwt";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth-options";

function sessionCookieName(secure: boolean): string {
  return secure
    ? "__Secure-next-auth.session-token"
    : "next-auth.session-token";
}

export async function loginWithCredentials(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) redirect("/login?error=invalid");

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user?.passwordHash) redirect("/login?error=invalid");

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) redirect("/login?error=invalid");

  const profile = await prisma.profile.findUnique({ where: { id: user.id } });
  const secret = authOptions.secret;
  if (!secret || typeof secret !== "string") {
    throw new Error("缺少 AUTH_SECRET / NEXTAUTH_SECRET");
  }

  const secure = process.env.NODE_ENV === "production";
  const maxAge = 30 * 24 * 60 * 60;

  const token = await encode({
    token: {
      name: profile?.displayName ?? user.name,
      email: user.email,
      picture: user.image,
      sub: user.id,
      id: user.id,
    },
    secret,
    maxAge,
  });

  const cookieStore = await cookies();
  cookieStore.set(sessionCookieName(secure), token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure,
    maxAge,
  });

  redirect("/dashboard");
}

export async function signUp(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const terms = formData.get("terms") === "on";
  if (!terms) redirect("/register?error=terms");
  if (!email || password.length < 8) redirect("/register?error=invalid");

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) redirect("/register?error=exists");

  const passwordHash = await bcrypt.hash(password, 12);
  const displayName = email.split("@")[0];

  await prisma.user.create({
    data: {
      email,
      passwordHash,
      emailVerified: new Date(),
      profile: {
        create: {
          displayName,
          onboardingCompleted: false,
          settings: { create: {} },
        },
      },
    },
  });

  redirect("/login?message=registered");
}

export async function completeOnboarding(formData: FormData) {
  const displayName = String(formData.get("display_name") ?? "").trim();
  const terms = formData.get("terms") === "on";
  if (!displayName || displayName.length < 2)
    redirect("/onboarding?error=name");
  if (!terms) redirect("/onboarding?error=terms");

  const { getServerSession } = await import("next-auth");
  const { authOptions } = await import("@/lib/auth-options");
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  await prisma.profile.update({
    where: { id: session.user.id },
    data: {
      displayName,
      onboardingCompleted: true,
      termsAcceptedAt: new Date(),
    },
  });

  redirect("/dashboard");
}
