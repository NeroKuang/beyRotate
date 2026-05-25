import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { startConversation } from "@/app/actions/messages";

export default async function NewMessagePage({
  searchParams,
}: {
  searchParams: Promise<{ to?: string; listing?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const params = await searchParams;
  const to = params.to;
  if (!to) redirect("/messages");

  const convoId = await startConversation(to, params.listing);
  redirect(`/messages/${convoId}`);
}
