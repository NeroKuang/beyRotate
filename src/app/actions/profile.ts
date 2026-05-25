"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const phone = String(formData.get("phone") ?? "").trim();
  if (phone && !/^09\d{8}$/.test(phone)) redirect("/settings?error=phone");

  await prisma.profile.update({
    where: { id: session.user.id },
    data: {
      displayName: String(formData.get("display_name") ?? "").trim(),
      region: String(formData.get("region") ?? "") || null,
      lineId: String(formData.get("line_id") ?? "") || null,
      discord: String(formData.get("discord") ?? "") || null,
      facebook: String(formData.get("facebook") ?? "") || null,
      emailPublic: String(formData.get("email_public") ?? "") || null,
      phone: phone || null,
    },
  });

  await prisma.userSettings.update({
    where: { userId: session.user.id },
    data: {
      emailNotifyMessages: formData.get("email_notify_messages") === "on",
    },
  });

  revalidatePath("/settings");
  redirect("/settings?saved=1");
}
