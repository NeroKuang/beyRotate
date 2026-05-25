import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";
import { PLACEHOLDER_PRODUCT_IMAGE } from "@/lib/images";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-sky-200/60 bg-white/70 py-10 text-sm text-zinc-600 backdrop-blur-sm dark:border-indigo-900/50 dark:bg-slate-950/70 dark:text-zinc-400">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={PLACEHOLDER_PRODUCT_IMAGE}
            alt=""
            className="mt-0.5 h-9 w-9 shrink-0 rounded-lg opacity-90"
            aria-hidden
          />
          <div>
            <p className="font-medium text-zinc-800 dark:text-zinc-200">{SITE_NAME}</p>
            <p className="mt-1 max-w-md text-xs leading-relaxed">
              戰鬥陀螺 X 玩家交易平台。平台不代收代付，請自行判斷交易風險。
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          <Link href="/terms" className="hover:text-sky-600 dark:hover:text-sky-400">
            服務條款
          </Link>
          <Link href="/privacy" className="hover:text-sky-600 dark:hover:text-sky-400">
            隱私權
          </Link>
          <Link href="/catalog" className="hover:text-sky-600 dark:hover:text-sky-400">
            產品目錄
          </Link>
          <a
            href="https://go-shoot.github.io/x/products/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-sky-600 dark:hover:text-sky-400"
          >
            產品資料來源
          </a>
        </div>
      </div>
      <p className="mx-auto mt-4 max-w-6xl px-4 text-xs text-zinc-500">
        產品目錄資料來自{" "}
        <a
          href="https://go-shoot.github.io/x/"
          className="underline decoration-sky-400/60 hover:text-sky-600"
          target="_blank"
          rel="noopener noreferrer"
        >
          go-shoot
        </a>{" "}
        非官方資訊站。與 Takara Tomy / Hasbro 無關。
      </p>
    </footer>
  );
}
