import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { target_type, target_id, reason, note } = body;

  try {
    await prisma.report.create({
      data: {
        reporterId: session.user.id,
        targetType: target_type,
        targetId: target_id,
        reason,
        note: note || null,
      },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "already reported" }, { status: 400 });
  }
}
