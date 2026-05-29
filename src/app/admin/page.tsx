import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { isAdminEmail } from "@/lib/admin";
import { adminAction } from "@/app/actions/admin";
import { AdminModeration } from "@/components/admin/admin-moderation";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { BeyEmptyState } from "@/components/layout/bey-empty-state";
import { LISTING_PUBLISH_TTL_DAYS } from "@/lib/constants";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; deleted?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !isAdminEmail(session.user.email)) redirect("/");

  const sp = await searchParams;

  const [reports, listings, messages] = await Promise.all([
    prisma.report.findMany({
      where: { status: "pending" },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.listing.findMany({
      where: { status: { in: ["active", "reserved", "hidden"] } },
      orderBy: { publishedAt: "desc" },
      take: 30,
      include: {
        user: { select: { displayName: true } },
        items: {
          include: {
            variant: { include: { product: true } },
            part: true,
          },
        },
      },
    }),
    prisma.message.findMany({
      orderBy: { createdAt: "desc" },
      take: 40,
      include: {
        conversation: { select: { id: true, listingId: true } },
      },
    }),
  ]);

  const reporterIds = [...new Set(reports.map((r) => r.reporterId))];
  const reporters = await prisma.profile.findMany({
    where: { id: { in: reporterIds } },
    select: { id: true, displayName: true },
  });
  const nameMap = new Map(reporters.map((p) => [p.id, p.displayName]));

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">管理後台</h1>
      <p className="text-sm text-zinc-500 mb-6">
        公開刊登最長 {LISTING_PUBLISH_TTL_DAYS} 天，逾時由{" "}
        <code className="text-xs">/api/cron/expire-listings</code> 自動關閉並清除圖片。
      </p>

      {sp.deleted === "listing" && (
        <p className="mb-4 text-sm text-emerald-700 dark:text-emerald-400">已刪除刊登。</p>
      )}
      {sp.deleted === "message" && (
        <p className="mb-4 text-sm text-emerald-700 dark:text-emerald-400">已刪除訊息。</p>
      )}
      {sp.error === "reason" && (
        <p className="mb-4 text-sm text-red-600">請填寫處理／刪除原因。</p>
      )}
      {sp.error === "not_found" && (
        <p className="mb-4 text-sm text-red-600">找不到目標。</p>
      )}

      <section>
        <h2 className="text-lg font-semibold mb-4">待處理檢舉</h2>
        {reports.length === 0 ? (
          <BeyEmptyState
            title="無待處理項目"
            description="所有檢舉都已處理完畢。"
          />
        ) : (
          <ul className="space-y-4">
            {reports.map((r) => (
              <li key={r.id} className="border rounded-lg p-4 text-sm">
                <p>
                  {r.reason} · {r.targetType} ·{" "}
                  {r.targetType === "listing" ? (
                    <Link href={`/listings/${r.targetId}`} className="underline">
                      {r.targetId.slice(0, 8)}…
                    </Link>
                  ) : (
                    <span>{r.targetId.slice(0, 8)}…</span>
                  )}
                </p>
                <p className="text-zinc-500 mt-1">
                  檢舉者：{nameMap.get(r.reporterId) ?? "—"}
                </p>
                {r.note && <p className="mt-1">{r.note}</p>}
                <form action={adminAction} className="mt-3 flex gap-2 flex-wrap">
                  <input type="hidden" name="report_id" value={r.id} />
                  <input type="hidden" name="target_type" value={r.targetType} />
                  <input type="hidden" name="target_id" value={r.targetId} />
                  <input
                    name="reason"
                    placeholder="處理原因（必填）"
                    required
                    className="flex-1 min-w-[200px] rounded border px-2 py-1"
                  />
                  {r.targetType === "listing" && (
                    <>
                      <FormSubmitButton
                        name="action"
                        value="hide"
                        variant="secondary"
                        pendingLabel="處理中…"
                      >
                        隱藏
                      </FormSubmitButton>
                      <FormSubmitButton
                        name="action"
                        value="delete_listing"
                        variant="danger"
                        pendingLabel="刪除中…"
                      >
                        刪除刊登
                      </FormSubmitButton>
                    </>
                  )}
                  <FormSubmitButton
                    name="action"
                    value="resolve"
                    variant="secondary"
                    pendingLabel="處理中…"
                  >
                    駁回
                  </FormSubmitButton>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      <AdminModeration listings={listings} messages={messages} />
    </div>
  );
}
