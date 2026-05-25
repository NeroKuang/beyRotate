"use client";

import { useState } from "react";
import { Input, Label, Select } from "@/components/ui/input";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import {
  CONDITIONS,
  DELIVERY_TAGS,
  CONTACT_PREFS,
  LISTING_STATUSES,
} from "@/lib/constants";

type ListingData = {
  id: string;
  type: string;
  status: string;
  customTitle: string | null;
  price: number | null;
  budget: number | null;
  cashDiff: number | null;
  negotiable: boolean;
  condition: string | null;
  region: string | null;
  deliveryTags: string[];
  note: string | null;
  contactPref: string;
  acceptInquiriesWhileReserved: boolean;
};

export function EditListingForm({
  listing,
  action,
}: {
  listing: ListingData;
  action: (formData: FormData) => Promise<void>;
}) {
  const [deliveryTags, setDeliveryTags] = useState<string[]>(
    listing.deliveryTags
  );

  const toggleDelivery = (value: string) => {
    setDeliveryTags((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const editableStatuses = LISTING_STATUSES.filter(
    (s) => s.value !== "draft"
  );

  return (
    <form action={action} className="space-y-6 max-w-xl">
      <input type="hidden" name="id" value={listing.id} />

      <div>
        <Label>狀態</Label>
        <Select name="status" defaultValue={listing.status} className="bey-input">
          {editableStatuses.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label>自訂標題</Label>
        <Input
          name="custom_title"
          defaultValue={listing.customTitle ?? ""}
          placeholder="留空則自動產生"
          className="bey-input"
        />
      </div>

      {listing.type === "sell" && (
        <div>
          <Label>標價（TWD）</Label>
          <Input
            name="price"
            type="number"
            min={1}
            max={999999}
            defaultValue={listing.price ?? ""}
            className="bey-input"
          />
          <label className="mt-2 flex items-center gap-2 text-sm">
            <input
              name="negotiable"
              type="checkbox"
              defaultChecked={listing.negotiable}
            />
            可議價
          </label>
        </div>
      )}

      {listing.type === "want" && (
        <div>
          <Label>預算上限（TWD）</Label>
          <Input
            name="budget"
            type="number"
            min={1}
            max={999999}
            defaultValue={listing.budget ?? ""}
            className="bey-input"
          />
        </div>
      )}

      {listing.type === "trade" && (
        <div>
          <Label>補差價（選填，TWD）</Label>
          <Input
            name="cash_diff"
            type="number"
            min={0}
            max={999999}
            defaultValue={listing.cashDiff ?? ""}
            className="bey-input"
          />
          <label className="mt-2 flex items-center gap-2 text-sm">
            <input
              name="negotiable"
              type="checkbox"
              defaultChecked={listing.negotiable}
            />
            可議價
          </label>
        </div>
      )}

      <div>
        <Label>成色</Label>
        <Select
          name="condition"
          defaultValue={listing.condition ?? ""}
          className="bey-input"
        >
          <option value="">—</option>
          {CONDITIONS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label>地區</Label>
        <Input
          name="region"
          defaultValue={listing.region ?? ""}
          placeholder="例：台北市、可郵寄"
          className="bey-input"
        />
      </div>

      <div>
        <Label>交易方式</Label>
        <div className="mt-1 flex flex-wrap gap-3">
          {DELIVERY_TAGS.map((d) => (
            <label key={d.value} className="flex cursor-pointer items-center gap-1 text-sm">
              <input
                type="checkbox"
                checked={deliveryTags.includes(d.value)}
                onChange={() => toggleDelivery(d.value)}
              />
              {d.label}
            </label>
          ))}
        </div>
        {deliveryTags.map((t) => (
          <input key={t} type="hidden" name="delivery_tags" value={t} />
        ))}
      </div>

      <div>
        <Label>備註（500 字內）</Label>
        <textarea
          name="note"
          maxLength={500}
          rows={4}
          defaultValue={listing.note ?? ""}
          className="bey-input"
        />
      </div>

      <div>
        <Label>聯絡偏好</Label>
        <Select
          name="contact_pref"
          defaultValue={listing.contactPref}
          className="bey-input"
        >
          {CONTACT_PREFS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </Select>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          name="accept_inquiries_while_reserved"
          type="checkbox"
          defaultChecked={listing.acceptInquiriesWhileReserved}
        />
        已預留時仍接受詢問
      </label>

      <div className="flex gap-3">
        <FormSubmitButton pendingLabel="儲存中…">儲存變更</FormSubmitButton>
      </div>
    </form>
  );
}
