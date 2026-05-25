import { BeyAuthShell } from "@/components/layout/bey-auth-shell";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { resendVerificationEmail } from "@/app/actions/auth";
import Link from "next/link";

export default async function VerifyPendingPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; resent?: string }>;
}) {
  const params = await searchParams;
  const email = params.email ?? "";

  return (
    <BeyAuthShell
      title="驗證你的 Email"
      footer={
        <>
          已驗證？{" "}
          <Link href="/login" className="text-sky-600 underline dark:text-sky-400">
            登入
          </Link>
        </>
      }
    >
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-900/30">
          <svg className="h-8 w-8 text-sky-600 dark:text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
          </svg>
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          我們已寄出驗證信到{" "}
          <span className="font-medium text-foreground">{email || "你的信箱"}</span>
          ，請點擊信中連結完成驗證。
        </p>
        {params.resent === "1" && (
          <p className="text-sm text-emerald-600 dark:text-emerald-400">
            驗證信已重新寄出！
          </p>
        )}
        <p className="text-xs text-zinc-500">
          沒收到信？請檢查垃圾郵件匣，或重新寄送。
        </p>
        <form action={resendVerificationEmail}>
          <input type="hidden" name="email" value={email} />
          <FormSubmitButton variant="secondary" pendingLabel="寄送中…">
            重新寄送驗證信
          </FormSubmitButton>
        </form>
      </div>
    </BeyAuthShell>
  );
}
