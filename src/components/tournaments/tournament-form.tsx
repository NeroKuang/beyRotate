"use client";

import Link from "next/link";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { Input, Label, Select } from "@/components/ui/input";
import { REGIONS, TOURNAMENT_FORMATS } from "@/lib/constants";

type TournamentFormData = {
  id?: string;
  title?: string;
  description?: string | null;
  prizes?: string | null;
  region?: string;
  venue?: string | null;
  starts_at?: string;
  ends_at?: string | null;
  registration_method?: string;
  registration_url?: string | null;
  registration_deadline?: string | null;
  contact_info?: string | null;
  format?: string | null;
  entry_fee?: string | null;
  max_participants?: number | null;
  rules?: string | null;
  status?: string;
};

function toLocalInput(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function TournamentForm({
  action,
  initial,
  isEdit,
}: {
  action: (formData: FormData) => Promise<void>;
  initial?: TournamentFormData;
  isEdit?: boolean;
}) {
  return (
    <form action={action} className="space-y-5 max-w-xl">
      {initial?.id && <input type="hidden" name="id" value={initial.id} />}

      <div>
        <Label>賽事名稱 *</Label>
        <Input name="title" required defaultValue={initial?.title ?? ""} placeholder="例：2026 北區 BB 交流賽" />
      </div>

      <div>
        <Label>地區 *</Label>
        <Select name="region" required defaultValue={initial?.region ?? ""}>
          <option value="">— 請選擇 —</option>
          {REGIONS.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </Select>
      </div>

      <div>
        <Label>比賽地點</Label>
        <Input name="venue" defaultValue={initial?.venue ?? ""} placeholder="例：○○活動中心 3F" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>開始時間 *</Label>
          <Input
            name="starts_at"
            type="datetime-local"
            required
            defaultValue={toLocalInput(initial?.starts_at)}
          />
        </div>
        <div>
          <Label>結束時間（選填）</Label>
          <Input
            name="ends_at"
            type="datetime-local"
            defaultValue={toLocalInput(initial?.ends_at)}
          />
        </div>
      </div>

      <div>
        <Label>賽制</Label>
        <Select name="format" defaultValue={initial?.format ?? ""}>
          <option value="">—</option>
          {TOURNAMENT_FORMATS.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </Select>
      </div>

      <div>
        <Label>賽事說明</Label>
        <textarea
          name="description"
          rows={4}
          className="bey-input"
          defaultValue={initial?.description ?? ""}
          placeholder="賽事規則摘要、對象、注意事項…"
        />
      </div>

      <div>
        <Label>獎品</Label>
        <textarea
          name="prizes"
          rows={3}
          className="bey-input"
          defaultValue={initial?.prizes ?? ""}
          placeholder="冠軍獎品、參加禮…"
        />
      </div>

      <div>
        <Label>報名方式 *</Label>
        <textarea
          name="registration_method"
          rows={3}
          required
          className="bey-input"
          defaultValue={initial?.registration_method ?? ""}
          placeholder="例：私訊主辦 LINE、現場報名、填 Google 表單…"
        />
      </div>

      <div>
        <Label>報名連結（選填）</Label>
        <Input
          name="registration_url"
          type="url"
          defaultValue={initial?.registration_url ?? ""}
          placeholder="https://"
        />
      </div>

      <div>
        <Label>報名截止（選填）</Label>
        <Input
          name="registration_deadline"
          type="datetime-local"
          defaultValue={toLocalInput(initial?.registration_deadline)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>報名費（選填）</Label>
          <Input name="entry_fee" defaultValue={initial?.entry_fee ?? ""} placeholder="例：免費、200 元" />
        </div>
        <div>
          <Label>人數上限（選填）</Label>
          <Input
            name="max_participants"
            type="number"
            min={1}
            max={9999}
            defaultValue={initial?.max_participants ?? ""}
          />
        </div>
      </div>

      <div>
        <Label>聯絡方式（選填）</Label>
        <Input
          name="contact_info"
          defaultValue={initial?.contact_info ?? ""}
          placeholder="LINE ID、Email…"
        />
      </div>

      <div>
        <Label>補充規章（選填）</Label>
        <textarea
          name="rules"
          rows={3}
          className="bey-input"
          defaultValue={initial?.rules ?? ""}
        />
      </div>

      {isEdit ? (
        <div>
          <Label>狀態</Label>
          <Select name="status" defaultValue={initial?.status ?? "draft"}>
            <option value="draft">草稿</option>
            <option value="published">已公開</option>
            <option value="cancelled">已取消</option>
          </Select>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        {!isEdit && (
          <FormSubmitButton variant="secondary" pendingLabel="儲存中…">
            儲存草稿
          </FormSubmitButton>
        )}
        <FormSubmitButton
          variant="primary"
          name={isEdit ? undefined : "publish"}
          value={isEdit ? undefined : "on"}
          pendingLabel="發布中…"
        >
          {isEdit ? "儲存變更" : "立即公開"}
        </FormSubmitButton>
        <Link href="/tournaments" className="bey-btn-secondary inline-flex items-center text-sm">
          取消
        </Link>
      </div>
    </form>
  );
}
