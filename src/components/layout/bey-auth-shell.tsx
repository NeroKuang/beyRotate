import Link from "next/link";
import { BEY_HERO_IMAGE } from "@/lib/images";
import { SITE_NAME } from "@/lib/constants";

type Props = {
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function BeyAuthShell({ title, children, footer }: Props) {
  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-10 sm:py-14">
      <Link
        href="/"
        className="mb-6 flex items-center justify-center gap-2 text-sm font-medium text-sky-600 dark:text-sky-400"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/placeholder-product.svg"
          alt=""
          className="h-7 w-7 rounded-md"
          aria-hidden
        />
        {SITE_NAME}
      </Link>
      <div className="bey-card relative overflow-hidden p-6 sm:p-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={BEY_HERO_IMAGE}
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-30 dark:opacity-20"
        />
        <div className="relative">
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-sky-600 dark:text-sky-400">
            Beyblade X
          </p>
          <h1 className="mb-6 text-2xl font-bold tracking-tight">{title}</h1>
          {children}
        </div>
      </div>
      {footer && (
        <p className="mt-6 text-center text-sm text-zinc-500">{footer}</p>
      )}
    </div>
  );
}
