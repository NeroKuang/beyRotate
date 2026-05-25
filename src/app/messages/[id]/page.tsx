import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { sendMessage } from "@/app/actions/messages";
import { MessageThread } from "@/components/messages/message-thread";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;
  const convo = await prisma.conversation.findUnique({ where: { id } });
  if (
    !convo ||
    (convo.participantA !== userId && convo.participantB !== userId)
  ) {
    notFound();
  }

  const messages = await prisma.message.findMany({
    where: { conversationId: id },
    orderBy: { createdAt: "asc" },
  });

  await prisma.conversationRead.upsert({
    where: {
      conversationId_userId: { conversationId: id, userId },
    },
    create: { conversationId: id, userId, lastReadAt: new Date() },
    update: { lastReadAt: new Date() },
  });

  const otherId =
    convo.participantA === userId ? convo.participantB : convo.participantA;
  const other = await prisma.profile.findUnique({
    where: { id: otherId },
    select: { displayName: true },
  });

  return (
    <div className="mx-auto max-w-lg px-4 py-8 flex flex-col min-h-[60vh]">
      <h1 className="text-lg font-bold mb-4">
        與 {other?.displayName ?? "使用者"} 的對話
      </h1>
      <MessageThread
        conversationId={id}
        messages={messages.map((m) => ({
          id: m.id,
          sender_id: m.senderId,
          body: m.body,
          image_path: m.imagePath,
          created_at: m.createdAt.toISOString(),
        }))}
        currentUserId={userId}
        sendMessage={sendMessage}
      />
    </div>
  );
}
