"use client";

import { compareProductCode } from "@/lib/catalog/sort-codes";

export function CodeIndex({
  codes,
  activeCode,
  onPick,
}: {
  codes: string[];
  activeCode?: string;
  onPick: (code: string) => void;
}) {
  const sorted = [...codes].sort(compareProductCode);

  return (
    <nav
      className="mb-6 rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 max-h-48 overflow-y-auto"
      aria-label="產品編號索引"
    >
      <p className="text-xs text-zinc-500 mb-2 sticky top-0 bg-white dark:bg-zinc-950 py-1">
        產品編號一覽（{sorted.length}）— 點擊跳轉
      </p>
      <div className="flex flex-wrap gap-1.5">
        {sorted.map((code) => (
          <a
            key={code}
            href={`#${code}`}
            onClick={(e) => {
              e.preventDefault();
              onPick(code);
              document.getElementById(code)?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className={`font-mono text-xs px-2 py-1 rounded-md border transition-colors ${
              activeCode === code
                ? "bg-zinc-900 text-white border-zinc-900"
                : "border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            {code}
          </a>
        ))}
      </div>
    </nav>
  );
}
