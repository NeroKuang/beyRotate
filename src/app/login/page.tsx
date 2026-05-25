import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { BeyAuthShell } from "@/components/layout/bey-auth-shell";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;

  return (
    <BeyAuthShell
      title="登入"
      footer={
        <>
          還沒有帳號？{" "}
          <Link href="/register" className="text-sky-600 underline dark:text-sky-400">
            註冊
          </Link>
        </>
      }
    >
      <LoginForm error={params.error} message={params.message} />
    </BeyAuthShell>
  );
}
