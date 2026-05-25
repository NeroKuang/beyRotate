"use client";

import Link from "next/link";
import { updateListingStatusAction } from "@/app/actions/listings";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS = [
  { value: "active", label: "上架中" },
  { value: "reserved", label: "已預留" },
  { value: "sold", label: "已售出" },
  { value: "closed", label: "已關閉" },
] as const;

type Props = {
  listingId: string;
  currentStatus: string;
};

export function ListingStatusManager({ listingId, currentStatus }: Props) {
  return (
    <div className="mt-8 space-y-3 border-t pt-4">
      <p className="text-sm font-medium">管理刊登</p>
      <p className="text-xs text-zinc-500">目前狀態：{statusLabel(currentStatus)}</p>
      <div className="flex flex-wrap gap-2">
        {STATUS_OPTIONS.map((s) => {
          const isCurrent = currentStatus === s.value;
          return (
            <form key={s.value} action={updateListingStatusAction}>
              <input type="hidden" name="id" value={listingId} />
              <input type="hidden" name="status" value={s.value} />
              <FormSubmitButton
                variant={isCurrent ? "primary" : "secondary"}
                className={cn("text-xs", isCurrent && "ring-2 ring-sky-400/50")}
                pendingLabel="更新中…"
                disabled={isCurrent}
              >
                {s.label}
              </FormSubmitButton>
            </form>
          );
        })}
      </div>
      <Link href={`/listings/${listingId}/edit`} className="inline-block text-sm underline">
        編輯
      </Link>
    </div>
  );
}

function statusLabel(status: string) {
  return STATUS_OPTIONS.find((s) => s.value === status)?.label ?? status;
}
