import Link from "next/link";
import { resetPassword } from "@/app/actions/auth";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/input";
import { BeyAuthShell } from "@/components/layout/bey-auth-shell";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; email?: string; error?: string }>;
}) {
  const params = await searchParams;

  if (!params.token || !params.email) {
    return (
      <BeyAuthShell title="重設密碼">
        <p className="text-sm text-red-600">無效的重設連結。請重新申請。</p>
        <Link href="/forgot-password" className="mt-4 inline-block text-sm text-sky-600 underline">
          重新申請
        </Link>
      </BeyAuthShell>
    );
  }

  return (
    <BeyAuthShell
      title="重設密碼"
      footer={
        <Link href="/login" className="text-sky-600 underline dark:text-sky-400">
          返回登入
        </Link>
      }
    >
      {params.error && (
        <p className="mb-4 text-sm text-red-600">
          {params.error === "expired"
            ? "重設連結已過期，請重新申請。"
            : params.error === "weak"
              ? "密碼至少 8 個字元。"
              : decodeURIComponent(params.error)}
        </p>
      )}
      <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
        為 <strong>{params.email}</strong> 設定新密碼。
      </p>
      <form action={resetPassword} className="space-y-4">
        <input type="hidden" name="token" value={params.token} />
        <input type="hidden" name="email" value={params.email} />
        <div>
          <Label>新密碼</Label>
          <PasswordInput
            name="password"
            minLength={8}
            required
            className="bey-input"
            autoComplete="new-password"
          />
        </div>
        <div>
          <Label>確認新密碼</Label>
          <PasswordInput
            name="password_confirm"
            minLength={8}
            required
            className="bey-input"
            autoComplete="new-password"
          />
        </div>
        <FormSubmitButton className="w-full" pendingLabel="重設中…">
          重設密碼
        </FormSubmitButton>
      </form>
    </BeyAuthShell>
  );
}
