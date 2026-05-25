import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { ListingCard } from "@/components/listings/listing-card";
import { BeyHeroBanner } from "@/components/layout/bey-hero-banner";
import { BeyEmptyState } from "@/components/layout/bey-empty-state";
import { listingInclude, mapListing } from "@/lib/queries/listings";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const rows = await prisma.listing.findMany({
    where: { userId: session.user.id },
    include: listingInclude,
    orderBy: { updatedAt: "desc" },
  });

  const reports = await prisma.report.findMany({
    where: { reporterId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <BeyHeroBanner title="我的刊登" description="管理你的出售、徵求與交換刊登。">
        <Link href="/listings/new" className="bey-btn-primary inline-flex">
          新增刊登
        </Link>
      </BeyHeroBanner>
      <div className="mb-8 flex gap-4 text-sm">
        <Link href="/settings" className="text-sky-600 hover:underline dark:text-sky-400">
          設定與聯絡方式
        </Link>
        <Link href="/settings/export" className="text-sky-600 hover:underline dark:text-sky-400">
          匯出我的刊登
        </Link>
      </div>
      {rows.length === 0 ? (
        <BeyEmptyState
          title="尚無刊登"
          description="建立第一則刊登，讓其他玩家找到你。"
          action={{ href: "/listings/new", label: "新增刊登" }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((r) => (
            <ListingCard key={r.id} listing={mapListing(r)} />
          ))}
        </div>
      )}
      <section className="bey-card mt-12 p-6">
        <h2 className="mb-4 font-bold">我的檢舉</h2>
        {reports.length === 0 ? (
          <BeyEmptyState
            title="尚無檢舉紀錄"
            description="你還沒有提交任何檢舉。"
          />
        ) : (
          <ul className="space-y-2 text-sm">
            {reports.map((r) => (
              <li key={r.id}>
                {r.targetType} · {r.status} ·{" "}
                {new Date(r.createdAt).toLocaleString("zh-TW")}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
