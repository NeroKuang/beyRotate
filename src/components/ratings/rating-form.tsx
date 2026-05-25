"use client";

import { useState } from "react";
import { submitRating } from "@/app/actions/ratings";
import { StarRating } from "@/components/ratings/star-rating";
import { FormSubmitButton } from "@/components/ui/form-submit-button";

type Props = {
  listingId: string;
  rateeId: string;
  rateeName: string;
};

export function RatingForm({ listingId, rateeId, rateeName }: Props) {
  const [score, setScore] = useState(0);

  return (
    <form action={submitRating} className="bey-card space-y-4 p-4">
      <h3 className="font-bold text-sm">為 {rateeName} 評分</h3>
      <div>
        <StarRating value={score} onChange={setScore} size="lg" />
        <input type="hidden" name="score" value={score} />
        <input type="hidden" name="listing_id" value={listingId} />
        <input type="hidden" name="ratee_id" value={rateeId} />
        {score === 0 && (
          <input
            tabIndex={-1}
            className="sr-only"
            required
            value=""
            readOnly
            aria-hidden
          />
        )}
      </div>
      <div>
        <label className="text-xs text-zinc-500">留言（選填，300 字內）</label>
        <textarea
          name="comment"
          maxLength={300}
          rows={2}
          className="bey-input mt-1"
          placeholder="交易體驗如何？"
        />
      </div>
      <FormSubmitButton pendingLabel="送出中…" className="text-sm">
        送出評分
      </FormSubmitButton>
    </form>
  );
}
