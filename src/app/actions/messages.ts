"use server";

import { prisma } from "@/lib/prisma";
import { requireVerifiedUser, redirectByAuthError } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { MAX_MESSAGE_LENGTH } from "@/lib/constants";

export async function startConversation(
  otherUserId: string,
  listingId?: string
) {
  const auth = await requireVerifiedUser();
  if (auth.error) redirectByAuthError(auth.error);

  if (otherUserId === auth.user.id) redirect("/messages");

  const block = await prisma.userBlock.findUnique({
    where: {
      blockerId_blockedId: {
        blockerId: otherUserId,
        blockedId: auth.user.id,
      },
    },
  });
  if (block) redirect("/messages?error=blocked");

  const [a, b] =
    auth.user.id < otherUserId
      ? [auth.user.id, otherUserId]
      : [otherUserId, auth.user.id];

  const existing = await prisma.conversation.findFirst({
    where: {
      listingId: listingId ?? null,
      participantA: a,
      participantB: b,
    },
  });
  if (existing) return existing.id;

  const created = await prisma.conversation.create({
    data: {
      listingId: listingId ?? null,
      participantA: a,
      participantB: b,
    },
  });
  return created.id;
}

export async function sendMessage(formData: FormData) {
  const auth = await requireVerifiedUser();
  if (auth.error) redirectByAuthError(auth.error);

  const conversationId = String(formData.get("conversation_id") ?? "");
  const body = String(formData.get("body") ?? "").trim().slice(0, MAX_MESSAGE_LENGTH);
  const imageData = String(formData.get("image") ?? "").trim();

  if (!body && !imageData) return;

  const convo = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      OR: [
        { participantA: auth.user.id },
        { participantB: auth.user.id },
      ],
    },
  });
  if (!convo) redirect("/messages");

  const imagePath = imageData && imageData.startsWith("data:image/")
    ? imageData
    : null;

  await prisma.message.create({
    data: {
      conversationId,
      senderId: auth.user.id,
      body: body || null,
      imagePath,
    },
  });

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { lastMessageAt: new Date() },
  });

  revalidatePath(`/messages/${conversationId}`);
}
