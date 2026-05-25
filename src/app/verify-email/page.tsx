import { verifyEmail } from "@/app/actions/auth";
import { BeyAuthShell } from "@/components/layout/bey-auth-shell";
import Link from "next/link";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; email?: string }>;
}) {
  const params = await searchParams;
  const token = params.token ?? "";
  const email = params.email ?? "";

  if (!token || !email) {
    return (
      <BeyAuthShell title="驗證失敗">
        <p className="text-sm text-red-600">缺少驗證參數，請重新從信件中點擊連結。</p>
      </BeyAuthShell>
    );
  }

  const result = await verifyEmail(token, email);

  if (result.error === "expired") {
    return (
      <BeyAuthShell
        title="連結已過期"
        footer={
          <Link
            href={`/verify-pending?email=${encodeURIComponent(email)}`}
            className="text-sky-600 underline dark:text-sky-400"
          >
            重新寄送驗證信
          </Link>
        }
      >
        <p className="text-sm text-red-600">
          此驗證連結已過期或已被使用，請重新寄送驗證信。
        </p>
      </BeyAuthShell>
    );
  }

  return (
    <BeyAuthShell
      title="Email 驗證成功！"
      footer={
        <Link href="/login" className="text-sky-600 underline dark:text-sky-400">
          前往登入
        </Link>
      }
    >
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
          <svg className="h-8 w-8 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          <span className="font-medium text-foreground">{email}</span>{" "}
          已成功驗證！你現在可以登入。
        </p>
        <Link href="/login?message=verified" className="bey-btn-primary inline-flex">
          登入
        </Link>
      </div>
    </BeyAuthShell>
  );
}
