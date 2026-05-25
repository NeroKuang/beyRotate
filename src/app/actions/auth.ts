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

export async function requestPasswordReset(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) redirect("/forgot-password?error=請輸入 Email");

  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    const crypto = await import("crypto");
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.verificationToken.deleteMany({
      where: { identifier: `reset:${email}` },
    });

    await prisma.verificationToken.create({
      data: { identifier: `reset:${email}`, token, expires },
    });

    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ??
      process.env.AUTH_URL ??
      "http://localhost:5001";
    const resetUrl = `${baseUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    console.log(`[password-reset] ${email} → ${resetUrl}`);
  }

  redirect("/forgot-password?sent=1");
}

export async function resetPassword(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("password_confirm") ?? "");

  const qs = `token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;

  if (password.length < 8)
    redirect(`/reset-password?${qs}&error=weak`);
  if (password !== confirm)
    redirect(`/reset-password?${qs}&error=兩次密碼不一致`);

  const record = await prisma.verificationToken.findFirst({
    where: { identifier: `reset:${email}`, token },
  });

  if (!record || record.expires < new Date()) {
    await prisma.verificationToken.deleteMany({
      where: { identifier: `reset:${email}`, token },
    });
    redirect(`/reset-password?${qs}&error=expired`);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.update({
    where: { email },
    data: { passwordHash },
  });

  await prisma.verificationToken.deleteMany({
    where: { identifier: `reset:${email}` },
  });

  redirect("/login?message=reset");
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
