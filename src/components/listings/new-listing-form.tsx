"use client";

import { useState } from "react";
import { createListing } from "@/app/actions/listings";
import { MultiVariantPicker } from "@/components/catalog/multi-variant-picker";
import { MultiPartPicker } from "@/components/catalog/multi-part-picker";
import { StadiumPicker } from "@/components/catalog/stadium-picker";
import { VariantPicker } from "@/components/catalog/variant-picker";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { Input, Label, Select } from "@/components/ui/input";
import {
  LISTING_TYPES,
  CONDITIONS,
  DELIVERY_TAGS,
  CONTACT_PREFS,
  REGIONS,
  LISTING_TTL_NOTICE,
} from "@/lib/constants";
import type { CatalogSuggestion } from "@/components/catalog/catalog-product-search";

interface NewListingFormProps {
  initialType?: "sell" | "want" | "trade";
  initialOfferKind?: "variant" | "part" | "stadium";
  initialVariant?: CatalogSuggestion;
}

export function NewListingForm({
  initialType,
  initialOfferKind,
  initialVariant,
}: NewListingFormProps = {}) {
  const [type, setType] = useState<"sell" | "want" | "trade">(initialType ?? "sell");
  const initialCategory = initialVariant?.catalog_products?.category_id ?? "bey";
  const [category, setCategory] = useState(initialCategory);
  const [offerMode, setOfferMode] = useState<"variant" | "part" | "stadium">(initialOfferKind ?? "variant");
  const [seekMode, setSeekMode] = useState<"catalog" | "text">("catalog");
  const [deliveryTags, setDeliveryTags] = useState<string[]>([]);
  const sellParts = category === "bey" && offerMode === "part";
  const sellStadiums = category === "bey" && offerMode === "stadium";
  const perItemPricing = type === "sell" || type === "want";

  const toggleDelivery = (value: string) => {
    setDeliveryTags((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  return (
    <form action={createListing} className="space-y-6 max-w-xl">
      <p
        role="note"
        className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100"
      >
        {LISTING_TTL_NOTICE} 到期後狀態會改為「已關閉」，實拍圖將從 Imgur 移除。
      </p>
      <div>
        <Label>刊登類型</Label>
        <Select
          name="type"
          value={type}
          onChange={(e) => setType(e.target.value as typeof type)}
        >
          {LISTING_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label>產品大類</Label>
        <Select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="bey">陀螺</option>
          <option value="launcher">發射器</option>
          <option value="keihin">景品／限定</option>
          <option value="other">其他</option>
        </Select>
      </div>

      {category === "bey" && (
        <div className="space-y-2">
          <Label>刊登內容</Label>
          <div className="flex flex-col gap-2 text-sm sm:flex-row sm:gap-6">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="offer_kind"
                value="variant"
                checked={offerMode === "variant"}
                onChange={() => setOfferMode("variant")}
              />
              完整品項（整盒／整顆）
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="offer_kind"
                value="part"
                checked={offerMode === "part"}
                onChange={() => setOfferMode("part")}
              />
              單獨零件（刃／核輪／軸心）
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="offer_kind"
                value="stadium"
                checked={offerMode === "stadium"}
                onChange={() => setOfferMode("stadium")}
              />
              戰鬥盤
            </label>
          </div>
        </div>
      )}
      {category !== "bey" && (
        <input type="hidden" name="offer_kind" value="variant" />
      )}

      {type === "sell" || type === "want" ? (
        sellStadiums ? (
          <StadiumPicker
            label={type === "want" ? "徵求戰鬥盤（可多件）" : "出售戰鬥盤（可多件）"}
            listingType={type}
            required
          />
        ) : sellParts ? (
          <MultiPartPicker
            name="part_ids"
            label={type === "want" ? "徵求零件（可多件）" : "出售零件（可多件）"}
            listingType={type}
            required
          />
        ) : (
          <MultiVariantPicker
            category={category}
            name="variant_ids"
            label={type === "want" ? "徵求品項（可多件）" : "出售品項（可多件）"}
            listingType={type}
            required
            initialSelected={initialVariant ? [initialVariant] : undefined}
          />
        )
      ) : sellStadiums ? (
        <StadiumPicker
          label="我提供的戰鬥盤"
          listingType={type}
          required
        />
      ) : sellParts ? (
        <MultiPartPicker
          name="part_ids"
          label="我提供的零件"
          listingType={type}
          required
        />
      ) : (
        <VariantPicker
          category={category}
          name="variant_id"
          label="我提供的品項"
          required
        />
      )}

      {type === "trade" && (
        <div className="space-y-3 border-t pt-4">
          <Label>我想要</Label>
          <div className="flex gap-4 text-sm">
            <label>
              <input
                type="radio"
                checked={seekMode === "catalog"}
                onChange={() => setSeekMode("catalog")}
              />{" "}
              從目錄選
            </label>
            <label>
              <input
                type="radio"
                checked={seekMode === "text"}
                onChange={() => setSeekMode("text")}
              />{" "}
              文字描述
            </label>
          </div>
          {seekMode === "catalog" ? (
            <VariantPicker
              category={category}
              name="seek_variant_id"
              label="想要的品項"
            />
          ) : (
            <textarea
              name="seek_text"
              maxLength={500}
              rows={3}
              className="bey-input"
              placeholder="例：任何 CX-17 隱藏款"
            />
          )}
        </div>
      )}

      {type === "sell" && perItemPricing && (
        <label className="flex gap-2 text-sm">
          <input name="negotiable" type="checkbox" /> 可議價
        </label>
      )}

      {type === "sell" && !perItemPricing && (
        <>
          <div>
            <Label>標價（TWD）</Label>
            <Input name="price" type="number" min={1} max={999999} required />
          </div>
          <label className="flex gap-2 text-sm">
            <input name="negotiable" type="checkbox" /> 可議價
          </label>
        </>
      )}

      {type === "want" && !perItemPricing && (
        <div>
          <Label>預算上限（TWD）</Label>
          <Input name="budget" type="number" min={1} max={999999} required />
        </div>
      )}

      {type === "trade" && (
        <div>
          <Label>補差價（選填，TWD）</Label>
          <Input name="cash_diff" type="number" min={0} max={999999} />
        </div>
      )}

      <div>
        <Label>自訂標題（選填）</Label>
        <Input name="custom_title" placeholder="留空則自動產生" />
      </div>

      <div>
        <Label>成色</Label>
        <Select name="condition">
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
        <Select name="region">
          <option value="">— 請選擇 —</option>
          {REGIONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label>交易方式（必選）</Label>
        <div className="flex flex-wrap gap-3 mt-1">
          {DELIVERY_TAGS.map((d) => (
            <label key={d.value} className="text-sm flex gap-1 cursor-pointer">
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
        <input
          tabIndex={-1}
          className="sr-only"
          required
          value={deliveryTags.length ? "ok" : ""}
          readOnly
          aria-hidden
        />
      </div>

      <div>
        <Label>備註（500 字內）</Label>
        <textarea
          name="note"
          maxLength={500}
          rows={4}
          className="bey-input"
        />
      </div>

      <div>
        <Label>聯絡偏好</Label>
        <Select name="contact_pref" defaultValue="in_app">
          {CONTACT_PREFS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </Select>
      </div>

      <label className="flex gap-2 text-sm">
        <input
          name="accept_inquiries_while_reserved"
          type="checkbox"
          defaultChecked
        />
        已預留時仍接受詢問
      </label>

      <div className="flex gap-3">
        <FormSubmitButton variant="secondary" pendingLabel="儲存中…">
          儲存草稿
        </FormSubmitButton>
        <FormSubmitButton variant="primary" name="publish" value="on" pendingLabel="發布中…">
          立即發布
        </FormSubmitButton>
      </div>
      <p className="text-xs text-zinc-500">
        刊登時會自動帶入 go-shoot 目錄圖片；若要實拍可在發布後於編輯頁替換。
      </p>
    </form>
  );
}
