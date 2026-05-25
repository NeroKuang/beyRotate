import { redirect } from "next/navigation";
import { getSessionUser, getProfile } from "@/lib/auth";
import { completeOnboarding } from "@/app/actions/auth";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { Input, Label } from "@/components/ui/input";
import Link from "next/link";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const profile = await getProfile(user.id);
  if (profile?.onboarding_completed) redirect("/dashboard");

  const params = await searchParams;

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-bold mb-2">完成個人資料</h1>
      <p className="text-sm text-zinc-500 mb-6">請設定公開暱稱以繼續使用。</p>
      {params.error === "name" && (
        <p className="text-sm text-red-600 mb-4">暱稱至少 2 個字元。</p>
      )}
      {params.error === "terms" && (
        <p className="text-sm text-red-600 mb-4">請同意條款。</p>
      )}
      <form action={completeOnboarding} className="space-y-4">
        <div>
          <Label>暱稱（公開顯示）</Label>
          <Input
            name="display_name"
            required
            minLength={2}
            defaultValue={profile?.display_name ?? ""}
          />
        </div>
        <label className="flex gap-2 text-sm items-start">
          <input name="terms" type="checkbox" required className="mt-1" />
          <span>
            同意{" "}
            <Link href="/terms" className="underline" target="_blank">
              服務條款
            </Link>{" "}
            與{" "}
            <Link href="/privacy" className="underline" target="_blank">
              隱私權
            </Link>
          </span>
        </label>
        <FormSubmitButton className="w-full" pendingLabel="處理中…">
          完成
        </FormSubmitButton>
      </form>
    </div>
  );
}
