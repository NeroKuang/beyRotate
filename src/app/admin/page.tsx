import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { isAdminEmail } from "@/lib/admin";
import { adminAction } from "@/app/actions/admin";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { BeyEmptyState } from "@/components/layout/bey-empty-state";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !isAdminEmail(session.user.email)) redirect("/");

  const reports = await prisma.report.findMany({
    where: { status: "pending" },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const reporterIds = [...new Set(reports.map((r) => r.reporterId))];
  const reporters = await prisma.profile.findMany({
    where: { id: { in: reporterIds } },
    select: { id: true, displayName: true },
  });
  const nameMap = new Map(reporters.map((p) => [p.id, p.displayName]));

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">管理後台</h1>
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
                {r.reason} · {r.targetType} · {r.targetId.slice(0, 8)}…
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
                <FormSubmitButton name="action" value="hide" variant="danger" pendingLabel="處理中…">
                  隱藏
                </FormSubmitButton>
                <FormSubmitButton name="action" value="resolve" variant="secondary" pendingLabel="處理中…">
                  駁回
                </FormSubmitButton>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
