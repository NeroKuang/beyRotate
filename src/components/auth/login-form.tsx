import Link from "next/link";
import { loginWithCredentials } from "@/app/actions/auth";
import { LoginSubmitButton } from "@/components/auth/login-submit-button";
import { PasswordInput } from "@/components/ui/password-input";
import { Input, Label } from "@/components/ui/input";

export function LoginForm({ error, message }: { error?: string; message?: string }) {
  return (
    <div className="space-y-4">
      {message === "registered" && (
        <p className="text-sm text-emerald-600">註冊成功，請先驗證 Email 後登入。</p>
      )}
      {message === "reset" && (
        <p className="text-sm text-emerald-600">密碼已重設，請用新密碼登入。</p>
      )}
      {message === "verified" && (
        <p className="text-sm text-emerald-600">Email 驗證成功！請登入。</p>
      )}
      {error === "verify" && (
        <p className="text-sm text-amber-700">
          請先完成 Email 驗證。檢查你的信箱或
          <Link href="/verify-pending" className="underline ml-1">重新寄送</Link>。
        </p>
      )}
      {error && error !== "verify" && (
        <p className="text-sm text-red-600">
          {error === "invalid"
            ? "帳號或密碼錯誤"
            : error === "banned"
              ? "此帳號已被停權"
              : decodeURIComponent(error)}
        </p>
      )}
      <form action={loginWithCredentials} className="space-y-4">
        <div>
          <Label>Email</Label>
          <Input name="email" type="email" autoComplete="email" required className="bey-input" />
        </div>
        <div>
          <Label>密碼</Label>
          <PasswordInput
            name="password"
            className="bey-input"
            autoComplete="current-password"
            required
          />
        </div>
        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-xs text-sky-600 hover:underline dark:text-sky-400">
            忘記密碼？
          </Link>
        </div>
        <LoginSubmitButton />
      </form>
    </div>
  );
}
