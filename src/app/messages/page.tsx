import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { BeyHeroBanner } from "@/components/layout/bey-hero-banner";
import { BeyEmptyState } from "@/components/layout/bey-empty-state";

export default async function MessagesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;
  const convos = await prisma.conversation.findMany({
    where: {
      OR: [{ participantA: userId }, { participantB: userId }],
    },
    orderBy: { lastMessageAt: "desc" },
  });

  const otherIds = convos.map((c) =>
    c.participantA === userId ? c.participantB : c.participantA
  );
  const profiles = await prisma.profile.findMany({
    where: { id: { in: otherIds } },
    select: { id: true, displayName: true },
  });
  const nameMap = new Map(profiles.map((p) => [p.id, p.displayName]));

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <BeyHeroBanner title="訊息" description="與買賣雙方私下聯絡，平台不代收代付。" />
      {convos.length === 0 ? (
        <BeyEmptyState
          title="尚無對話"
          description="從市集找到感興趣的刊登，向賣家發送私訊開始交易。"
          action={{ href: "/listings", label: "去市集逛逛" }}
        />
      ) : (
        <ul className="bey-card divide-y divide-sky-100 dark:divide-indigo-900/50">
          {convos.map((c) => {
            const other =
              c.participantA === userId ? c.participantB : c.participantA;
            return (
              <li key={c.id}>
                <Link
                  href={`/messages/${c.id}`}
                  className="-mx-2 block rounded-lg px-4 py-4 transition hover:bg-sky-50/80 dark:hover:bg-indigo-950/40"
                >
                  <p className="font-medium">{nameMap.get(other) ?? "使用者"}</p>
                  {c.listingId && (
                    <p className="text-xs text-zinc-500">刊登 #{c.listingId.slice(0, 8)}</p>
                  )}
                  {c.lastMessageAt && (
                    <p className="text-xs text-zinc-400">
                      {formatDate(c.lastMessageAt.toISOString())}
                    </p>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
