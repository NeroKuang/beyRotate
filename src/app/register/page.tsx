import Link from "next/link";
import { signUp } from "@/app/actions/auth";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { Input, Label } from "@/components/ui/input";
import { BeyAuthShell } from "@/components/layout/bey-auth-shell";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <BeyAuthShell
      title="註冊"
      footer={
        <>
          已有帳號？{" "}
          <Link href="/login" className="text-sky-600 underline dark:text-sky-400">
            登入
          </Link>
        </>
      }
    >
      {params.error === "terms" && (
        <p className="mb-4 text-sm text-red-600">請同意服務條款與隱私權政策。</p>
      )}
      {params.error && params.error !== "terms" && (
        <p className="mb-4 text-sm text-red-600">{decodeURIComponent(params.error)}</p>
      )}
      <form action={signUp} className="space-y-4">
        <div>
          <Label>Email</Label>
          <Input name="email" type="email" required className="bey-input" />
        </div>
        <div>
          <Label>密碼</Label>
          <Input name="password" type="password" minLength={8} required className="bey-input" />
        </div>
        <label className="flex items-start gap-2 text-sm">
          <input name="terms" type="checkbox" required className="mt-1" />
          <span>
            我已年滿 13 歲（或經監護人同意），並同意{" "}
            <Link href="/terms" className="underline" target="_blank">
              服務條款
            </Link>{" "}
            與{" "}
            <Link href="/privacy" className="underline" target="_blank">
              隱私權政策
            </Link>
            。
          </span>
        </label>
        <FormSubmitButton className="w-full" pendingLabel="註冊中…">
          註冊
        </FormSubmitButton>
      </form>
    </BeyAuthShell>
  );
}
