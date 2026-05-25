"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="text-2xl font-bold mb-2">發生錯誤</h1>
      <p className="text-zinc-500 mb-6 text-sm">請稍後再試。</p>
      <button
        type="button"
        onClick={reset}
        className="rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2 text-sm"
      >
        重試
      </button>
    </div>
  );
}
