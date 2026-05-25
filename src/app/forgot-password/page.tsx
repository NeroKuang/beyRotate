import Link from "next/link";
import { requestPasswordReset } from "@/app/actions/auth";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { Input, Label } from "@/components/ui/input";
import { BeyAuthShell } from "@/components/layout/bey-auth-shell";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const params = await searchParams;

  return (
    <BeyAuthShell
      title="忘記密碼"
      footer={
        <>
          想起來了？{" "}
          <Link href="/login" className="text-sky-600 underline dark:text-sky-400">
            返回登入
          </Link>
        </>
      }
    >
      {params.sent ? (
        <div className="space-y-3">
          <p className="text-sm text-emerald-600">
            如果此 Email 已註冊，重設連結已寄出。請檢查你的信箱。
          </p>
          <p className="text-xs text-zinc-500">
            沒收到？請檢查垃圾信件匣，或稍後再試。
          </p>
        </div>
      ) : (
        <>
          {params.error && (
            <p className="mb-4 text-sm text-red-600">{decodeURIComponent(params.error)}</p>
          )}
          <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
            輸入你的註冊 Email，我們會寄送密碼重設連結。
          </p>
          <form action={requestPasswordReset} className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input name="email" type="email" required className="bey-input" autoComplete="email" />
            </div>
            <FormSubmitButton className="w-full" pendingLabel="送出中…">
              送出重設連結
            </FormSubmitButton>
          </form>
        </>
      )}
    </BeyAuthShell>
  );
}
