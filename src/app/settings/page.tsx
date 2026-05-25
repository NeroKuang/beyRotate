import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { updateProfile } from "@/app/actions/profile";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { Input, Label } from "@/components/ui/input";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const profile = await prisma.profile.findUnique({
    where: { id: session.user.id },
  });
  const settings = await prisma.userSettings.findUnique({
    where: { userId: session.user.id },
  });

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">設定</h1>
      <form action={updateProfile} className="space-y-4">
        <div>
          <Label>暱稱</Label>
          <Input name="display_name" defaultValue={profile?.displayName ?? ""} required />
        </div>
        <div>
          <Label>地區</Label>
          <Input name="region" defaultValue={profile?.region ?? ""} />
        </div>
        <div>
          <Label>LINE（選填）</Label>
          <Input name="line_id" defaultValue={profile?.lineId ?? ""} />
        </div>
        <div>
          <Label>Discord（選填）</Label>
          <Input name="discord" defaultValue={profile?.discord ?? ""} />
        </div>
        <div>
          <Label>Facebook（選填）</Label>
          <Input name="facebook" defaultValue={profile?.facebook ?? ""} />
        </div>
        <div>
          <Label>公開 Email（選填）</Label>
          <Input name="email_public" type="email" defaultValue={profile?.emailPublic ?? ""} />
        </div>
        <div>
          <Label>手機（選填，09 開頭）</Label>
          <Input name="phone" defaultValue={profile?.phone ?? ""} pattern="09[0-9]{8}" />
        </div>
        <label className="flex gap-2 text-sm">
          <input
            name="email_notify_messages"
            type="checkbox"
            defaultChecked={settings?.emailNotifyMessages ?? true}
          />
          新訊息 Email 通知
        </label>
        <FormSubmitButton pendingLabel="儲存中…">儲存</FormSubmitButton>
      </form>
      <form action="/api/account/delete" method="post" className="mt-12">
        <FormSubmitButton variant="danger" pendingLabel="處理中…">
          刪除帳號（不可逆）
        </FormSubmitButton>
      </form>
    </div>
  );
}
