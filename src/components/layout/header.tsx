import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { SITE_NAME } from "@/lib/constants";
import { isAdminEmail } from "@/lib/admin";
import { PLACEHOLDER_PRODUCT_IMAGE } from "@/lib/images";

export async function Header() {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  let displayName: string | null = null;
  if (user?.id) {
    const profile = await prisma.profile.findUnique({
      where: { id: user.id },
      select: { displayName: true },
    });
    displayName = profile?.displayName ?? null;
  }

  const isAdmin = isAdminEmail(user?.email ?? undefined);

  return (
    <header className="sticky top-0 z-50 border-b border-sky-200/70 bg-white/85 backdrop-blur-md dark:border-indigo-900/60 dark:bg-slate-950/85">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={PLACEHOLDER_PRODUCT_IMAGE}
            alt=""
            className="h-8 w-8 rounded-md ring-1 ring-sky-400/30"
            aria-hidden
          />
          <span className="bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent dark:from-sky-400 dark:to-indigo-400">
            {SITE_NAME}
          </span>
        </Link>
        <nav className="flex items-center gap-3 text-sm flex-wrap justify-end">
          <Link href="/listings" className="hover:underline">
            市集
          </Link>
          <Link href="/catalog" className="hover:underline hidden sm:inline">
            產品目錄／均價
          </Link>
          {user ? (
            <>
              <Link href="/listings/new" className="hover:underline">
                刊登
              </Link>
              <Link href="/messages" className="hover:underline">
                訊息
              </Link>
              <Link href="/dashboard" className="hover:underline">
                我的
              </Link>
              {isAdmin && (
                <Link href="/admin" className="text-amber-600 hover:underline">
                  管理
                </Link>
              )}
              <span className="text-zinc-500">{displayName}</span>
              <Link href="/api/auth/signout" className="hover:underline">
                登出
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:underline">
                登入
              </Link>
              <Link
                href="/register"
                className="bey-btn-primary rounded-full px-3 py-1"
              >
                註冊
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
