"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { isAdminEmail } from "@/lib/admin";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function adminAction(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !isAdminEmail(session.user.email)) redirect("/");

  const reportId = String(formData.get("report_id") ?? "");
  const action = String(formData.get("action") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  const targetType = String(formData.get("target_type") ?? "");
  const targetId = String(formData.get("target_id") ?? "");

  if (!reason) redirect("/admin?error=reason");

  if (action === "hide" && targetType === "listing") {
    await prisma.listing.update({
      where: { id: targetId },
      data: { status: "hidden" },
    });
  }

  await prisma.report.update({
    where: { id: reportId },
    data: { status: action === "hide" ? "resolved" : "dismissed" },
  });

  await prisma.adminAuditLog.create({
    data: {
      adminId: session.user.id,
      action,
      targetType,
      targetId,
      reason,
    },
  });

  revalidatePath("/admin");
  redirect("/admin");
}
