import { redirect } from "next/navigation";
import { requireVerifiedUser } from "@/lib/auth";
import { createTournament } from "@/app/actions/tournaments";
import { TournamentForm } from "@/components/tournaments/tournament-form";
import { BeyHeroBanner } from "@/components/layout/bey-hero-banner";

const ERRORS: Record<string, string> = {
  title: "請填寫賽事名稱。",
  region: "請選擇地區。",
  starts_at: "請填寫開始時間。",
  registration: "請填寫報名方式。",
};

export default async function NewTournamentPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const auth = await requireVerifiedUser();
  if (auth.error === "login") redirect("/login");
  if (auth.error === "verify") redirect("/login?error=verify");
  if (auth.error === "onboarding") redirect("/onboarding");
  if (auth.error === "banned") redirect("/");

  const params = await searchParams;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <BeyHeroBanner
        title="發布賽事"
        description="填寫賽事資訊後可儲存草稿；公開後會出現在賽事列表。儲存後可上傳宣傳圖。"
      />
      {params.error && (
        <p className="mb-4 text-sm text-red-600">{ERRORS[params.error] ?? params.error}</p>
      )}
      <TournamentForm action={createTournament} />
    </div>
  );
}
