"use client";

import { useState, useRef } from "react";

export function TournamentPosterUploader({
  tournamentId,
  currentUrl,
}: {
  tournamentId: string;
  currentUrl?: string | null;
}) {
  const [url, setUrl] = useState(currentUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch(`/api/tournaments/${tournamentId}/poster`, {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "上傳失敗");
        return;
      }
      setUrl(data.url);
    } catch {
      setError("上傳失敗");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">宣傳圖</p>
      <p className="text-xs text-zinc-500">建議橫式圖，最大 5MB，會自動加上 BeyRotate 浮水印。</p>
      {url && (
        <div className="relative aspect-[16/9] max-w-md overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="宣傳圖" className="h-full w-full object-cover" />
        </div>
      )}
      <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-zinc-300 px-4 py-2 text-sm text-zinc-600 hover:border-emerald-500 dark:border-zinc-600">
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={handleUpload}
          disabled={uploading}
        />
        {uploading ? "上傳中…" : url ? "更換宣傳圖" : "上傳宣傳圖"}
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
