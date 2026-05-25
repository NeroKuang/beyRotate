import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

export default async function ExportPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const data = await prisma.listing.findMany({
    where: { userId: session.user.id },
    include: { items: true, images: true },
  });

  const json = JSON.stringify(data, null, 2);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">匯出我的刊登</h1>
      <pre className="text-xs overflow-auto rounded-lg border p-4 bg-zinc-50 dark:bg-zinc-900 max-h-[60vh]">
        {json}
      </pre>
    </div>
  );
}
