import { loginWithCredentials } from "@/app/actions/auth";
import { LoginSubmitButton } from "@/components/auth/login-submit-button";
import { Input, Label } from "@/components/ui/input";

export function LoginForm({ error, message }: { error?: string; message?: string }) {
  return (
    <div className="space-y-4">
      {message === "registered" && (
        <p className="text-sm text-emerald-600">註冊成功，請登入。</p>
      )}
      {message === "verify" && (
        <p className="text-sm text-amber-700">
          請先完成 Email 驗證（Docker 版註冊後已自動驗證）。
        </p>
      )}
      {error && (
        <p className="text-sm text-red-600">
          {error === "invalid" ? "帳號或密碼錯誤" : decodeURIComponent(error)}
        </p>
      )}
      <form action={loginWithCredentials} className="space-y-4">
        <div>
          <Label>Email</Label>
          <Input name="email" type="email" autoComplete="email" required className="bey-input" />
        </div>
        <div>
          <Label>密碼</Label>
          <Input
            name="password"
            type="password"
            className="bey-input"
            autoComplete="current-password"
            required
          />
        </div>
        <LoginSubmitButton />
      </form>
    </div>
  );
}
