import Link from "next/link";
import { adminDeleteListing, adminDeleteMessage } from "@/app/actions/admin";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { listingExpiryLabel } from "@/lib/listing-expiry";
import { formatPrice } from "@/lib/utils";
import type { Prisma } from "@prisma/client";

type AdminListingRow = Prisma.ListingGetPayload<{
  include: {
    user: { select: { displayName: true } };
    items: {
      include: {
        variant: { include: { product: true } };
        part: true;
      };
    };
  };
}>;

type AdminMessageRow = Prisma.MessageGetPayload<{
  include: {
    conversation: { select: { id: true; listingId: true } };
  };
}>;

function listingTitle(row: AdminListingRow): string {
  if (row.customTitle?.trim()) return row.customTitle.trim();
  const offer = row.items.find((i) => i.role === "offer");
  if (offer) {
    return (
      offer.variant?.displayLabel ??
      offer.part?.displayLabel ??
      offer.seekText ??
      row.id.slice(0, 8)
    );
  }
  return row.id.slice(0, 8);
}

function listingPriceShort(row: AdminListingRow): string {
  if (row.type === "sell" && row.price != null) return formatPrice(row.price);
  if (row.type === "want" && row.budget != null) return `預算 ${formatPrice(row.budget)}`;
  if (row.type === "trade") return "交換";
  return "—";
}

export function AdminModeration({
  listings,
  messages,
}: {
  listings: AdminListingRow[];
  messages: AdminMessageRow[];
}) {
  return (
    <div className="mt-10 space-y-10">
      <section>
        <h2 className="text-lg font-semibold mb-2">刊登管理</h2>
        <p className="text-sm text-zinc-500 mb-4">
          可永久刪除刊登（含品項與上傳圖片）。公開刊登逾 14 天會由系統自動關閉。
        </p>
        {listings.length === 0 ? (
          <p className="text-sm text-zinc-500">目前無公開中的刊登。</p>
        ) : (
          <ul className="space-y-3">
            {listings.map((l) => (
              <li key={l.id} className="border rounded-lg p-4 text-sm">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <Link href={`/listings/${l.id}`} className="font-medium underline">
                      {listingTitle(l)}
                    </Link>
                    <p className="text-zinc-500 mt-0.5">
                      {l.status} · {listingPriceShort(l)} · {l.user.displayName}
                    </p>
                    {l.publishedAt && (
                      <p className="text-zinc-500 text-xs mt-0.5">
                        到期：{listingExpiryLabel(l.publishedAt) ?? "—"}
                      </p>
                    )}
                    <p className="text-xs text-zinc-400 font-mono mt-0.5">{l.id}</p>
                  </div>
                </div>
                <form action={adminDeleteListing} className="mt-3 flex gap-2 flex-wrap">
                  <input type="hidden" name="listing_id" value={l.id} />
                  <input
                    name="reason"
                    placeholder="刪除原因（必填）"
                    required
                    className="flex-1 min-w-[200px] rounded border px-2 py-1"
                  />
                  <FormSubmitButton variant="danger" pendingLabel="刪除中…">
                    刪除刊登
                  </FormSubmitButton>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">私訊管理</h2>
        <p className="text-sm text-zinc-500 mb-4">
          刪除違規或騷擾訊息（僅移除該則，對話仍保留）。
        </p>
        {messages.length === 0 ? (
          <p className="text-sm text-zinc-500">近期無私訊。</p>
        ) : (
          <ul className="space-y-3">
            {messages.map((m) => (
              <li key={m.id} className="border rounded-lg p-4 text-sm">
                <p className="text-zinc-500 text-xs">
                  {m.createdAt.toLocaleString("zh-TW")} · 對話{" "}
                  <Link href={`/messages/${m.conversationId}`} className="underline">
                    {m.conversationId.slice(0, 8)}…
                  </Link>
                  {m.conversation.listingId && (
                    <>
                      {" "}
                      · 刊登{" "}
                      <Link
                        href={`/listings/${m.conversation.listingId}`}
                        className="underline"
                      >
                        {m.conversation.listingId.slice(0, 8)}…
                      </Link>
                    </>
                  )}
                </p>
                <p className="mt-1 whitespace-pre-wrap break-words">
                  {m.body?.trim() || (m.imagePath ? "（圖片訊息）" : "（空白）")}
                </p>
                <p className="text-xs text-zinc-400 font-mono mt-0.5">{m.id}</p>
                <form action={adminDeleteMessage} className="mt-3 flex gap-2 flex-wrap">
                  <input type="hidden" name="message_id" value={m.id} />
                  <input
                    name="reason"
                    placeholder="刪除原因（必填）"
                    required
                    className="flex-1 min-w-[200px] rounded border px-2 py-1"
                  />
                  <FormSubmitButton variant="danger" pendingLabel="刪除中…">
                    刪除訊息
                  </FormSubmitButton>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
