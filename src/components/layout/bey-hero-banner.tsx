import { BEY_HERO_IMAGE } from "@/lib/images";

type Props = {
  title: string;
  description?: React.ReactNode;
  children?: React.ReactNode;
};

export function BeyHeroBanner({ title, description, children }: Props) {
  return (
    <section className="relative mb-8 overflow-hidden rounded-2xl border border-sky-200/60 dark:border-indigo-900/60 bg-gradient-to-br from-sky-50 via-white to-amber-50/80 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/40">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={BEY_HERO_IMAGE}
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-90 dark:opacity-40"
      />
      <div className="relative px-6 py-8 sm:px-8 sm:py-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-sky-600 dark:text-sky-400 mb-2">
          Beyblade X
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">{title}</h1>
        {description && (
          <p className="text-zinc-600 dark:text-zinc-300 max-w-2xl text-sm sm:text-base">
            {description}
          </p>
        )}
        {children && <div className="mt-4">{children}</div>}
      </div>
    </section>
  );
}
