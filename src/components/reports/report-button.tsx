"use client";

import { useState } from "react";
import { REPORT_REASONS } from "@/lib/constants";
import { Button } from "@/components/ui/button";

export function ReportButton({
  targetType,
  targetId,
}: {
  targetType: "listing" | "user";
  targetId: string;
}) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const fd = new FormData(e.currentTarget);
      const res = await fetch("/api/reports", {
        method: "POST",
        body: JSON.stringify({
          target_type: targetType,
          target_id: targetId,
          reason: fd.get("reason"),
          note: fd.get("note"),
        }),
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        setDone(true);
        setOpen(false);
        return;
      }
      setError("提交失敗，請稍後再試。");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <span className="inline-flex items-center rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
        已提交檢舉
      </span>
    );
  }

  return (
    <>
      <Button type="button" variant="ghost" onClick={() => setOpen(true)}>
        檢舉
      </Button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => !submitting && setOpen(false)}
        >
          <form
            onSubmit={submit}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm space-y-3 rounded-xl bg-white p-6 shadow-xl dark:bg-zinc-900"
          >
            <h3 className="font-bold">檢舉</h3>
            <select name="reason" required className="bey-input">
              {REPORT_REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
            <textarea
              name="note"
              rows={2}
              placeholder="補充說明（選填）"
              className="bey-input"
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                disabled={submitting}
                onClick={() => setOpen(false)}
              >
                取消
              </Button>
              <Button
                type="submit"
                variant="danger"
                disabled={submitting}
                className={submitting ? "cursor-wait" : undefined}
              >
                {submitting && (
                  <span
                    className="mr-1.5 inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
                    aria-hidden
                  />
                )}
                {submitting ? "送出中…" : "送出"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
